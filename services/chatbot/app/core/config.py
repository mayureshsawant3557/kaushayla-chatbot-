import os
from pathlib import Path
from pydantic_settings import BaseSettings

# Resolve backend root directory
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    # API Keys
    GEMINI_API_KEY: str = ""
    PORT: int = 8005
    HOST: str = "0.0.0.0"

    # Model Configuration
    EMBEDDING_MODEL: str = "models/gemini-embedding-001"
    LLM_MODEL: str = "gemini-2.5-flash-lite"
    LLM_TEMPERATURE: float = 0.3

    # Directory Paths
    CHROMA_PERSIST_DIR: str = str(BACKEND_DIR / "chroma_db")
    DATA_DIR: str = str(BACKEND_DIR / "data")
    PDF_DIR: str = str(BACKEND_DIR / "pdfs")

    # ChromaDB
    COLLECTION_NAME: str = "msbsvet_knowledge"

    # Website
    WEBSITE_BASE_URL: str = "https://msbsvet.edu.in"

    # RAG Settings
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    RAG_TOP_K: int = 5

    # Conversation Memory
    MAX_HISTORY_MESSAGES: int = 10

    # TTS Settings
    DEFAULT_TTS_ENGINE: str = "somya"  # Somya-IndicTTS GGUF 24kHz
    TTS_SERVER_URL: str = "http://127.0.0.1:8006"
    SOMYA_TTS_BASE_URL: str = ""
    SOMYA_TTS_API_KEY: str = ""
    TTS_CONNECT_TIMEOUT_SEC: float = 3.5
    TTS_READ_TIMEOUT_SEC: float = 30.0

    @property
    def effective_tts_url(self) -> str:
        """Normalized Somya TTS URL (precedence: SOMYA_TTS_BASE_URL -> TTS_SERVER_URL)."""
        raw = self.SOMYA_TTS_BASE_URL.strip() if self.SOMYA_TTS_BASE_URL else self.TTS_SERVER_URL.strip()
        url = raw.rstrip("/") if raw else "http://127.0.0.1:8006"
        if not (url.startswith("http://") or url.startswith("https://")):
            url = f"http://{url}"
        return url

    class Config:
        env_file = str(BACKEND_DIR / ".env")
        extra = "ignore"


settings = Settings()
