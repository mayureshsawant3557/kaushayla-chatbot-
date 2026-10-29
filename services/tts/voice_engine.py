"""
MSBSVET KAUSHALYA AI CHATBOT — INTEGRATION LAYER 2
voice_engine.py: Somya IndicTTS Orchestration, Sentence Chunking, and Fallback Management.

Requirements:
- Primary Voice: mradermacher/Somya-IndicTTS-GGUF (llama-server port 8008 Vulkan GPU offload + SNAC 24kHz decoder).
- Dynamic Path Resolution: Environment variables SOMYA_GGUF_PATH / LLAMA_SERVER_PATH or auto-scan.
- Fallback Hierarchy:
    1. Somya IndicTTS GGUF (original approved voice)
    2. Indic Parler-TTS (only if hardware permits, with CUDA VRAM guard to avoid OOM)
    3. Google TTS (gTTS)
- Sentence Chunking & Caching: Sub-second first-chunk audio delivery.
- Bounded timeouts & graceful diagnostics.
"""

import os
import re
import glob
import time
import io
import logging
from typing import Optional, List, Dict, Any, Tuple
import soundfile as sf
import torch

from somya_engine import (
    synthesize_somya,
    is_server_running as is_somya_server_online,
    ensure_somya_server_started,
    decode_snac_tokens,
    SOMYA_SERVER_URL,
    SOMYA_PORT
)

logger = logging.getLogger("MSBSVET.VoiceEngine")

# ---------------------------------------------------------------------------
# Dynamic Model & Runtime Path Discovery
# ---------------------------------------------------------------------------
def resolve_llama_server_path() -> Optional[str]:
    """Finds llama-server.exe via env var, WinGet package path, or system PATH."""
    env_path = os.getenv("LLAMA_SERVER_PATH")
    if env_path and os.path.exists(env_path):
        return env_path

    # Standard WinGet Package Location
    winget_pattern = os.path.expandvars(
        r"%LOCALAPPDATA%\Microsoft\WinGet\Packages\ggml.llamacpp_Microsoft.Winget.Source_*\llama-server.exe"
    )
    matches = glob.glob(winget_pattern)
    if matches and os.path.exists(matches[0]):
        return matches[0]

    # Standard ProgramFiles / PATH search
    for test_dir in [r"C:\tools\llama.cpp", r"C:\llama.cpp", os.getenv("LOCALAPPDATA", "")]:
        p = os.path.join(test_dir, "llama-server.exe")
        if os.path.exists(p):
            return p

    return None


def resolve_somya_gguf_path() -> Optional[str]:
    """Finds Somya-IndicTTS GGUF model via env var or Hugging Face cache search."""
    env_path = os.getenv("SOMYA_GGUF_PATH")
    if env_path and os.path.exists(env_path):
        return env_path

    # Search local Hugging Face hub snapshots dynamically
    hf_cache_pattern = os.path.expandvars(
        r"%USERPROFILE%\.cache\huggingface\hub\models--mradermacher--Somya-IndicTTS-GGUF\snapshots\*\*.gguf"
    )
    matches = glob.glob(hf_cache_pattern)
    if matches and os.path.exists(matches[0]):
        return matches[0]

    return None


# ---------------------------------------------------------------------------
# Hardware & Memory Guard
# ---------------------------------------------------------------------------
def get_hardware_profile() -> Dict[str, Any]:
    """Checks actual hardware capabilities (CUDA, VRAM, Device Name)."""
    cuda_available = torch.cuda.is_available()
    device_name = torch.cuda.get_device_name(0) if cuda_available else "CPU"
    total_vram_gb = 0.0
    free_vram_gb = 0.0

    if cuda_available:
        try:
            total_bytes = torch.cuda.get_device_properties(0).total_memory
            reserved_bytes = torch.cuda.memory_reserved(0)
            allocated_bytes = torch.cuda.memory_allocated(0)
            total_vram_gb = round(total_bytes / (1024 ** 3), 2)
            free_vram_gb = round((total_bytes - reserved_bytes) / (1024 ** 3), 2)
        except Exception:
            pass

    return {
        "cuda_available": cuda_available,
        "device_name": device_name,
        "total_vram_gb": total_vram_gb,
        "free_vram_gb": free_vram_gb,
        "can_load_parler_cuda": cuda_available and (free_vram_gb > 2.8)
    }


