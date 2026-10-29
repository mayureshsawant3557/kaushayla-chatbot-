import os
import sys
import re
import time
import logging
from pathlib import Path
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Add backend directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.core.config import settings, BACKEND_DIR
from app.core.vectorstore import vector_store_manager

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def is_marathi(text: str, filename: str) -> bool:
    """Detect if file/content is Marathi."""
    if "marathi" in filename.lower():
        return True
    devanagari_count = len(re.findall(r'[\u0900-\u097F]', text[:1000]))
    return devanagari_count > 50


def ingest_knowledge(batch_size: int = 20):
    """
    Safely ingest knowledge feed files (.txt) and guide files (.md) into ChromaDB.
    Preserves existing chunks and uses deterministic IDs to prevent duplicates.
    Includes automatic rate-limit backoff for Gemini API free tier.
    """
    backend_dir = BACKEND_DIR
    workspace_root = backend_dir.parent.parent

    feed_dir = workspace_root / "CHatbot feed"
    kb_dir = workspace_root / "flask_backend" / "knowledge_base"

    logger.info(f"Looking for feed files in: {feed_dir}")
    logger.info(f"Looking for guide files in: {kb_dir}")

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP,
        length_function=len,
        separators=["\n## ", "\n### ", "\n\n", "\n", "। ", ". ", ", ", " ", ""]
    )

    vectorstore = vector_store_manager.get_vectorstore()
    collection = vectorstore._collection

    # Get all existing IDs in collection to avoid re-embedding
    existing_data = collection.get(include=[])
    existing_ids = set(existing_data["ids"]) if existing_data and "ids" in existing_data else set()
    initial_count = len(existing_ids)
    logger.info(f"Current ChromaDB collection size before ingestion: {initial_count}")

    files_to_process = []
    if feed_dir.exists():
        for p in sorted(feed_dir.glob("*.txt")):
            files_to_process.append((p, "feed"))
    else:
        logger.warning(f"Feed directory not found: {feed_dir}")

    if kb_dir.exists():
        for p in sorted(kb_dir.glob("*.md")):
            files_to_process.append((p, "guide"))
    else:
        logger.warning(f"Knowledge base directory not found: {kb_dir}")

    logger.info(f"Total files to process: {len(files_to_process)}")

    all_chunks: list[Document] = []
    all_chunk_ids: list[str] = []

    for file_path, doc_type in files_to_process:
        try:
            content = file_path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            content = file_path.read_text(encoding="latin-1")

        filename = file_path.name
        lang = "mr" if is_marathi(content, filename) else "en"

        raw_chunks = text_splitter.split_text(content)
        valid_chunks = [c for c in raw_chunks if len(c.strip()) > 50]

        logger.info(f"File '{filename}' ({lang}, {doc_type}): {len(valid_chunks)} chunks")

        for idx, text in enumerate(valid_chunks):
            chunk_id = f"msbsvet_{filename}_{idx:04d}"
            
            if chunk_id in existing_ids:
                continue

            metadata = {
                "source_file": filename,
                "source": filename,
                "doc_type": doc_type,
                "language": lang,
                "chunk_index": idx,
                "total_chunks": len(valid_chunks)
            }
            doc = Document(page_content=text, metadata=metadata)
            all_chunks.append(doc)
            all_chunk_ids.append(chunk_id)

    if not all_chunks:
        logger.info("All chunks already present in ChromaDB. No new chunks to ingest.")
        final_count = vector_store_manager.get_document_count()
        logger.info(f"ChromaDB total documents: {final_count}")
        return final_count

    logger.info(f"Remaining new chunks to embed and add: {len(all_chunks)}")

    # Add to ChromaDB in batches with retry and backoff
    total_batches = (len(all_chunks) + batch_size - 1) // batch_size
    added_count = 0

    for b in range(total_batches):
        start = b * batch_size
        end = min(start + batch_size, len(all_chunks))
        batch_docs = all_chunks[start:end]
        batch_ids = all_chunk_ids[start:end]

        success = False
        retries = 0
        max_retries = 5

        while not success and retries < max_retries:
            logger.info(f"Ingesting batch {b + 1}/{total_batches} ({len(batch_docs)} chunks, attempt {retries + 1})...")
            try:
                vectorstore.add_documents(documents=batch_docs, ids=batch_ids)
                added_count += len(batch_docs)
                success = True
                time.sleep(2.0)  # Safe pacing between batches
            except Exception as e:
                err_str = str(e)
                retries += 1
                if "RESOURCE_EXHAUSTED" in err_str or "429" in err_str:
                    logger.warning(f"Rate limited on batch {b + 1}. Waiting 35 seconds before retry...")
                    time.sleep(35.0)
                else:
                    logger.error(f"Unexpected error adding batch {b + 1}: {e}")
                    time.sleep(5.0)

        if not success:
            logger.error(f"Failed to add batch {b + 1} after {max_retries} attempts. Continuing...")

    final_count = vector_store_manager.get_document_count()
    logger.info(f"Ingestion finished! Added {added_count} chunks. Total in collection: {final_count}")
    return final_count


if __name__ == "__main__":
    ingest_knowledge()
