from fastapi import APIRouter
from app.services.navigation_service import navigation_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/")
async def get_navigation():
    """Get full website navigation map with pages, quick actions, and suggested questions."""
    return {
        "pages": navigation_service.get_pages(),
        "quick_actions": {
            "en": navigation_service.get_quick_actions("en"),
            "mr": navigation_service.get_quick_actions("mr")
        },
        "suggested_questions": {
            "en": navigation_service.get_suggested_questions("en"),
            "mr": navigation_service.get_suggested_questions("mr")
        }
    }


@router.get("/quick-actions")
async def get_quick_actions(lang: str = "en"):
    """Get quick action buttons for the chat interface."""
    return navigation_service.get_quick_actions(lang)
