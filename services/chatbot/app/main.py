from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import chat, courses, institutes, navigation, downloads, admin, tts
from app.core.config import settings
from app.services.rag_service import rag_service
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="MSBSVET Chatbot API",
    description="Kaushalya AI - MSBSVET Virtual Assistant API",
    version="2.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with specific origins for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(courses.router, prefix="/api/courses", tags=["Courses"])
app.include_router(institutes.router, prefix="/api/institutes", tags=["Institutes"])
app.include_router(navigation.router, prefix="/api/navigation", tags=["Navigation"])
app.include_router(downloads.router, prefix="/api/downloads", tags=["Downloads"])
app.include_router(tts.router, prefix="/api/tts", tags=["TTS"])
app.include_router(admin.router, prefix="/api", tags=["Admin"])


@app.on_event("startup")
async def startup_event():
    """Verify configuration on startup."""
    if not settings.GEMINI_API_KEY:
        logger.error("GEMINI_API_KEY is not set! The chatbot will not work.")
    else:
        logger.info("GEMINI_API_KEY is configured.")
    
    # Check ChromaDB document count
    doc_count = rag_service.get_document_count()
    if doc_count == 0:
        logger.warning("ChromaDB is empty! Run POST /api/reindex to ingest PDFs.")
    else:
        logger.info(f"ChromaDB has {doc_count} document chunks indexed.")
    
    logger.info(f"Embedding model: {settings.EMBEDDING_MODEL}")
    logger.info(f"LLM model: {settings.LLM_MODEL}")


@app.get("/health")
@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    doc_count = rag_service.get_document_count()
    return {
        "status": "ok",
        "message": "Kaushalya AI - MSBSVET Assistant is running",
        "version": "2.0.0",
        "models": {
            "embedding": settings.EMBEDDING_MODEL,
            "llm": settings.LLM_MODEL
        },
        "chroma_documents": doc_count
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
