from fastapi import APIRouter, Query
from app.services.institute_service import institute_service
from app.models.schemas import Institute
from typing import Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/", response_model=list[Institute])
async def get_institutes(
    q: Optional[str] = Query(None, description="Search query"),
    district: Optional[str] = Query(None, description="Filter by district"),
    course: Optional[str] = Query(None, description="Filter by course")
):
    """Get institutes, optionally filtered by query, district, or course."""
    results = institute_service.search(query=q, district=district, course=course)
    return [institute_service.to_schema(i) for i in results]
