import os
import sys
import logging
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.core.config import settings
from app.core.vectorstore import vector_store_manager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def ingest_pdfs(clear_existing: bool = True):
    """Ingest all PDFs from the PDF directory into ChromaDB.
    
    Args:
        clear_existing: If True, deletes existing ChromaDB and rebuilds from scratch.
    """
    pdf_dir = settings.PDF_DIR
    if not os.path.exists(pdf_dir):
        logger.warning(f"PDF directory not found: {pdf_dir}")
        return 0

    # Clear existing database if requested
    if clear_existing:
        logger.info("Clearing existing ChromaDB...")
        vector_store_manager.reset_vectorstore()

    # Load all PDFs
    documents = []
    for filename in os.listdir(pdf_dir):
        if filename.lower().endswith(".pdf"):
            file_path = os.path.join(pdf_dir, filename)
            logger.info(f"Loading PDF: {filename}")
            try:
                loader = PyMuPDFLoader(file_path)
                docs = loader.load()
                # Add source filename as metadata
                for doc in docs:
                    doc.metadata["source_file"] = filename
                    doc.metadata["source"] = filename
                documents.extend(docs)
                logger.info(f"  -> Loaded {len(docs)} pages from {filename}")
            except Exception as e:
                logger.error(f"Failed to load {filename}: {e}")

    if not documents:
        logger.info("No documents found to ingest.")
        return 0

    logger.info(f"Total pages loaded: {len(documents)}. Splitting text...")
    
    # Split into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP,
        length_function=len,
        separators=["\n\n", "\n", "। ", ". ", ", ", " ", ""]
    )
    chunks = text_splitter.split_documents(documents)
    
    # Filter out very small chunks (likely headers/footers)
    chunks = [c for c in chunks if len(c.page_content.strip()) > 50]
    logger.info(f"Split into {len(chunks)} chunks (after filtering).")

    # Add to ChromaDB in batches to avoid API rate limits
    batch_size = 50
    vectorstore = vector_store_manager.get_vectorstore()
    
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i + batch_size]
        try:
            vectorstore.add_documents(batch)
            logger.info(f"  Added batch {i // batch_size + 1}/{(len(chunks) + batch_size - 1) // batch_size} ({len(batch)} chunks)")
        except Exception as e:
            logger.error(f"  Failed to add batch {i // batch_size + 1}: {e}")
            # Retry with smaller batch
            for chunk in batch:
                try:
                    vectorstore.add_documents([chunk])
                except Exception as e2:
                    logger.error(f"  Failed to add single chunk: {e2}")

    total = vector_store_manager.get_document_count()
    logger.info(f"Ingestion complete. Total documents in ChromaDB: {total}")
    return total


if __name__ == "__main__":
    ingest_pdfs()
