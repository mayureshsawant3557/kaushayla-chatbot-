import io
import re
import logging
import requests
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from gtts import gTTS

from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()

# In-memory audio cache for sub-5ms response on repeated prompts
_AUDIO_CACHE: dict[str, tuple[bytes, str]] = {}
_MAX_CACHE_SIZE = 400


def get_tts_service_config() -> tuple[str, dict, tuple[float, float]]:
    """Resolves Somya TTS target endpoint, auth headers, and bounded timeouts."""
    base_url = settings.effective_tts_url
    api_key = (getattr(settings, "SOMYA_TTS_API_KEY", "") or "").strip()
    connect_to = float(getattr(settings, "TTS_CONNECT_TIMEOUT_SEC", 3.5))
    read_to = float(getattr(settings, "TTS_READ_TIMEOUT_SEC", 30.0))
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["X-TTS-Api-Key"] = api_key
    return base_url, headers, (connect_to, read_to)


class TTSRequest(BaseModel):
    text: str
    language: Optional[str] = "mr"
    voice: Optional[str] = None
    engine: Optional[str] = getattr(settings, "DEFAULT_TTS_ENGINE", "somya")
    chunk_index: Optional[int] = None
    speed: Optional[float] = 1.12
    allow_fallback: Optional[bool] = False


class ChunksRequest(BaseModel):
    text: str
    language: Optional[str] = "mr"
    max_chars: Optional[int] = 140


def clean_markdown_for_speech(text: str) -> str:
    """
    Strip markdown formatting, URLs, and noisy syntax so the voice assistant
    speaks pure, natural words while preserving the exact original message.
    """
    # Remove HTML tags
    t = re.sub(r'<[^>]+>', ' ', text)
    # Convert markdown links [title](url) -> title
    t = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', t)
    # Remove raw URLs
    t = re.sub(r'https?://\S+', '', t)
    # Remove markdown bold/italics/strikethrough/code markers
    t = re.sub(r'[*_~`#]', '', t)
    # Remove bullet symbols at start of lines
    t = re.sub(r'^[•\-\d+\.]\s*', '', t, flags=re.MULTILINE)
    # Remove excess whitespace and newlines
    t = re.sub(r'\s+', ' ', t).strip()
    return t


def split_text_into_speech_chunks(text: str, max_chars: int = 140) -> List[str]:
    """
    Split long answers into sensible sentence-based chunks to ensure
    safe generation within model sequence limits and enable sequential playback.
    """
    clean = clean_markdown_for_speech(text)
    if not clean:
        return [text]

    # Split on sentence boundaries: Marathi/Hindi danda (।), period, question mark, exclamation, colon, semicolon, or newline
    raw_sentences = re.split(r'([।\.!?\n:;]+)', clean)
    sentences = []
    
    # Recombine delimiters with sentence parts
    temp = ""
    for part in raw_sentences:
        if not part:
            continue
        temp += part
        if re.search(r'[।\.!?\n:;]', part):
            s = temp.strip()
            if s:
                sentences.append(s)
            temp = ""
    if temp.strip():
        sentences.append(temp.strip())

    if not sentences:
        sentences = [clean]

    # Prioritize first sentence as standalone Chunk 0 for ultra-fast Time to First Audio
    chunks: List[str] = []
    remaining_sentences = sentences
    if len(sentences) > 1 and len(sentences[0]) <= max_chars:
        chunks.append(sentences[0])
        remaining_sentences = sentences[1:]

    current_chunk = ""
    for s in remaining_sentences:
        # If a single sentence is exceedingly long, break it by commas or spaces
        if len(s) > max_chars:
            words = s.split(' ')
            sub_chunk = ""
            for w in words:
                if len(sub_chunk) + len(w) + 1 <= max_chars:
                    sub_chunk = f"{sub_chunk} {w}".strip()
                else:
                    if sub_chunk:
                        chunks.append(sub_chunk)
                    sub_chunk = w
            if sub_chunk:
                chunks.append(sub_chunk)
            continue

        if len(current_chunk) + len(s) + 1 <= max_chars:
            current_chunk = f"{current_chunk} {s}".strip()
        else:
            if current_chunk:
                chunks.append(current_chunk)
            current_chunk = s

    if current_chunk:
        chunks.append(current_chunk)

    return chunks if chunks else [clean[:max_chars]]


