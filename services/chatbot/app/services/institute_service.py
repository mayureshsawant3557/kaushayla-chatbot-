import json
import os
import logging
from app.core.config import settings
from app.models.schemas import Institute

logger = logging.getLogger(__name__)


class InstituteService:
    """Service for managing and searching institutes."""

    def __init__(self):
        self._institutes: list[dict] = []
        self._load_institutes()

    def _load_institutes(self):
        """Load institutes from JSON file."""
        filepath = os.path.join(settings.DATA_DIR, "institutes.json")
        try:
            if os.path.exists(filepath):
                with open(filepath, "r", encoding="utf-8") as f:
                    self._institutes = json.load(f)
                logger.info(f"Loaded {len(self._institutes)} institutes from {filepath}")
            else:
                logger.warning(f"Institutes file not found: {filepath}")
        except Exception as e:
            logger.error(f"Error loading institutes: {e}")

    def reload(self):
        """Reload institutes from file."""
        self._institutes = []
        self._load_institutes()

    def get_all(self) -> list[dict]:
        """Get all institutes."""
        return self._institutes

    def search(self, query: str = None, district: str = None, course: str = None) -> list[dict]:
        """Search institutes by query, district, or course."""
        results = self._institutes

        if query:
            q = query.lower()
            results = [
                i for i in results
                if q in i.get("name", "").lower()
                or q in i.get("district", "").lower()
                or q in i.get("location", "").lower()
                or q in str(i.get("address", "")).lower()
            ]

        if district:
            d = district.lower()
            results = [
                i for i in results
                if d in i.get("district", "").lower()
                or d in i.get("location", "").lower()
            ]

        if course:
            c = course.lower()
            results = [
                i for i in results
                if any(c in str(cr).lower() for cr in i.get("courses", []))
            ]

        return results

    def to_schema(self, institute_data: dict) -> Institute:
        """Convert raw institute dict to Institute schema."""
        return Institute(
            name=institute_data.get("name", ""),
            address=institute_data.get("address"),
            district=institute_data.get("district", institute_data.get("location")),
            courses=institute_data.get("courses"),
            url=institute_data.get("url", "https://msbsvet.edu.in/Public/Institutes.aspx")
        )

    def save_institutes(self, institutes: list[dict]):
        """Save institutes to JSON file."""
        filepath = os.path.join(settings.DATA_DIR, "institutes.json")
        os.makedirs(settings.DATA_DIR, exist_ok=True)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(institutes, f, indent=2, ensure_ascii=False)
        self._institutes = institutes
        logger.info(f"Saved {len(institutes)} institutes to {filepath}")


institute_service = InstituteService()
