from langchain_chroma import Chroma
from app.core.embeddings import get_embeddings
from app.core.config import settings
import os
import shutil
import logging

logger = logging.getLogger(__name__)


class VectorStoreManager:
    """Singleton manager for ChromaDB vector store."""
    _instance = None
    _vectorstore = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(VectorStoreManager, cls).__new__(cls)
        return cls._instance

    def get_vectorstore(self) -> Chroma:
        """Get or create the ChromaDB vector store instance."""
        if self._vectorstore is None:
            os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
            self._vectorstore = Chroma(
                persist_directory=settings.CHROMA_PERSIST_DIR,
                embedding_function=get_embeddings(),
                collection_name=settings.COLLECTION_NAME
            )
            doc_count = self.get_document_count()
            logger.info(f"ChromaDB initialized. Collection: {settings.COLLECTION_NAME}, Documents: {doc_count}")
        return self._vectorstore

    def get_document_count(self) -> int:
        """Get the number of documents in the vector store."""
        try:
            vs = self.get_vectorstore()
            if vs is not None:
                collection = vs._collection
                return collection.count()
        except Exception as e:
            logger.warning(f"Could not get document count: {e}")
        return 0

    def reset_vectorstore(self):
        """Delete and recreate the vector store."""
        logger.info("Resetting vector store...")
        self._vectorstore = None
        
        if os.path.exists(settings.CHROMA_PERSIST_DIR):
            shutil.rmtree(settings.CHROMA_PERSIST_DIR)
            logger.info(f"Deleted ChromaDB directory: {settings.CHROMA_PERSIST_DIR}")
        
        os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
        return self.get_vectorstore()


vector_store_manager = VectorStoreManager()