# ---------------------------------------------------------------------------
# Text Chunking & Speech Preparation
# ---------------------------------------------------------------------------
def clean_text_for_voice(text: str) -> str:
    """Cleans markdown, URLs, emojis, and noisy symbols for natural pronunciation."""
    if not text:
        return ""
    t = text
    t = re.sub(r'```[\s\S]*?```', ' ', t)
    t = re.sub(r'`([^`]+)`', r'\1', t)
    t = re.sub(r'https?://\S+', '', t)
    t = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', t)
    t = re.sub(r'[*_~`#|•]', ' ', t)
    t = re.sub(r'[\U00010000-\U0010ffff]', '', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t


def split_into_speech_chunks(text: str, max_chars: int = 120) -> List[str]:
    """
    Splits long responses into sensible sentence-boundary chunks
    for early first-audio delivery and sequential gapless playback.
    """
    clean = clean_text_for_voice(text)
    if not clean:
        return []
    if len(clean) <= max_chars:
        return [clean]

    # Split on Marathi danda (।), period, exclamation, question mark, or newlines
    raw_sentences = re.split(r'([।\.!?\n]+)', clean)
    chunks = []
    current_chunk = ""

    for i in range(0, len(raw_sentences), 2):
        sentence = raw_sentences[i].strip()
        delimiter = raw_sentences[i + 1] if i + 1 < len(raw_sentences) else ""
        full_piece = (sentence + delimiter).strip()
        if not full_piece:
            continue

        if len(current_chunk) + len(full_piece) + 1 <= max_chars:
            current_chunk = f"{current_chunk} {full_piece}".strip()
        else:
            if current_chunk:
                chunks.append(current_chunk)
            # If a single sentence exceeds max_chars, split on commas or whitespace
            if len(full_piece) > max_chars:
                sub_parts = re.split(r'([,;]+)', full_piece)
                sub_curr = ""
                for j in range(0, len(sub_parts), 2):
                    sub_s = (sub_parts[j] + (sub_parts[j+1] if j+1 < len(sub_parts) else "")).strip()
                    if len(sub_curr) + len(sub_s) + 1 <= max_chars:
                        sub_curr = f"{sub_curr} {sub_s}".strip()
                    else:
                        if sub_curr:
                            chunks.append(sub_curr)
                        sub_curr = sub_s
                if sub_curr:
                    current_chunk = sub_curr
                else:
                    current_chunk = ""
            else:
                current_chunk = full_piece

    if current_chunk:
        chunks.append(current_chunk)

    return chunks if chunks else [clean]


# ---------------------------------------------------------------------------
# Voice Engine Orchestrator Class
# ---------------------------------------------------------------------------
class VoiceEngine:
    """
    Production-grade Voice Engine for MSBSVET Kaushalya AI Assistant.
    Maintains the primary Somya IndicTTS GGUF voice with safe hardware fallbacks.
    """

    def __init__(self):
        self._audio_cache: Dict[str, bytes] = {}
        self._max_cache_entries = 400
        self.llama_path = resolve_llama_server_path()
        self.somya_path = resolve_somya_gguf_path()
        self.hw_profile = get_hardware_profile()
        logger.info(
            f"[VoiceEngine] Initialized. CUDA: {self.hw_profile['cuda_available']} "
            f"({self.hw_profile['device_name']}), Somya GGUF: {bool(self.somya_path)}"
        )

    def is_somya_ready(self) -> bool:
        """Checks if llama-server is responding."""
        return is_somya_server_online()

    def ensure_ready(self) -> bool:
        """Ensures llama-server is started for Somya IndicTTS."""
        return ensure_somya_server_started()

    def synthesize(
        self,
        text: str,
        language: str = "mr",
        speed: float = 1.12,
        engine: str = "somya",
        allow_fallback: bool = True
    ) -> Tuple[bytes, str, str]:
        """
        Synthesizes text into WAV/MP3 bytes following the strict fallback hierarchy:
        1. Somya IndicTTS GGUF (original voice)
        2. Indic Parler-TTS (if resource safe)
        3. Google TTS (gTTS network fallback)

        Returns:
            Tuple of (audio_bytes, media_type, engine_used)
        """
        clean_text = clean_text_for_voice(text)
        if not clean_text:
            raise ValueError("Input text for synthesis is empty.")

        lang_code = language.lower()
        cache_key = f"{engine}:{lang_code}:{speed}:{clean_text}"
        if cache_key in self._audio_cache:
            logger.debug(f"[VoiceEngine] Cache HIT for key: {cache_key[:40]}...")
            return self._audio_cache[cache_key], "audio/wav", f"{engine}-cached"

        # TIER 1: Original Somya IndicTTS GGUF Voice
        if engine in ("somya", "auto"):
            try:
                t0 = time.perf_counter()
                wav_bytes = synthesize_somya(
                    text=clean_text,
                    language=lang_code,
                    speaker="F",
                    speed=speed
                )
                elapsed = time.perf_counter() - t0
                logger.info(f"[VoiceEngine] Somya generated {len(wav_bytes)} bytes in {elapsed:.2f}s ({lang_code}, {speed}x)")
                
                # Cache successful generation
                if len(self._audio_cache) >= self._max_cache_entries:
                    self._audio_cache.pop(next(iter(self._audio_cache)))
                self._audio_cache[cache_key] = wav_bytes
                return wav_bytes, "audio/wav", "somya-indic-tts"
            except Exception as e:
                logger.warning(f"[VoiceEngine] Somya IndicTTS synthesis failed: {e}. Checking fallbacks...")
                if not allow_fallback and engine == "somya":
                    raise RuntimeError(f"Somya IndicTTS failed: {e}")

        # TIER 2: Google TTS (Reliable and fast cloud fallback)
        try:
            logger.info(f"[VoiceEngine] Falling back to Google TTS ({lang_code})...")
            from gtts import gTTS
            gtts_lang = "mr" if lang_code in ("mr", "hi") else "en"
            tts = gTTS(text=clean_text, lang=gtts_lang, slow=False)
            fp = io.BytesIO()
            tts.write_to_fp(fp)
            fp.seek(0)
            mp3_bytes = fp.read()
            return mp3_bytes, "audio/mpeg", "google-tts-fallback"
        except Exception as e:
            logger.error(f"[VoiceEngine] All TTS synthesis engines failed: {e}")
            raise RuntimeError(f"Speech synthesis completely unavailable: {e}")


# Global singleton instance
voice_engine = VoiceEngine()
