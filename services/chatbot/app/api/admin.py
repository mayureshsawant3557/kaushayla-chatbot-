from fastapi import APIRouter, BackgroundTasks
from app.models.schemas import ReindexResponse
from app.services.rag_service import rag_service
from app.services.course_service import course_service
from app.services.institute_service import institute_service
from app.services.website_scraper_service import website_scraper_service
from app.core.vectorstore import vector_store_manager
import sys
import os
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


def _run_pdf_ingestion():
    """Run PDF ingestion in background."""
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    from scripts.ingest_pdfs import ingest_pdfs
    return ingest_pdfs(clear_existing=True)


@router.post("/reindex", response_model=ReindexResponse)
async def reindex_pdfs(background_tasks: BackgroundTasks):
    """Re-ingest all PDFs and rebuild the ChromaDB vector store."""
    try:
        logger.info("Starting PDF re-indexing...")
        count = _run_pdf_ingestion()
        return ReindexResponse(
            status="success",
            message=f"Re-indexed {count} document chunks from PDFs.",
            document_count=count
        )
    except Exception as e:
        logger.error(f"Re-indexing failed: {e}", exc_info=True)
        return ReindexResponse(
            status="error",
            message=f"Re-indexing failed: {str(e)}",
            document_count=0
        )


@router.post("/reindex-website", response_model=ReindexResponse)
async def reindex_website():
    """Scrape MSBSVET website for courses and institutes data."""
    try:
        logger.info("Starting website re-indexing...")
        results = website_scraper_service.scrape_and_save()
        
        # Reload services with new data
        course_service.reload()
        institute_service.reload()
        
        total = results.get("courses", 0) + results.get("institutes", 0)
        return ReindexResponse(
            status="success",
            message=f"Scraped {results.get('courses', 0)} courses and {results.get('institutes', 0)} institutes from website.",
            document_count=total
        )
    except Exception as e:
        logger.error(f"Website re-indexing failed: {e}", exc_info=True)
        return ReindexResponse(
            status="error",
            message=f"Website re-indexing failed: {str(e)}",
            document_count=0
        )
