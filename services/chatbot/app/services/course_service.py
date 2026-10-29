import json
import os
import logging
from app.core.config import settings
from app.models.schemas import Course

logger = logging.getLogger(__name__)


class CourseService:
    """Service for managing and searching courses."""

    def __init__(self):
        self._courses: list[dict] = []
        self._load_courses()

    def _load_courses(self):
        """Load courses from JSON file."""
        filepath = os.path.join(settings.DATA_DIR, "courses.json")
        try:
            if os.path.exists(filepath):
                with open(filepath, "r", encoding="utf-8") as f:
                    self._courses = json.load(f)
                logger.info(f"Loaded {len(self._courses)} courses from {filepath}")
            else:
                logger.warning(f"Courses file not found: {filepath}")
        except Exception as e:
            logger.error(f"Error loading courses: {e}")

    def reload(self):
        """Reload courses from file."""
        self._courses = []
        self._load_courses()

    def get_all(self) -> list[dict]:
        """Get all courses."""
        return self._courses

    def search(self, query: str = None, eligibility: str = None, sector: str = None) -> list[dict]:
        """Search courses by query, eligibility, or sector with bilingual support."""
        if not self._courses:
            self._load_courses()

        results = self._courses

        # Generic words that mean "show me all / available courses"
        generic_course_queries = [
            "courses", "course", "कोर्सेस", "कोर्स", "अभ्यासक्रम", "list", "यादी",
            "available", "उपलब्ध", "सर्व", "all", "dakhav", "dakhva", "दाखव", "दाखवा", "सांगा",
            "mala", "मला", "show", "me", "baghaycha", "baghayche", "बघायचे",
            "pahije", "paheje", "पाहिजे", "konte", "konta", "कोणते"
        ]

        if query:
            q = query.lower().strip()
            # If query is purely generic, return all courses rather than over-filtering
            is_purely_generic = all(part in generic_course_queries for part in q.split() if len(part) > 2)

            if not is_purely_generic:
                matched = []
                for c in results:
                    searchable_text = " ".join([
                        c.get("name", ""),
                        c.get("name_mr", ""),
                        c.get("sector", ""),
                        c.get("sector_mr", ""),
                        c.get("description", ""),
                        c.get("description_mr", ""),
                        str(c.get("qualification", "")),
                        str(c.get("eligibility", "")),
                        " ".join(c.get("location", []))
                    ]).lower()

                    # Exact token or substring match
                    if q in searchable_text or any(token in searchable_text for token in q.split() if len(token) > 2 and token not in generic_course_queries):
                        matched.append(c)

                results = matched if matched else self._courses

        if eligibility:
            e = eligibility.lower()
            results = [
                c for c in results
                if e in str(c.get("qualification", "")).lower()
                or e in str(c.get("eligibility", "")).lower()
            ]

        if sector:
            s = sector.lower()
            results = [
                c for c in results
                if s in c.get("sector", "").lower()
                or s in c.get("name", "").lower()
            ]

        return results

    def to_schema(self, course_data: dict) -> Course:
        """Convert raw course dict to Course schema."""
        return Course(
            name=course_data.get("name", ""),
            name_mr=course_data.get("name_mr"),
            description=course_data.get("description"),
            description_mr=course_data.get("description_mr"),
            duration=course_data.get("duration"),
            eligibility=course_data.get("eligibility") or course_data.get("qualification"),
            sector=course_data.get("sector"),
            status=course_data.get("status", "Admissions Open"),
            important_dates=course_data.get("important_dates"),
            required_documents=course_data.get("required_documents"),
            url=course_data.get("url", "/React/Public/courses")
        )


    def save_courses(self, courses: list[dict]):
        """Save courses to JSON file."""
        filepath = os.path.join(settings.DATA_DIR, "courses.json")
        os.makedirs(settings.DATA_DIR, exist_ok=True)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(courses, f, indent=2, ensure_ascii=False)
        self._courses = courses
        logger.info(f"Saved {len(courses)} courses to {filepath}")


course_service = CourseService()
