import json
import os
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


class NavigationService:
    """Service for website navigation guidance."""

    def __init__(self):
        self._knowledge: dict = {}
        self._load_knowledge()

    def _load_knowledge(self):
        """Load website knowledge from JSON."""
        filepath = os.path.join(settings.DATA_DIR, "website_knowledge.json")
        try:
            if os.path.exists(filepath):
                with open(filepath, "r", encoding="utf-8") as f:
                    self._knowledge = json.load(f)
                logger.info(f"Loaded website knowledge from {filepath}")
            else:
                logger.warning(f"Website knowledge file not found: {filepath}")
        except Exception as e:
            logger.error(f"Error loading website knowledge: {e}")

    def reload(self):
        """Reload knowledge from file."""
        self._knowledge = {}
        self._load_knowledge()

    def get_pages(self) -> list[dict]:
        """Get all website pages."""
        return self._knowledge.get("pages", [])

    def get_navigation_guide(self, lang: str = "en") -> dict:
        """Get navigation guide for a language."""
        guides = self._knowledge.get("navigation_guide", {})
        return guides.get(lang, guides.get("en", {}))

    def get_quick_actions(self, lang: str = "en") -> list[dict]:
        """Get quick action buttons for a language."""
        actions = self._knowledge.get("quick_actions", {})
        return actions.get(lang, actions.get("en", []))

    def get_suggested_questions(self, lang: str = "en") -> list[str]:
        """Get suggested questions for a language."""
        questions = self._knowledge.get("suggested_questions", {})
        return questions.get(lang, questions.get("en", []))

    def find_page(self, query: str) -> list[dict]:
        """Find relevant pages based on query with robust keyword matching across all portal sections."""
        q = query.lower().strip()
        pages = self._knowledge.get("pages", [])

        def match_url(fragment: str):
            frag = fragment.lower()
            return next((p for p in pages if frag in p.get("url", "").lower()), None)

        # 1. Hall Ticket / Admit Card
        if any(k in q for k in ["hall ticket", "hallticket", "admit card", "हॉल तिकीट", "हॉलतिकीट", "प्रवेशपत्र"]):
            p = match_url("exam/hallticket")
            if p: return [p]

        # 2. Exam Timetable / Schedule
        if any(k in q for k in ["time table", "timetable", "वेळापत्रक", "schedule", "exam date", "परीक्षा तारीख"]):
            p = match_url("public/examtimetable")
            if p: return [p]

        # 3. Exam Circulars & Notices
        if any(k in q for k in ["circular", "peripatrak", "परिपत्रक", "परिपत्रके", "notification", "exam circular"]):
            p = match_url("public/examcircular")
            if p: return [p]

        # 4. Exam Pattern / Marking Scheme
        if any(k in q for k in ["pattern", "marking scheme", "गुणपद्धती", "परीक्षा पद्धत", "marking"]):
            p = match_url("public/exampattern")
            if p: return [p]

        # 5. Exam Results & Marksheets
        if any(k in q for k in ["result", "marksheet", "निकाल", "गुणपत्रिका", "grade card", "गुणपत्रक"]):
            p = match_url("candidate/resultandcertificate") or match_url("exam/resultandcertificate")
            if p: return [p]

        # 6. Exam Fees & Payment
        if any(k in q for k in ["exam fee", "exam fees", "परीक्षा फी", "परीक्षा शुल्क"]):
            p = match_url("exam/examfees")
            if p: return [p]

        # 7. Exam Seating Arrangement
        if any(k in q for k in ["seating", "बैठक व्यवस्था", "seating arrangement", "seat arrangement", "holl layout"]):
            p = match_url("exam/seatingarrangement") or match_url("seatingarrangementdetails")
            if p: return [p]

        # 8. Exam Attendance Report
        if any(k in q for k in ["exam attendance", "परीक्षा हजेरी", "परीक्षा उपस्थिती"]):
            p = match_url("exam/attendancereport")
            if p: return [p]

        # 9. STT Assessment Marks
        if any(k in q for k in ["assessment marks", "stt assessment", "प्रात्यक्षिक गुण", "मूल्यांकन गुण"]):
            p = match_url("exam/sttassessmentmarks") or match_url("exam/readyforassessment")
            if p: return [p]

        # 10. Grievance / Complaints
        if any(k in q for k in ["complaint status", "grievance status", "तक्रार स्थिती"]):
            p = match_url("public/complaint-status")
            if p: return [p]
        if any(k in q for k in ["complaint", "grievance", "takrar", "तक्रार", "तक्रार नोंद", "takrar nondva"]):
            p = match_url("public/register-complaint") or match_url("assistance/grievance")
            if p: return [p]

        # 11. Admission Letter / Allotment
        if any(k in q for k in ["admission letter", "allotment letter", "प्रवेश पत्र", "प्रवेशवाटप पत्र", "allotment"]):
            p = match_url("admission/printadmissionletter")
            if p: return [p]

        # 12. Admission Status / Application ID
        if any(k in q for k in ["application id", "application status", "check application", "अर्जाची स्थिती", "अर्ज क्रमांक", "arj sthiti"]):
            p = match_url("admission/checkapplicationid")
            if p: return [p]

        # 13. Candidate Profile Details (Address, Qualification, Category, Parent, Bank)
        if any(k in q for k in ["address", "पत्ता", "change address", "residential address", "patta"]):
            p = match_url("candidate/address")
            if p: return [p]
        if any(k in q for k in ["qualification", "शिक्षण", "पात्रता", "marks", "hsc marks", "ssc marks", "shikshan"]):
            p = match_url("candidate/qualification")
            if p: return [p]
        if any(k in q for k in ["category", "caste", "आरक्षण", "जात", "caste certificate", "pravarg"]):
            p = match_url("candidate/category")
            if p: return [p]
        if any(k in q for k in ["parent", "पालक", "father name", "mother name", "vadilanche nav"]):
            p = match_url("candidate/parent")
            if p: return [p]
        if any(k in q for k in ["bank", "बँक", "bank account", "ifsc", "dbt", "खाते"]):
            p = match_url("candidate/bank")
            if p: return [p]
        if any(k in q for k in ["work experience", "अनुभव", "experience"]):
            p = match_url("candidate/workexperience")
            if p: return [p]
        if any(k in q for k in ["lock form", "lock application", "अर्ज लॉक", "form lock"]):
            p = match_url("candidate/lockapplicationform")
            if p: return [p]
        if any(k in q for k in ["unlock form", "unlock application", "अर्ज अनलॉक"]):
            p = match_url("candidate/verifytounlock")
            if p: return [p]
        if any(k in q for k in ["my profile", "candidate profile", "विद्यार्थी प्रोफाइल", "माझे प्रोफाइल"]):
            p = match_url("candidate/primary")
            if p: return [p]

        # 14. Candidate Attendance
        if any(k in q for k in ["attendance", "हजेरी", "biometric", "बायोमेट्रिक", "hajeri"]):
            p = match_url("candidate/attendancedashboard")
            if p: return [p]

        # 15. Fee / Payment / Receipt
        if any(k in q for k in ["receipt", "पावती", "fee receipt", "pavti"]):
            p = match_url("instonlinereceipt") or match_url("candidate/transactionhistory") or match_url("fee/transactionhistory")
            if p: return [p]
        if any(k in q for k in ["fee status", "transaction", "payment history", "व्यवहार", "शुल्क", "fee structure", "fee info"]):
            p = match_url("candidate/feeinfo") or match_url("candidate/transactionhistory") or match_url("fee/transactionhistory")
            if p: return [p]

        # 16. Academisthan / BCLS (LMS & Certificates)
        if any(k in q for k in ["academisthan certificate", "अकादमिस्थान प्रमाणपत्र"]):
            p = match_url("candidate/academisthancertificate")
            if p: return [p]
        if any(k in q for k in ["academisthan", "अकादमिस्थान", "lms", "e-learning", "व्हिडिओ लेक्चर"]):
            p = match_url("candidate/academisthan")
            if p: return [p]
        if any(k in q for k in ["bcls certificate", "संगणक साक्षरता प्रमाणपत्र"]):
            p = match_url("candidate/bclscertificate")
            if p: return [p]
        if any(k in q for k in ["bcls", "संगणक साक्षरता", "computer literacy"]):
            p = match_url("candidate/bcls")
            if p: return [p]

        # 17. Aadhaar Reverification
        if any(k in q for k in ["aadhaar", "आधार", "kyc", "केवायसी", "uidai"]):
            p = match_url("candidate/aadhaarreverify")
            if p: return [p]

        # 18. Password Reset / Account Recovery
        if any(k in q for k in ["forgot password", "reset password", "account recovery", "पासवर्ड विसरला", "पासवर्ड रीसेट"]):
            p = match_url("accountrecovery")
            if p: return [p]
        if any(k in q for k in ["change password", "पासवर्ड बदला"]):
            p = match_url("candidate/changepassword")
            if p: return [p]

        # 19. Reports & Gazette
        if any(k in q for k in ["gazette", "गॅझेट", "gazet"]):
            p = match_url("reports/reportgazette")
            if p: return [p]
        if any(k in q for k in ["approved candidates", "मंजूर विद्यार्थी", "approved list"]):
            p = match_url("reports/approvedcandidatelist")
            if p: return [p]
        if any(k in q for k in ["admitted candidates", "प्रवेशित विद्यार्थी"]):
            p = match_url("reports/admittedcandidatelist")
            if p: return [p]
        if any(k in q for k in ["rejected candidates", "नामंजूर विद्यार्थी"]):
            p = match_url("reports/rejectedcandidatelist")
            if p: return [p]
        if any(k in q for k in ["reports list", "all reports", "अहवाल", "रिपोर्ट", "reports"]):
            p = match_url("reports/reportslist")
            if p: return [p]

        # 20. Institute / Promoting Organization Registration
        inst_keywords = [
            "institute", "institutes", "instutite", "institue", "sanstha", "संस्था", "संस्थेची",
            "इन्स्टिट्यूट", "इन्स्टिट्युट", "इंस्टिट्यूट", "promoting", "promotingorganization",
            "promoting organization", "promotingpograntion", "promoting organisation",
            "प्रवर्तक", "प्रवर्तक संस्था", "प्रमोटिंग"
        ]
        reg_keywords = [
            "register", "registration", "नोंदणी", "रजिस्ट्रेशन", "karyachy", "karaycha",
            "nondani", "suru", "नवीन", "new", "start", "open", "करायचा", "करायचे", "करायची"
        ]
        if (any(k in q for k in inst_keywords) and any(k in q for k in reg_keywords)) or \
           any(k in q for k in ["promotingorganization", "promoting organization", "promotingpograntion", "sanstha nondani", "प्रवर्तक संस्था नोंदणी", "इन्स्टिट्यूट नोंदणी", "इन्स्टिट्यूट रजिस्ट्रेशन"]):
            p = match_url("promotingorganizationregistration")
            if p: return [p]

        # 21. Candidate Registration
        if any(k in q for k in ["candidate register", "candidate registration", "उमेदवार नोंदणी", "student registration", "register", "registration", "नोंदणी", "अर्ज"]):
            p = match_url("candidate/register")
            if p: return [p]

        # 22. Staff Registration & Portal
        if any(k in q for k in ["staff register", "staff registration", "शिक्षक नोंदणी", "कर्मचारी नोंदणी"]):
            p = match_url("staff/register")
            if p: return [p]
        if any(k in q for k in ["staff verification", "शिक्षक पडताळणी"]):
            p = match_url("staff/staffverification")
            if p: return [p]

        # 23. New Institute Approval / LOI / Infrastructure
        if any(k in q for k in ["loi", "letter of intent", "आशयपत्र"]):
            p = match_url("institute/loigeneration")
            if p: return [p]
        if any(k in q for k in ["inspection request", "तपासणी विनंती", "schedule inspection"]):
            p = match_url("institute/inspectionrequest")
            if p: return [p]
        if any(k in q for k in ["building details", "इमारत तपशील", "classroom area"]):
            p = match_url("institute/buildingdetails")
            if p: return [p]
        if any(k in q for k in ["equipment details", "यंत्रसामग्री", "machinery list"]):
            p = match_url("institute/trainingequipmentdetails")
            if p: return [p]
        if any(k in q for k in ["proposed institute", "नवीन संस्था मान्यता", "new institute approval"]):
            p = match_url("institute/proposedinstitutedetails")
            if p: return [p]

        # 24. Dashboards
        if any(k in q for k in ["candidate dashboard", "विद्यार्थी डॅशबोर्ड", "कॅन्डिडेट डॅशबोर्ड"]):
            p = match_url("candidate/dashboard")
            if p: return [p]
        if any(k in q for k in ["institute dashboard", "संस्था डॅशबोर्ड"]):
            p = match_url("institute/dashboard")
            if p: return [p]
        if any(k in q for k in ["staff dashboard", "शिक्षक डॅशबोर्ड", "कर्मचारी डॅशबोर्ड"]):
            p = match_url("staff/dashboard")
            if p: return [p]
        if any(k in q for k in ["dashboard", "डॅशबोर्ड"]):
            p = match_url("candidate/dashboard")
            if p: return [p]

        # 25. Courses & Institutes Directory
        if any(k in q for k in ["short term course", "stt", "अल्पमुदत"]):
            p = match_url("public/coursesstt")
            if p: return [p]
        if any(k in q for k in ["course", "courses", "अभ्यासक्रम", "कोर्स"]):
            p = match_url("public/courses")
            if p: return [p]
        if any(k in q for k in ["institute", "institutes", "instutite", "institue", "संस्था", "इन्स्टिट्यूट", "इन्स्टिट्युट", "इंस्टिट्यूट", "कॉलेज", "iti college", "promoting organization", "promotingpograntion"]):
            p = match_url("public/institutes")
            if p: return [p]

        # 26. Certificate Verification
        if any(k in q for k in ["certificate", "प्रमाणपत्र", "verification", "पडताळणी"]):
            p = match_url("certificateverification")
            if p: return [p]

        # 27. Assistance & Meetings
        if any(k in q for k in ["faq", "frequently asked", "प्रश्न"]):
            p = match_url("assistance/faq")
            if p: return [p]
        if any(k in q for k in ["meeting", "appointment", "भेट", "बैठक"]):
            p = match_url("assistance/meeting") or match_url("assistance/visit-scheduler")
            if p: return [p]

        # 28. RTI / Citizen Charter
        if any(k in q for k in ["rti", "माहिती अधिकार", "right to information"]):
            p = match_url("public/rti")
            if p: return [p]
        if any(k in q for k in ["citizen charter", "नागरिक सनद"]):
            p = match_url("public/citizencharter")
            if p: return [p]

        # 29. Downloads
        if any(k in q for k in ["download", "हस्तपुस्तिका", "handbook", "फॉर्म डाउनलोड", "gr", "शासन निर्णय"]):
            p = match_url("public/legitdownload")
            if p: return [p]

        # 30. Login / Signin
        if any(k in q for k in ["signin", "login", "लॉगिन"]):
            p = match_url("auth/signin")
            if p: return [p]

        # 31. Contact Us
        if any(k in q for k in ["contact", "संपर्क", "फोन", "हेल्पलाइन", "पत्ता", "address", "helpline", "email"]):
            p = match_url("public/contactus")
            if p: return [p]

        # 32. About Board / Vision / Mission
        if any(k in q for k in ["about board", "मंडळाविषयी", "vision", "mission", "ध्येय", "उद्दिष्टे", "values"]):
            p = match_url("public/aboutboard") or match_url("public/vision")
            if p: return [p]

        # Fallback keyword scoring across all pages
        results = []
        for page in pages:
            title = page.get("title", "").lower()
            title_mr = page.get("title_mr", "").lower()
            desc = page.get("description", "").lower()
            desc_mr = page.get("description_mr", "").lower()
            url_str = page.get("url", "").lower()

            words = [w for w in q.split() if len(w) >= 3]
            match_score = sum(1 for w in words if w in title or w in title_mr or w in desc or w in desc_mr or w in url_str)
            if match_score > 0:
                results.append((match_score, page))

        results.sort(key=lambda x: x[0], reverse=True)
        return [r[1] for r in results]

    def get_full_knowledge(self) -> dict:
        """Get all website knowledge."""
        return self._knowledge


navigation_service = NavigationService()