@router.get("/status")
def tts_status():
    """Check connectivity to configured Somya TTS service and Google TTS availability."""
    tts_url, tts_headers, _ = get_tts_service_config()
    parler_available = False
    somya_available = False
    server_engines = {}
    gpu_name = None
    has_api_key = bool(settings.SOMYA_TTS_API_KEY.strip() if getattr(settings, "SOMYA_TTS_API_KEY", None) else False)

    try:
        r = requests.get(f"{tts_url}/health", headers=tts_headers, timeout=(2.0, 4.0))
        if r.status_code == 200:
            data = r.json()
            gpu_name = data.get("gpu_name")
            server_engines = data.get("engines", {})
            somya_available = server_engines.get("somya", {}).get("available", False)
            parler_available = server_engines.get("parler", {}).get("available", True)
    except Exception:
        parler_available = False
        somya_available = False

    return {
        "status": "ok",
        "default_engine": getattr(settings, "DEFAULT_TTS_ENGINE", "somya"),
        "engines": {
            "somya": somya_available,
            "parler": parler_available,
            "google": True
        },
        "details": {
            "tts_url": tts_url,
            "auth_configured": has_api_key,
            "gpu": gpu_name,
            "server_engines": server_engines
        },
        "supported_languages": ["mr", "hi", "en"]
    }


@router.post("/chunks")
def get_speech_chunks(req: ChunksRequest):
    """Split text into sentence-based chunks for frontend sequential playback."""
    chunks = split_text_into_speech_chunks(req.text, max_chars=req.max_chars or 250)
    return {
        "chunks": chunks,
        "count": len(chunks)
    }


