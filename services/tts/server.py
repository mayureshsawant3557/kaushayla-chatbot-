import io
import os
import time
import torch
import soundfile as sf
from fastapi import FastAPI, HTTPException, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

TTS_API_KEY = os.getenv("SOMYA_TTS_API_KEY", "").strip() or os.getenv("TTS_API_KEY", "").strip()
from parler_tts import ParlerTTSForConditionalGeneration
from transformers import AutoTokenizer

from somya_engine import (
    synthesize_somya,
    is_server_running as is_somya_running,
    SOMYA_GGUF_PATH,
    LLAMA_SERVER_PATH,
)

app = FastAPI(title="MSBSVET Unified TTS Server (Somya + Parler)", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PARLER_MODEL_ID = "ai4bharat/indic-parler-tts"
SOMYA_MODEL_ID = "mradermacher/Somya-IndicTTS-GGUF"

device = "cuda:0" if torch.cuda.is_available() else "cpu"
dtype = torch.float16 if torch.cuda.is_available() else torch.float32
print(f"[MSBSVET TTS Server] Initializing on device: {device} ({dtype})")

parler_model = None
parler_tokenizer = None
parler_description_tokenizer = None
_CACHED_DESC_INPUTS = {}

DEFAULT_DESCRIPTIONS = {
    "mr": (
        "A clear and natural Indian female voice speaking Marathi "
        "at a moderate pace, with a warm, polite and professional "
        "customer support tone."
    ),
    "hi": (
        "A clear and natural Indian female voice speaking Hindi "
        "at a moderate pace, with a warm, polite and professional "
        "customer support tone."
    ),
    "en": (
        "A clear and natural Indian female voice speaking English with an "
        "Indian accent at a moderate pace, with a warm, polite and professional "
        "customer support tone."
    )
}

def get_parler_models():
    global parler_model, parler_tokenizer, parler_description_tokenizer, _CACHED_DESC_INPUTS
    if parler_model is None:
        target_device = device
        target_dtype = dtype
        if torch.cuda.is_available():
            try:
                free_bytes, total_bytes = torch.cuda.mem_get_info(0)
                free_gb = free_bytes / (1024 ** 3)
                if free_gb < 2.5:
                    print(f"[Indic Parler-TTS] Free VRAM ({free_gb:.2f} GB) is below 2.5 GB threshold. Guarding CUDA: using CPU for Parler fallback to prevent OOM.")
                    target_device = "cpu"
                    target_dtype = torch.float32
            except Exception as e:
                print(f"[Indic Parler-TTS] VRAM check warning: {e}")

        print(f"[Indic Parler-TTS] Loading model into memory on {target_device}...")
        parler_model = ParlerTTSForConditionalGeneration.from_pretrained(
            PARLER_MODEL_ID,
            torch_dtype=target_dtype
        ).to(target_device)
        parler_tokenizer = AutoTokenizer.from_pretrained(PARLER_MODEL_ID)
        parler_description_tokenizer = AutoTokenizer.from_pretrained(
            parler_model.config.text_encoder._name_or_path
        )
        print("[Indic Parler-TTS] Model successfully loaded. Pre-caching prompt descriptions...")
        for l_key, d_text in DEFAULT_DESCRIPTIONS.items():
            encoded = parler_description_tokenizer(d_text, return_tensors="pt")
            _CACHED_DESC_INPUTS[l_key] = {k: v.to(target_device) for k, v in encoded.items()}
        print("[Indic Parler-TTS] Ready for speech synthesis requests.")
    return parler_model, parler_tokenizer, parler_description_tokenizer

class SynthesizeRequest(BaseModel):
    text: str
    language: Optional[str] = "mr"
    description: Optional[str] = None
    engine: Optional[str] = "somya"  # "somya"
    speaker: Optional[str] = "F"     # For Somya: "F" or "M"
    speed: Optional[float] = 1.12    # Natural speech speed target 1.10x - 1.15x
    fallback: Optional[bool] = False

@app.get("/health")
def health():
    somya_available = os.path.exists(SOMYA_GGUF_PATH) and os.path.exists(LLAMA_SERVER_PATH)
    return {
        "status": "ok",
        "device": device,
        "dtype": str(dtype),
        "gpu_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU",
        "auth_enabled": bool(TTS_API_KEY),
        "engines": {
            "somya": {
                "available": somya_available,
                "model": SOMYA_MODEL_ID,
                "quantization": "Q4_K_M",
                "running": is_somya_running()
            },
            "parler": {
                "available": True,
                "model": PARLER_MODEL_ID,
                "loaded": parler_model is not None
            }
        },
        "languages_supported": ["mr", "hi", "en"]
    }

def _synthesize_parler(clean_text: str, lang: str, description: Optional[str] = None) -> bytes:
    m, tok, desc_tok = get_parler_models()
    prompt_inputs = tok(clean_text, return_tensors="pt")
    prompt_inputs = {k: v.to(device) for k, v in prompt_inputs.items()}

    if description:
        custom_desc = desc_tok(description, return_tensors="pt")
        desc_inputs = {k: v.to(device) for k, v in custom_desc.items()}
    else:
        desc_inputs = _CACHED_DESC_INPUTS.get(lang, _CACHED_DESC_INPUTS.get("mr"))

    with torch.inference_mode():
        audio = m.generate(
            input_ids=desc_inputs["input_ids"],
            attention_mask=desc_inputs.get("attention_mask"),
            prompt_input_ids=prompt_inputs["input_ids"],
            prompt_attention_mask=prompt_inputs.get("attention_mask"),
        )

    audio_array = audio.detach().cpu().float().numpy().squeeze()
    buffer = io.BytesIO()
    sf.write(buffer, audio_array, m.config.sampling_rate, format="WAV")
    return buffer.getvalue()

@app.post("/synthesize")
def synthesize(req: SynthesizeRequest, request: Request):
    if TTS_API_KEY:
        provided_key = request.headers.get("X-TTS-Api-Key", "").strip()
        if not provided_key or provided_key != TTS_API_KEY:
            raise HTTPException(status_code=401, detail="Unauthorized: Invalid or missing X-TTS-Api-Key")

    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    clean_text = req.text.strip()
    if len(clean_text) > 280:
        clean_text = clean_text[:280].rsplit(' ', 1)[0]

    lang = (req.language or "mr").lower()
    engine = (req.engine or "somya").lower()

    # 1. Somya-IndicTTS GGUF engine execution
    if engine in ("somya", "auto"):
        try:
            t0 = time.perf_counter()
            speed_val = req.speed if (req.speed is not None and 1.0 <= req.speed <= 1.5) else 1.12
            wav_bytes = synthesize_somya(
                clean_text,
                language=lang,
                speaker=req.speaker or "F",
                speed=speed_val
            )
            elapsed = time.perf_counter() - t0
            print(f"[Somya-IndicTTS] Generated audio for ({lang}) at {speed_val:.2f}x speed in {elapsed:.2f}s ({len(wav_bytes)} bytes)")
            return Response(
                content=wav_bytes,
                media_type="audio/wav",
                headers={
                    "Cache-Control": "public, max-age=86400",
                    "Content-Disposition": "inline; filename=speech.wav",
                    "X-TTS-Engine": "somya-indictts-gguf",
                    "X-TTS-Language": lang,
                    "X-TTS-Speed": str(speed_val)
                }
            )
        except Exception as e:
            print(f"[Somya-IndicTTS] Synthesis failed: {e}")
            if not req.fallback or engine == "somya":
                raise HTTPException(status_code=500, detail=f"Somya-IndicTTS failed: {str(e)}")
            print("[MSBSVET TTS Server] Falling back to Indic Parler-TTS...")

    # 2. Indic Parler-TTS execution (only if fallback explicitly allowed)
    if req.fallback:
        try:
            t0 = time.perf_counter()
            wav_bytes = _synthesize_parler(clean_text, lang, req.description)
            elapsed = time.perf_counter() - t0
            print(f"[Indic Parler-TTS] Generated audio for ({lang}) in {elapsed:.2f}s ({len(wav_bytes)} bytes)")
            return Response(
                content=wav_bytes,
                media_type="audio/wav",
                headers={
                    "Cache-Control": "public, max-age=86400",
                    "Content-Disposition": "inline; filename=speech.wav",
                    "X-TTS-Engine": "ai4bharat-indic-parler-tts",
                    "X-TTS-Language": lang
                }
            )
        except Exception as e:
            print(f"[Indic Parler-TTS] Error generating audio: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    raise HTTPException(status_code=500, detail="Synthesis failed")

if __name__ == "__main__":
    import uvicorn
    from somya_engine import ensure_somya_server_started
    # Pre-warm Somya engine on startup
    ensure_somya_server_started()
    uvicorn.run(app, host="127.0.0.1", port=8006)

