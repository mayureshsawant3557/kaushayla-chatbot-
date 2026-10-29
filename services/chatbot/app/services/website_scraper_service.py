import requests
from bs4 import BeautifulSoup
import json
import os
import logging
import re
from app.core.config import settings

logger = logging.getLogger(__name__)


class WebsiteScraperService:
    """Scrapes MSBSVET website for courses and institutes data."""

    BASE_URL = "https://msbsvet.edu.in"
    COURSES_URL = f"{BASE_URL}/Public/Courses.aspx"
    INSTITUTES_URL = f"{BASE_URL}/Public/Institutes.aspx"

    HEADERS = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    @classmethod
    def scrape_courses(cls) -> list[dict]:
        """Scrape courses from MSBSVET Courses page."""
        logger.info(f"Scraping courses from {cls.COURSES_URL}")
        courses = []
        
        try:
            response = requests.get(cls.COURSES_URL, headers=cls.HEADERS, timeout=30)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")

            # Look for course data in tables
            tables = soup.find_all("table")
            for table in tables:
                rows = table.find_all("tr")
                for row in rows[1:]:  # Skip header row
                    cells = row.find_all(["td", "th"])
                    if len(cells) >= 2:
                        name = cells[0].get_text(strip=True)
                        if name and len(name) > 2:
                            course = {
                                "name": name,
                                "url": cls.COURSES_URL
                            }
                            if len(cells) > 1:
                                course["sector"] = cells[1].get_text(strip=True)
                            if len(cells) > 2:
                                course["duration"] = cells[2].get_text(strip=True)
                            if len(cells) > 3:
                                course["eligibility"] = cells[3].get_text(strip=True)
                            if len(cells) > 4:
                                course["description"] = cells[4].get_text(strip=True)
                            courses.append(course)

            # Also look for course items in divs/lists
            if not courses:
                course_items = soup.find_all(["div", "li", "span"], class_=re.compile(r"course|item|card", re.I))
                for item in course_items:
                    name = item.get_text(strip=True)
                    if name and len(name) > 2 and len(name) < 200:
                        courses.append({
                            "name": name,
                            "url": cls.COURSES_URL
                        })

            logger.info(f"Scraped {len(courses)} courses")
            
        except Exception as e:
            logger.error(f"Error scraping courses: {e}")

        return courses

    @classmethod
    def scrape_institutes(cls) -> list[dict]:
        """Scrape institutes from MSBSVET Institutes page."""
        logger.info(f"Scraping institutes from {cls.INSTITUTES_URL}")
        institutes = []
        
        try:
            response = requests.get(cls.INSTITUTES_URL, headers=cls.HEADERS, timeout=30)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")

            # Look for institute data in tables
            tables = soup.find_all("table")
            for table in tables:
                rows = table.find_all("tr")
                for row in rows[1:]:  # Skip header row
                    cells = row.find_all(["td", "th"])
                    if len(cells) >= 2:
                        name = cells[0].get_text(strip=True)
                        if name and len(name) > 2:
                            institute = {
                                "name": name,
                                "url": cls.INSTITUTES_URL
                            }
                            if len(cells) > 1:
                                institute["district"] = cells[1].get_text(strip=True)
                            if len(cells) > 2:
                                institute["location"] = cells[2].get_text(strip=True)
                            if len(cells) > 3:
                                courses_text = cells[3].get_text(strip=True)
                                institute["courses"] = [c.strip() for c in courses_text.split(",") if c.strip()]
                            if len(cells) > 4:
                                institute["address"] = cells[4].get_text(strip=True)
                            institutes.append(institute)

            # Also look for institute items in divs/lists
            if not institutes:
                inst_items = soup.find_all(["div", "li", "span"], class_=re.compile(r"institute|item|card", re.I))
                for item in inst_items:
                    name = item.get_text(strip=True)
                    if name and len(name) > 2 and len(name) < 200:
                        institutes.append({
                            "name": name,
                            "url": cls.INSTITUTES_URL
                        })

            logger.info(f"Scraped {len(institutes)} institutes")

        except Exception as e:
            logger.error(f"Error scraping institutes: {e}")

        return institutes

    @classmethod
    def scrape_and_save(cls) -> dict:
        """Scrape courses and institutes and save to JSON files."""
        results = {"courses": 0, "institutes": 0}
        
        # Scrape courses
        courses = cls.scrape_courses()
        if courses:
            filepath = os.path.join(settings.DATA_DIR, "courses.json")
            os.makedirs(settings.DATA_DIR, exist_ok=True)
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(courses, f, indent=2, ensure_ascii=False)
            results["courses"] = len(courses)
            logger.info(f"Saved {len(courses)} courses to {filepath}")

        # Scrape institutes
        institutes = cls.scrape_institutes()
        if institutes:
            filepath = os.path.join(settings.DATA_DIR, "institutes.json")
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(institutes, f, indent=2, ensure_ascii=False)
            results["institutes"] = len(institutes)
            logger.info(f"Saved {len(institutes)} institutes to {filepath}")

        return results


website_scraper_service = WebsiteScraperService()