@router.post("/")
async def text_to_speech(req: TTSRequest):
    """
    Generate audio for Marathi, Hindi, and English speech.
    Supports engine selection:
      - 'somya': Somya-IndicTTS GGUF + SNAC 24kHz (port 8006)
      - 'parler': AI4Bharat Indic Parler-TTS (port 8006)
      - 'google': Google gTTS
      - 'auto': Somya -> Parler -> Google fallback
    """
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    raw_text = req.text.strip()
    speech_chunks = split_text_into_speech_chunks(raw_text, max_chars=140)

    # Determine which chunk to synthesize
    if req.chunk_index is not None and 0 <= req.chunk_index < len(speech_chunks):
        target_text = speech_chunks[req.chunk_index]
        active_chunk_index = req.chunk_index
    elif req.chunk_index is not None and req.chunk_index >= len(speech_chunks):
        raise HTTPException(status_code=400, detail="chunk_index out of bounds")
    else:
        # When chunk_index is not specified, synthesize the provided text without dropping sentences
        target_text = raw_text
        active_chunk_index = 0

    total_chunks = len(speech_chunks)

    # Language normalization: 'mr' (Marathi), 'hi' (Hindi), 'en' (English)
    lang = (req.language or "mr").lower()
    has_devanagari = bool(re.search(r'[\u0900-\u097F]', target_text))

    if lang in ("mr", "marathi", "mr-in"):
        tts_lang = "mr"
        tts_tld = "com"
    elif lang in ("hi", "hindi", "hi-in"):
        tts_lang = "hi"
        tts_tld = "co.in"
    elif lang in ("en", "english", "en-in", "en-us"):
        tts_lang = "en"
        tts_tld = "co.in"
    else:
        tts_lang = "mr" if has_devanagari else "en"
        tts_tld = "com" if has_devanagari else "co.in"

    # Authoritative engine determination by language:
    # - Marathi (mr) -> Somya IndicTTS GGUF (dedicated neural voice)
    # - English (en) -> Google Indic English (Indian English phonology)
    # - Hindi (hi)   -> Google Indic Hindi (Hindi phonology)
    if tts_lang == "en":
        engine = "google-en-indic"
    elif tts_lang == "hi":
        engine = "google-hi-indic"
    else:
        engine = (req.engine or getattr(settings, "DEFAULT_TTS_ENGINE", "somya")).lower()
        if engine == "gtts":
            engine = "google"

    speed = float(req.speed) if (req.speed is not None and 1.0 <= req.speed <= 1.5) else 1.12
    cache_key = f"{engine}:{tts_lang}:{speed}:{target_text}"
    if cache_key in _AUDIO_CACHE:
        cached_data, mime = _AUDIO_CACHE[cache_key]
        return Response(
            content=cached_data,
            media_type=mime,
            headers={
                "Cache-Control": "public, max-age=86400",
                "Content-Disposition": f"inline; filename=speech.{'wav' if 'wav' in mime else 'mp3'}",
                "X-TTS-Engine": "somya-indictts-gguf" if engine == "somya" else engine,
                "X-TTS-Provider": "somya" if engine == "somya" else ("google-indic-hi" if engine == "google-hi-indic" else "google-indic-en"),
                "X-TTS-Model": "Somya-IndicTTS.Q4_K_M.gguf" if engine == "somya" else ("gTTS-hi-IN" if engine == "google-hi-indic" else "gTTS-en-IN"),
                "X-TTS-Audio-Spec": "24kHz-mono-wav" if "wav" in mime else "mp3-audio",
                "X-TTS-Speed": str(speed),
                "X-Total-Chunks": str(total_chunks),
                "X-Chunk-Index": str(active_chunk_index)
            }
        )

    # Dedicated English Voice Routing:
    # Somya-IndicTTS GGUF is specifically trained for Marathi. Sending English text to Somya produces garbled
    # or distorted speech. English speech must use a dedicated English engine with Indian English pronunciation.
    if tts_lang == "en":
        try:
            logger.info(f"Synthesizing English via Google Indic TTS (en, tld=co.in): {target_text[:40]}...")
            tts = gTTS(text=target_text, lang="en", tld="co.in", slow=False)
            audio_stream = io.BytesIO()
            tts.write_to_fp(audio_stream)
            audio_bytes = audio_stream.getvalue()
            if not audio_bytes:
                raise HTTPException(status_code=500, detail="No audio generated by English TTS engine")
            mime = "audio/mpeg"
            if len(_AUDIO_CACHE) < _MAX_CACHE_SIZE:
                _AUDIO_CACHE[cache_key] = (audio_bytes, mime)
            return Response(
                content=audio_bytes,
                media_type=mime,
                headers={
                    "Cache-Control": "public, max-age=86400",
                    "Content-Disposition": "inline; filename=speech.mp3",
                    "X-TTS-Engine": "google-en-indic",
                    "X-TTS-Provider": "google-indic-en",
                    "X-TTS-Model": "gTTS-en-IN",
                    "X-TTS-Audio-Spec": "mp3-audio",
                    "X-TTS-Fallback": "false",
                    "X-TTS-Speed": str(speed),
                    "X-Total-Chunks": str(total_chunks),
                    "X-Chunk-Index": str(active_chunk_index)
                }
            )
        except Exception as e:
            logger.error(f"English TTS synthesis error: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"English TTS error: {str(e)}")

    # Dedicated Hindi Voice Routing:
    # Hindi speech uses Google Indic Hindi (gTTS hi, tld=co.in) to guarantee accurate Hindi phonology,
    # reserving Somya-IndicTTS GGUF strictly as the dedicated neural voice for Marathi.
    if tts_lang == "hi":
        try:
            logger.info(f"Synthesizing Hindi via Google Indic TTS (hi, tld=co.in): {target_text[:40]}...")
            tts = gTTS(text=target_text, lang="hi", tld="co.in", slow=False)
            audio_stream = io.BytesIO()
            tts.write_to_fp(audio_stream)
            audio_bytes = audio_stream.getvalue()
            if not audio_bytes:
                raise HTTPException(status_code=500, detail="No audio generated by Hindi TTS engine")
            mime = "audio/mpeg"
            if len(_AUDIO_CACHE) < _MAX_CACHE_SIZE:
                _AUDIO_CACHE[cache_key] = (audio_bytes, mime)
            return Response(
                content=audio_bytes,
                media_type=mime,
                headers={
                    "Cache-Control": "public, max-age=86400",
                    "Content-Disposition": "inline; filename=speech.mp3",
                    "X-TTS-Engine": "google-hi-indic",
                    "X-TTS-Provider": "google-indic-hi",
                    "X-TTS-Model": "gTTS-hi-IN",
                    "X-TTS-Audio-Spec": "mp3-audio",
                    "X-TTS-Fallback": "false",
                    "X-TTS-Speed": str(speed),
                    "X-Total-Chunks": str(total_chunks),
                    "X-Chunk-Index": str(active_chunk_index)
                }
            )
        except Exception as e:
            logger.error(f"Hindi TTS synthesis error: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Hindi TTS error: {str(e)}")

    # 1. Somya-IndicTTS GGUF engine execution (Authoritative Voice for Marathi)
    somya_failure_reason = None
    tts_url, tts_headers, tts_timeout = get_tts_service_config()

    if engine in ("somya", "auto"):
        try:
            logger.info(f"Synthesizing Marathi via Somya-IndicTTS ({tts_lang}, {speed}x) at {tts_url}...")
            resp = requests.post(
                f"{tts_url}/synthesize",
                json={
                    "text": target_text,
                    "language": tts_lang,
                    "engine": "somya",
                    "speed": speed,
                    "fallback": False
                },
                headers=tts_headers,
                timeout=tts_timeout
            )

            if resp.status_code == 200 and resp.content:
                audio_bytes = resp.content
                mime = "audio/wav"
                if len(_AUDIO_CACHE) < _MAX_CACHE_SIZE:
                    _AUDIO_CACHE[cache_key] = (audio_bytes, mime)
                return Response(
                    content=audio_bytes,
                    media_type=mime,
                    headers={
                        "Cache-Control": "public, max-age=86400",
                        "Content-Disposition": "inline; filename=speech.wav",
                        "X-TTS-Engine": "somya-indictts-gguf",
                        "X-TTS-Provider": "somya",
                        "X-TTS-Model": "Somya-IndicTTS.Q4_K_M.gguf",
                        "X-TTS-Audio-Spec": "24kHz-mono-wav",
                        "X-TTS-Fallback": "false",
                        "X-TTS-Speed": str(speed),
                        "X-Total-Chunks": str(total_chunks),
                        "X-Chunk-Index": str(active_chunk_index)
                    }
                )
            elif resp.status_code in (401, 403):
                somya_failure_reason = f"Somya TTS at {tts_url} rejected authentication (HTTP {resp.status_code})"
                logger.error(somya_failure_reason)
            else:
                somya_failure_reason = f"Somya TTS at {tts_url} returned HTTP {resp.status_code}: {resp.text[:100]}"
                logger.warning(somya_failure_reason)
        except requests.exceptions.ConnectTimeout:
            somya_failure_reason = f"Connection timed out to Somya TTS host at {tts_url} (connect limit: {tts_timeout[0]}s)"
            logger.warning(somya_failure_reason)
        except requests.exceptions.ReadTimeout:
            somya_failure_reason = f"Read timed out waiting for Somya TTS at {tts_url} (read limit: {tts_timeout[1]}s)"
            logger.warning(somya_failure_reason)
        except requests.exceptions.ConnectionError:
            somya_failure_reason = f"Cannot reach Somya TTS host at {tts_url} (host unreachable or port closed)"
            logger.warning(somya_failure_reason)
        except Exception as ex:
            somya_failure_reason = str(ex)
            logger.warning(f"Somya-IndicTTS service error at {tts_url}: {ex}")

        # When primary voice is Somya and silent fallback is not explicitly permitted, fail gracefully
        if engine == "somya" and not req.allow_fallback:
            raise HTTPException(
                status_code=503,
                detail=f"Somya IndicTTS voice engine unavailable: {somya_failure_reason}. Silent fallback to a different voice is suppressed."
            )

    # 2. Parler TTS execution on GPU (if explicitly requested)
    if engine == "parler":
        try:
            logger.info(f"Synthesizing via Somya-IndicTTS ({tts_lang}) at {tts_url}...")
            resp = requests.post(
                f"{tts_url}/synthesize",
                json={
                    "text": target_text,
                    "language": tts_lang,
                    "engine": "somya",
                    "fallback": False
                },
                headers=tts_headers,
                timeout=tts_timeout
            )

            if resp.status_code == 200 and resp.content:
                audio_bytes = resp.content
                mime = "audio/wav"
                if len(_AUDIO_CACHE) < _MAX_CACHE_SIZE:
                    _AUDIO_CACHE[cache_key] = (audio_bytes, mime)
                return Response(
                    content=audio_bytes,
                    media_type=mime,
                    headers={
                        "Cache-Control": "public, max-age=86400",
                        "Content-Disposition": "inline; filename=speech.wav",
                        "X-TTS-Engine": "somya-indictts-gguf",
                        "X-Total-Chunks": str(total_chunks),
                        "X-Chunk-Index": str(active_chunk_index)
                    }
                )
        except Exception as ex:
            logger.warning(f"Somya-IndicTTS service failed: {ex}. Falling back to Indic Parler-TTS...")
            # Fallback to Parler
            try:
                resp = requests.post(
                    f"{TTS_SERVER_URL}/synthesize",
                    json={
                        "text": target_text,
                        "language": tts_lang,
                        "engine": "parler"
                    },
                    timeout=30
                )
                if resp.status_code == 200 and resp.content:
                    audio_bytes = resp.content
                    mime = "audio/wav"
                    if len(_AUDIO_CACHE) < _MAX_CACHE_SIZE:
                        _AUDIO_CACHE[cache_key] = (audio_bytes, mime)
                    return Response(
                        content=audio_bytes,
                        media_type=mime,
                        headers={
                            "Cache-Control": "public, max-age=86400",
                            "Content-Disposition": "inline; filename=speech.wav",
                            "X-TTS-Engine": "ai4bharat-indic-parler",
                            "X-TTS-Fallback": "true",
                            "X-Total-Chunks": str(total_chunks),
                            "X-Chunk-Index": str(active_chunk_index)
                        }
                    )
            except Exception:
                pass

    # 3. Google (gTTS) execution (or final fallback)
    try:
        logger.info(f"Synthesizing via Google TTS ({tts_lang}): {target_text[:35]}...")
        tts = gTTS(text=target_text, lang=tts_lang, tld=tts_tld, slow=False)
        audio_stream = io.BytesIO()
        tts.write_to_fp(audio_stream)
        audio_bytes = audio_stream.getvalue()

        if not audio_bytes:
            raise HTTPException(status_code=500, detail="No audio generated by Google TTS")

        mime = "audio/mpeg"
        if len(_AUDIO_CACHE) < _MAX_CACHE_SIZE:
            _AUDIO_CACHE[cache_key] = (audio_bytes, mime)

        return Response(
            content=audio_bytes,
            media_type=mime,
            headers={
                "Cache-Control": "public, max-age=86400",
                "Content-Disposition": "inline; filename=speech.mp3",
                "X-TTS-Engine": "google",
                "X-TTS-Provider": "google-fallback" if engine in ("somya", "parler") else "google",
                "X-TTS-Fallback": "true" if engine in ("somya", "parler") else "false",
                "X-TTS-Fallback-Reason": somya_failure_reason or "engine_fallback",
                "X-Total-Chunks": str(total_chunks),
                "X-Chunk-Index": str(active_chunk_index)
            }
        )
    except Exception as e:
        logger.error(f"Google TTS generation error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"TTS synthesis error: {str(e)}")

