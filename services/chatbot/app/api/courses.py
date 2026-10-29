from fastapi import APIRouter, Query
from app.services.course_service import course_service
from app.models.schemas import Course
from typing import Optional
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/", response_model=list[Course])
async def get_courses(
    q: Optional[str] = Query(None, description="Search query"),
    eligibility: Optional[str] = Query(None, description="Filter by eligibility (e.g., '10th', '12th')"),
    sector: Optional[str] = Query(None, description="Filter by sector")
):
    """Get courses, optionally filtered by query, eligibility, or sector."""
    results = course_service.search(query=q, eligibility=eligibility, sector=sector)
    return [course_service.to_schema(c) for c in results]
