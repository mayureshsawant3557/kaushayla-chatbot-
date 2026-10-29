import os
import re
import time
import io
import subprocess
import requests
import soundfile as sf
import torch
from snac import SNAC

# Model and Binary Paths (Configuration & Auto-Discovery)
import glob

def _discover_llama_server() -> str:
    env_p = os.getenv("LLAMA_SERVER_PATH")
    if env_p and os.path.exists(env_p):
        return env_p
    matches = glob.glob(os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\WinGet\Packages\ggml.llamacpp_Microsoft.Winget.Source_*\llama-server.exe"))
    if matches and os.path.exists(matches[0]):
        return matches[0]
    return os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\WinGet\Packages\ggml.llamacpp_Microsoft.Winget.Source_8wekyb3d8bbwe\llama-server.exe")

def _discover_somya_gguf() -> str:
    env_p = os.getenv("SOMYA_GGUF_PATH")
    if env_p and os.path.exists(env_p):
        return env_p
    matches = glob.glob(os.path.expandvars(r"%USERPROFILE%\.cache\huggingface\hub\models--mradermacher--Somya-IndicTTS-GGUF\snapshots\*\*.gguf"))
    if matches and os.path.exists(matches[0]):
        return matches[0]
    return os.path.expandvars(r"%USERPROFILE%\.cache\huggingface\hub\models--mradermacher--Somya-IndicTTS-GGUF\snapshots\f6c93999626e525fa9a261bb3d3992da58864d55\Somya-IndicTTS.Q4_K_M.gguf")

LLAMA_SERVER_PATH = _discover_llama_server()
SOMYA_GGUF_PATH = _discover_somya_gguf()


SOMYA_PORT = int(os.getenv("SOMYA_PORT", "8008"))
SOMYA_HOST = "127.0.0.1"
SOMYA_SERVER_URL = f"http://{SOMYA_HOST}:{SOMYA_PORT}"

# Special Tokens from Somya-IndicTTS specification
START_OF_TEXT = 128000
END_OF_TEXT = 128009
START_OF_SPEECH = 128257
END_OF_SPEECH = 128258
START_OF_HUMAN = 128259
END_OF_HUMAN = 128260
START_OF_AI = 128261
AUDIO_TOKENS_START = 128266
PAD_TOKEN = 128004

_server_process = None
_snac_model = None
_device = "cuda" if torch.cuda.is_available() else "cpu"
_SOMYA_AUDIO_CACHE = {}


def get_snac_model():
    global _snac_model
    if _snac_model is None:
        print(f"[Somya-IndicTTS] Loading SNAC decoder (24kHz) on {_device}...")
        _snac_model = SNAC.from_pretrained("hubertsiuzdak/snac_24khz").to(_device).eval()
        print("[Somya-IndicTTS] SNAC decoder loaded successfully.")
    return _snac_model


_time_stretch_module = None


def get_time_stretch_module():
    global _time_stretch_module
    if _time_stretch_module is None:
        try:
            import torchaudio.transforms as T
            _time_stretch_module = T.TimeStretch(hop_length=256, n_freq=513).to(_device)
        except Exception as e:
            print(f"[Somya-IndicTTS] TimeStretch init warning: {e}")
            _time_stretch_module = False
    return _time_stretch_module if _time_stretch_module is not False else None


def is_server_running() -> bool:
    try:
        r = requests.get(f"{SOMYA_SERVER_URL}/health", timeout=1.0)
        return r.status_code == 200
    except Exception:
        return False


def ensure_somya_server_started():
    global _server_process
    if is_server_running():
        return True

    if not os.path.exists(LLAMA_SERVER_PATH):
        raise FileNotFoundError(f"llama-server.exe not found at {LLAMA_SERVER_PATH}")
    if not os.path.exists(SOMYA_GGUF_PATH):
        raise FileNotFoundError(f"Somya GGUF model not found at {SOMYA_GGUF_PATH}")

    print(f"[Somya-IndicTTS] Launching llama-server on port {SOMYA_PORT} with Vulkan0 GPU offload...")
    cmd = [
        LLAMA_SERVER_PATH,
        "-m", SOMYA_GGUF_PATH,
        "--port", str(SOMYA_PORT),
        "-c", "1024",
        "-dev", "Vulkan0",
        "-ngl", "99",
        "-np", "1",
        "--threads", "8"
    ]

    _server_process = subprocess.Popen(
        cmd,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0
    )

    # Wait up to 15 seconds for startup
    start_t = time.time()
    while time.time() - start_t < 15:
        if is_server_running():
            print("[Somya-IndicTTS] llama-server is online and ready.")
            return True
        time.sleep(0.5)

    raise RuntimeError("Failed to start llama-server for Somya-IndicTTS within 15 seconds.")


def decode_snac_tokens(audio_tokens: list[int], speed: float = 1.12) -> bytes:
    """Decodes hierarchical SNAC token sequences back into 24kHz WAV audio with optional pitch-preserving time stretch."""
    codes = [t - AUDIO_TOKENS_START for t in audio_tokens]
    if len(codes) < 7:
        return None

    remainder = len(codes) % 7
    if remainder != 0:
        codes = codes[:-remainder]

    num_frames = len(codes) // 7
    l0, l1, l2 = [], [], []
    for i in range(num_frames):
        idx = i * 7
        l0.append(codes[idx])
        l1.extend([codes[idx + 1] - 4096, codes[idx + 4] - 16384])
        l2.extend([
            codes[idx + 2] - 8192,
            codes[idx + 3] - 12288,
            codes[idx + 5] - 20480,
            codes[idx + 6] - 24576
        ])

    snac = get_snac_model()
    t0 = torch.tensor(l0, dtype=torch.long).unsqueeze(0).to(_device)
    t1 = torch.tensor(l1, dtype=torch.long).unsqueeze(0).to(_device)
    t2 = torch.tensor(l2, dtype=torch.long).unsqueeze(0).to(_device)

    with torch.no_grad():
        audio = snac.decode([t0, t1, t2])

    # Apply pitch-preserving TimeStretch if speed != 1.0 (target: 1.10x - 1.15x natural Marathi speed)
    if speed and 1.05 <= speed <= 1.4:
        ts = get_time_stretch_module()
        if ts is not None:
            try:
                audio_2d = audio.squeeze(1) if audio.ndim == 3 else audio
                if audio_2d.ndim == 1:
                    audio_2d = audio_2d.unsqueeze(0)
                n_fft = 1024
                hop_length = 256
                window = torch.hann_window(n_fft, device=_device)
                spec = torch.stft(audio_2d, n_fft=n_fft, hop_length=hop_length, window=window, return_complex=True)
                stretched_spec = ts(spec, float(speed))
                audio = torch.istft(stretched_spec, n_fft=n_fft, hop_length=hop_length, window=window, length=int(audio_2d.shape[-1] / speed))
            except Exception as e:
                print(f"[Somya-IndicTTS] TimeStretch error: {e}")

    audio_array = audio.detach().cpu().squeeze().numpy()

    buffer = io.BytesIO()
    sf.write(buffer, audio_array, 24000, format="WAV")
    return buffer.getvalue()


def synthesize_somya(text: str, language: str = "MR", speaker: str = "F", speed: float = 1.12) -> bytes:
    """
    Synthesizes speech using Somya-IndicTTS GGUF + SNAC.
    Returns: WAV audio bytes (24,000 Hz) with optional pitch-preserving speedup.
    """
    if not text or not text.strip():
        raise ValueError("Text cannot be empty")

    clean_text = text.strip()
    # Normalize language tag
    lang_upper = language.upper()
    if lang_upper in ("MR", "MARATHI"):
        lang_tag = "MR"
    elif lang_upper in ("HI", "HINDI"):
        lang_tag = "HI"
    elif lang_upper in ("EN", "ENGLISH"):
        # Somya is Indic, default English prompts to Hindi/Marathi phonetic
        lang_tag = "MR"
    else:
        lang_tag = lang_upper

    # Clean emojis, markdown, and noisy characters before prompting
    clean_text = re.sub(r'[\U00010000-\U0010ffff]', '', clean_text)
    clean_text = re.sub(r'[*_~`#|•]', '', clean_text)
    clean_text = re.sub(r'\s+', ' ', clean_text).strip()

    cache_key = f"somya:{lang_tag}:{speaker}:{speed}:{clean_text}"
    if cache_key in _SOMYA_AUDIO_CACHE:
        return _SOMYA_AUDIO_CACHE[cache_key]

    ensure_somya_server_started()

    # 1. Format prompt as expected by Somya-IndicTTS
    prompt_str = f"[{lang_tag}] [spk_{speaker}] {clean_text}"

    # 2. Tokenize prompt using llama-server tokenize endpoint
    r_tok = requests.post(
        f"{SOMYA_SERVER_URL}/tokenize",
        json={"content": prompt_str},
        timeout=10
    )
    if r_tok.status_code != 200:
        raise RuntimeError(f"Failed to tokenize prompt: {r_tok.text}")

    text_ids = r_tok.json().get("tokens", [])
    if not text_ids:
        raise RuntimeError("No tokens generated from prompt")

    full_input_ids = [START_OF_HUMAN] + text_ids + [END_OF_TEXT] + [END_OF_HUMAN] + [START_OF_AI] + [START_OF_SPEECH]

    # 3. Call llama-server completion endpoint to generate audio tokens
    # Realistic token budget: ~8.5 tokens per character (max 600 tokens for sentence chunks), avoiding runaway token allocations
    predicted_tokens = min(600, max(140, int(len(clean_text) * 8.5)))

    t0 = time.perf_counter()
    resp = requests.post(
        f"{SOMYA_SERVER_URL}/completion",
        json={
            "prompt": full_input_ids,
            "n_predict": predicted_tokens,
            "temperature": 0.65,
            "top_p": 0.90,
            "top_k": 80,
            "repeat_penalty": 1.1,
            "stop": ["<custom_token_2>", "<|end_of_text|>", "<|eot_id|>", "<|end_of_speech|>"]
        },
        timeout=65
    )


    if resp.status_code != 200:
        raise RuntimeError(f"Somya generation failed ({resp.status_code}): {resp.text}")

    raw_content = resp.json().get("content", "")
    tokens_str = re.findall(r'<custom_token_(\d+)>', raw_content)

    audio_tokens = []
    for tok_s in tokens_str:
        t_id = 128256 + int(tok_s)
        if t_id == END_OF_SPEECH:
            break
        if t_id >= AUDIO_TOKENS_START:
            audio_tokens.append(t_id)

    if not audio_tokens:
        raise RuntimeError("No valid audio tokens received from Somya-IndicTTS")

    wav_bytes = decode_snac_tokens(audio_tokens, speed=speed)
    if not wav_bytes:
        raise RuntimeError("Failed to decode SNAC tokens to audio")

    elapsed = time.perf_counter() - t0
    print(f"[Somya-IndicTTS] Generated {len(audio_tokens)} tokens in {elapsed:.2f}s, wav size: {len(wav_bytes)} bytes")

    if len(_SOMYA_AUDIO_CACHE) < 200:
        _SOMYA_AUDIO_CACHE[cache_key] = wav_bytes

    return wav_bytes
