import logging

logger = logging.getLogger(__name__)


class DownloadService:
    """Service for managing downloadable resources."""

    # Static list of known downloadable documents
    DOWNLOADS = [
        {
            "name": "User Manual",
            "name_mr": "वापरकर्ता मार्गदर्शिका",
            "description": "Complete user manual for the MSBSVET portal with step-by-step instructions.",
            "description_mr": "MSBSVET पोर्टलसाठी संपूर्ण वापरकर्ता मार्गदर्शिका.",
            "url": "https://msbsvet.edu.in/Public/Home.aspx",
            "file_type": "pdf",
            "keywords": ["user manual", "manual", "guide", "how to use", "मार्गदर्शिका", "कसे वापरावे"]
        },
        {
            "name": "Affiliation Handbook",
            "name_mr": "संलग्नता हस्तपुस्तिका",
            "description": "Handbook for institute affiliation process, requirements, and guidelines.",
            "description_mr": "संस्था संलग्नता प्रक्रिया, आवश्यकता आणि मार्गदर्शक तत्त्वे.",
            "url": "https://msbsvet.edu.in/Public/Home.aspx",
            "file_type": "pdf",
            "keywords": ["affiliation", "handbook", "affiliate", "संलग्नता", "हस्तपुस्तिका"]
        },
        {
            "name": "Courses List",
            "name_mr": "अभ्यासक्रम यादी",
            "description": "Complete list of all available courses under MSBSVET with details.",
            "description_mr": "MSBSVET अंतर्गत उपलब्ध सर्व अभ्यासक्रमांची संपूर्ण यादी.",
            "url": "https://msbsvet.edu.in/Public/Courses.aspx",
            "file_type": "pdf",
            "keywords": ["course list", "courses pdf", "all courses", "कोर्स यादी", "अभ्यासक्रम"]
        },
        {
            "name": "Institutes Directory",
            "name_mr": "संस्था निर्देशिका",
            "description": "Directory of all affiliated institutes across Maharashtra.",
            "description_mr": "महाराष्ट्रभरातील सर्व संलग्न संस्थांची निर्देशिका.",
            "url": "https://msbsvet.edu.in/Public/Institutes.aspx",
            "file_type": "pdf",
            "keywords": ["institute list", "institutes pdf", "directory", "संस्था यादी", "निर्देशिका"]
        }
    ]

    @classmethod
    def get_all(cls) -> list[dict]:
        """Get all available downloads."""
        return [
            {
                "name": d["name"],
                "description": d["description"],
                "url": d["url"],
                "file_type": d["file_type"]
            }
            for d in cls.DOWNLOADS
        ]

    @classmethod
    def search(cls, query: str) -> list[dict]:
        """Search downloads by query."""
        q = query.lower()
        results = []
        for d in cls.DOWNLOADS:
            if any(kw in q for kw in d["keywords"]):
                results.append({
                    "name": d["name"],
                    "description": d["description"],
                    "url": d["url"],
                    "file_type": d["file_type"]
                })
        return results if results else cls.get_all()


download_service = DownloadService()
