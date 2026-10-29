from langchain_google_genai import GoogleGenerativeAIEmbeddings
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Singleton embedding instance
_embeddings_instance = None


def get_embeddings() -> GoogleGenerativeAIEmbeddings:
    """Get the singleton embedding model instance.
    
    Uses gemini-embedding-001 which supports up to 2048 tokens
    and produces 768-dimensional vectors.
    """
    global _embeddings_instance
    if _embeddings_instance is None:
        if not settings.GEMINI_API_KEY:
            logger.error("GEMINI_API_KEY is not set. Embeddings will fail.")
            raise ValueError("GEMINI_API_KEY is required for embeddings")
        
        _embeddings_instance = GoogleGenerativeAIEmbeddings(
            model=settings.EMBEDDING_MODEL,
            google_api_key=settings.GEMINI_API_KEY,
            task_type="retrieval_document"
        )
        logger.info(f"Initialized embedding model: {settings.EMBEDDING_MODEL}")
    
    return _embeddings_instance


def get_query_embeddings() -> GoogleGenerativeAIEmbeddings:
    """Get embeddings configured for query (retrieval_query task type)."""
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is required for embeddings")
    
    return GoogleGenerativeAIEmbeddings(
        model=settings.EMBEDDING_MODEL,
        google_api_key=settings.GEMINI_API_KEY,
        task_type="retrieval_query"
    )
