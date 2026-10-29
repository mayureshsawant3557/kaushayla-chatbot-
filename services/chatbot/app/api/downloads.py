from fastapi import APIRouter
from app.services.download_service import download_service
from app.models.schemas import Download
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/", response_model=list[Download])
async def get_downloads():
    """Get all available downloadable documents."""
    return download_service.get_all()
