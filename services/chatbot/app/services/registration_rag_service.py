"""
MSBSVET KAUSHALYA AI — REGISTRATION & FORM-FILLING SPECIALIZED RAG LAYER
registration_rag_service.py: Domain-specific, grounded retrieval for Candidate Registration,
Authenticated Profile completion (10 Steps), Staff Registration, and Institute/Promoting Org forms.

Eliminates isolated heading chunks, dashed separator leakage, and provides exact, verified
field guidance, validation rules, and prerequisites in Marathi and English.
"""

import re
import logging
from typing import Dict, List, Any, Optional
from langchain_core.documents import Document

logger = logging.getLogger(__name__)

# Complete Ground Truth for the 10 Main Profile Steps and 3 Registration Types
REGISTRATION_MODULES = [
    {
        "id": "candidate_registration",
        "domain": "candidate_registration",
        "step_number": 0,
        "title": {
            "mr": "उमेदवार नवीन नोंदणी (Candidate Registration)",
            "en": "Candidate New Registration"
        },
        "route": "/React/candidate/register",
        "user_type": "Candidate",
        "fields": [
            {"key": "itiRegistered", "label_mr": "यापूर्वी ITI नोंदणी", "label_en": "Previous ITI Registration", "type": "radio", "required": True},
            {"key": "registrationNumber", "label_mr": "मागील नोंदणी क्रमांक", "label_en": "Previous Registration Number", "type": "text", "required": False},
            {"key": "firstName", "label_mr": "पहिले नाव", "label_en": "First Name", "type": "text", "required": True},
            {"key": "middleName", "label_mr": "वडिलांचे/पतीचे नाव", "label_en": "Middle Name", "type": "text", "required": False},
            {"key": "lastName", "label_mr": "आडनाव", "label_en": "Last Name", "type": "text", "required": True},
            {"key": "dob", "label_mr": "जन्मतारीख", "label_en": "Date of Birth", "type": "date", "required": True},
            {"key": "gender", "label_mr": "लिंग", "label_en": "Gender", "type": "select", "required": True},
            {"key": "primaryMobile", "label_mr": "प्राथमिक मोबाईल क्रमांक", "label_en": "Primary Mobile Number", "type": "number", "required": True},
            {"key": "email", "label_mr": "ईमेल आयडी", "label_en": "Email ID", "type": "email", "required": True},
            {"key": "password", "label_mr": "पासवर्ड", "label_en": "Password", "type": "password", "required": True}
        ],
        "instructions": {
            "mr": """नवीन उमेदवार नोंदणीसाठी अधिकृत पायऱ्या:
१. यापूर्वी ITI मध्ये नोंदणी केली आहे का ते निवडा (होय किंवा नाही). जर आधी नोंदणी केली असेल तर आधीचा ITI नोंदणी क्रमांक टाका.
२. तुमचे नाव (पहिले नाव, वडिलांचे नाव, आडनाव) १० वीच्या गुणपत्रिकेनुसार अथवा आधारकार्डनुसार बरोबर टाका.
३. जन्मतारीख (DD/MM/YYYY) आणि लिंग (पुरुष / महिला / इतर) निवडा.
४. १०-अंकी प्राथमिक मोबाईल नंबर टाका आणि 'Verify' बटणावर क्लिक करून OTP तपासा.
५. चालू ईमेल आयडी प्रविष्ट करा.
६. सुरक्षा प्रश्न निवडून किमान ८ अक्षरांचा पासवर्ड तयार करा आणि फॉर्म सबमिट करा.""",
            "en": """Official steps for Candidate Registration:
1. Select whether previously registered with any ITI (Yes or No). If yes, enter previous registration number.
2. Enter your full name (First, Middle, Last) matching your 10th marksheet or Aadhaar card.
3. Select Date of Birth (DD/MM/YYYY) and Gender (Male / Female / Other).
4. Enter 10-digit primary mobile number and verify via OTP.
5. Provide a valid email ID for registration alerts.
6. Select a security question, set a strong 8-character password, and submit."""
        },
        "validation_rules": [
            "मोबाईल नंबर १०-अंकी असावा आणि OTP पडताळणी अनिवार्य आहे.",
            "पासवर्ड किमान ८ अक्षरांचा, किमान १ मोठे अक्षर, १ अंक आणि १ विशेष चिन्ह (@, #) असणे आवश्यक आहे.",
            "१०वी गुणपत्रिकेवरील नाव आणि स्पेलिंग जुळणे गरजेचे आहे."
        ]
    },
    {
        "id": "profile_primary",
        "domain": "candidate_profile",
        "step_number": 1,
        "title": {
            "mr": "१. वैयक्तिक माहिती (Personal Details)",
            "en": "1. Personal Details"
        },
        "route": "/Candidate/Primary",
        "user_type": "Candidate",
        "fields": [
            {"key": "firstName", "label_mr": "पहिले नाव", "label_en": "First Name", "required": True},
            {"key": "middleName", "label_mr": "मधले नाव", "label_en": "Middle Name", "required": False},
            {"key": "lastName", "label_mr": "आडनाव", "label_en": "Last Name", "required": True},
            {"key": "dob", "label_mr": "जन्मतारीख", "label_en": "Date of Birth", "required": True},
            {"key": "gender", "label_mr": "लिंग", "label_en": "Gender", "required": True},
            {"key": "aadhaarNo", "label_mr": "आधार क्रमांक", "label_en": "Aadhaar Number", "required": True},
            {"key": "apaarId", "label_mr": "अपार आयडी (APAAR ID)", "label_en": "APAAR ID", "required": False}
        ],
        "instructions": {
            "mr": """वैयक्तिक माहिती भरण्यासाठी तपशीलवार नियम:
१. पहिले नाव, मधले नाव व आडनाव आधारकार्डवर नमूद केल्याप्रमाणे अचूक भरावे.
२. जन्मतारीख शाळा सोडल्याच्या दाखल्यानुसार (LC) अथवा आधारकार्डनुसार निवडावी.
३. आधार क्रमांक १२-अंकी नमूद करून 'Verify' बटणावर क्लिक करावे. आधार पडताळणीनंतर नाव, लिंग व जन्मतारीख बदलता येत नाही.
४. उपलब्ध असल्यास राष्ट्रीय शिक्षण धोरणानुसार १२-अंकी APAAR ID टाकावा.""",
            "en": """Guidelines for filling Personal Details:
1. Enter First Name, Middle Name, and Last Name exactly as stated on Aadhaar card.
2. Select Date of Birth as verified in the School Leaving Certificate (LC).
3. Enter 12-digit Aadhaar number and click 'Verify'. Once Aadhaar is verified, name, gender, and DOB cannot be modified.
4. If available, enter 12-digit APAAR ID."""
        },
        "validation_rules": [
            "आधार कार्ड १२-अंकी वैध असावे.",
            "लिंग पुरुष (M), महिला (F) किंवा इतर (O) निवडणे बंधनकारक आहे."
        ]
    },
    {
        "id": "profile_address",
        "domain": "candidate_profile",
        "step_number": 2,
        "title": {
            "mr": "२. पत्ता माहिती (Address Details)",
            "en": "2. Address Details"
        },
        "route": "/Candidate/Address",
        "user_type": "Candidate",
        "fields": [
            {"key": "pAddress", "label_mr": "कायमचा पत्ता", "label_en": "Permanent Address", "required": True},
            {"key": "pState", "label_mr": "राज्य", "label_en": "State", "required": True},
            {"key": "pDistrict", "label_mr": "जिल्हा", "label_en": "District", "required": True},
            {"key": "pTaluka", "label_mr": "तालुका", "label_en": "Taluka", "required": True},
            {"key": "pCity", "label_mr": "गाव / शहर", "label_en": "Village / City", "required": True},
            {"key": "pPincode", "label_mr": "पिनकोड", "label_en": "Pincode", "required": True},
            {"key": "isSameAddress", "label_mr": "दोन्ही पत्ते सारखे आहेत का?", "label_en": "Same as Permanent Address?", "required": True}
        ],
        "instructions": {
            "mr": """पत्ता माहिती भरण्यासाठी तपशीलवार सूचना:
१. कायमचा पत्ता (Permanent Address): घराचा क्रमांक, इमारत/चाळ, गल्ली किंवा वस्तीचे नाव भरा.
२. राज्य (महाराष्ट्र), गृहजिल्हा (Home District), तालुका व गाव/शहर ड्रॉपडाउनमधून निवडा.
३. अचूक ६-अंकी टपाल पिनकोड टाका.
४. जर तुमचा सध्याचा पत्रव्यवहार पत्ता कायमच्या पत्त्यासारखाच असेल तर 'Same as Permanent Address' चेकबॉक्सवर टिक करा.""",
            "en": """Instructions for Address Details:
1. Permanent Address: Enter Flat/House No, Building name, and Street/Locality.
2. Select State (Maharashtra), Home District, Taluka, and Village/City from the dropdown lists.
3. Enter valid 6-digit postal PIN code.
4. If correspondence address is the same as permanent, check 'Same as Permanent Address'."""
        },
        "validation_rules": [
            "पिनकोड ६-अंकी वैध भारतीय पिनकोड असावा.",
            "जिल्हा व तालुक्याची निवड अधिकृत यादीतूनच करावी."
        ]
    },
    {
        "id": "profile_parent",
        "domain": "candidate_profile",
        "step_number": 3,
        "title": {
            "mr": "३. पालक माहिती (Parent / Guardian Details)",
            "en": "3. Parent / Guardian Details"
        },
        "route": "/Candidate/Parent",
        "user_type": "Candidate",
        "fields": [
            {"key": "fatherName", "label_mr": "वडिलांचे पूर्ण नाव", "label_en": "Father's Full Name", "required": True},
            {"key": "fatherOccupation", "label_mr": "वडिलांचा व्यवसाय", "label_en": "Father's Occupation", "required": False},
            {"key": "motherName", "label_mr": "आईचे नाव", "label_en": "Mother's Name", "required": True},
            {"key": "familyIncome", "label_mr": "वार्षिक कौटुंबिक उत्पन्न", "label_en": "Annual Family Income", "required": True}
        ],
        "instructions": {
            "mr": "वडिलांचे व आईचे पूर्ण नाव भरावे. शिष्यवृत्ती व सवलतींसाठी सक्षम प्राधिकाऱ्याने दिलेला वार्षिक उत्पन्नाचा दाखला आवश्यक असतो.",
            "en": "Enter father's and mother's full name. Enter annual family income as stated on official income certificate for scholarship eligibility."
        },
        "validation_rules": ["वार्षिक उत्पन्न योग्य स्लॅबमध्ये निवडावे."]
    },
    {
        "id": "profile_category",
        "domain": "candidate_profile",
        "step_number": 4,
        "title": {
            "mr": "४. प्रवर्ग व आरक्षण (Category & Reservation)",
            "en": "4. Category & Reservation"
        },
        "route": "/Candidate/Category",
        "user_type": "Candidate",
        "fields": [
            {"key": "category", "label_mr": "सामाजिक प्रवर्ग", "label_en": "Social Category", "required": True},
            {"key": "casteCertNo", "label_mr": "जात प्रमाणपत्र क्रमांक", "label_en": "Caste Certificate Number", "required": False},
            {"key": "nclStatus", "label_mr": "नॉन-क्रिमिलेअर स्थिती", "label_en": "Non-Creamy Layer Status", "required": False},
            {"key": "disability", "label_mr": "दिव्यांगत्व (PwD)", "label_en": "Person with Disability", "required": False}
        ],
        "instructions": {
            "mr": "योग्य प्रवर्ग (Open / SC / ST / VJ-NT / OBC / SBC / EWS) निवडा. आरक्षित प्रवर्गासाठी जात प्रमाणपत्र व चालू वर्षाचे नॉन-क्रिमिलेअर (NCL) प्रमाणपत्र अनिवार्य आहे.",
            "en": "Select category (Open, SC, ST, VJ-NT, OBC, SBC, EWS). Reserved category candidates must provide caste and valid Non-Creamy Layer certificate."
        },
        "validation_rules": ["VJ/NT, OBC, SBC साठी ३१ मार्चपर्यंत वैध NCL आवश्यक आहे."]
    },
    {
        "id": "profile_qualification",
        "domain": "candidate_profile",
        "step_number": 5,
        "title": {
            "mr": "५. शैक्षणिक पात्रता (Educational Qualification)",
            "en": "5. Educational Qualification"
        },
        "route": "/Candidate/Qualification",
        "user_type": "Candidate",
        "fields": [
            {"key": "board", "label_mr": "मंडळ / बोर्ड", "label_en": "Board Name", "required": True},
            {"key": "seatNo", "label_mr": "बैठक क्रमांक (Roll No)", "label_en": "Seat / Roll Number", "required": True},
            {"key": "passingYear", "label_mr": "उत्तीर्ण वर्ष", "label_en": "Passing Year", "required": True},
            {"key": "marksObtained", "label_mr": "मिळालेले गुण", "label_en": "Marks Obtained", "required": True},
            {"key": "totalMarks", "label_mr": "एकूण गुण", "label_en": "Total Marks", "required": True},
            {"key": "mathMarks", "label_mr": "गणित गुण", "label_en": "Mathematics Marks", "required": True},
            {"key": "scienceMarks", "label_mr": "विज्ञान गुण", "label_en": "Science Marks", "required": True}
        ],
        "instructions": {
            "mr": "१० वी (SSC) चे गुण, बैठक क्रमांक व उत्तीर्ण वर्ष गुणपत्रिकेनुसार अचूक भरावे. तांत्रिक अभ्यासक्रमांसाठी गणित व विज्ञान विषयाचे गुण अनिवार्य असतात.",
            "en": "Enter 10th (SSC) marks, seat number, and passing year matching your marksheet. Math and Science marks are required for technical trades."
        },
        "validation_rules": ["मिळालेले गुण एकूण गुणांपेक्षा जास्त नसावेत."]
    },
    {
        "id": "profile_training",
        "domain": "candidate_profile",
        "step_number": 6,
        "title": {
            "mr": "६. मागील प्रशिक्षण माहिती (Previous Training Details)",
            "en": "6. Previous Training Details"
        },
        "route": "/Candidate/Training",
        "user_type": "Candidate",
        "fields": [
            {"key": "hasPreviousTraining", "label_mr": "मागील प्रशिक्षण घेतले आहे का?", "label_en": "Has Previous Training?", "required": True},
            {"key": "tradeName", "label_mr": "ट्रेडचे नाव", "label_en": "Trade Name", "required": False}
        ],
        "instructions": {
            "mr": "यापूर्वी कोणत्याही ITI अथवा व्होकेशनल अभ्यासक्रमात प्रशिक्षण घेतले असल्यास त्याची माहिती द्यावी.",
            "en": "Enter details of any prior vocational or ITI training completed."
        },
        "validation_rules": []
    },
    {
        "id": "profile_additional",
        "domain": "candidate_profile",
        "step_number": 7,
        "title": {
            "mr": "७. अतिरिक्त माहिती व अधिवास (Additional Details)",
            "en": "7. Additional Details"
        },
        "route": "/Candidate/Additional",
        "user_type": "Candidate",
        "fields": [
            {"key": "homeDistrict", "label_mr": "मूळ गृहजिल्हा", "label_en": "Home District", "required": True},
            {"key": "domicile", "label_mr": "महाराष्ट्र अधिवास (Domicile)", "label_en": "Maharashtra Domicile", "required": True},
            {"key": "minority", "label_mr": "अल्पसंख्याक प्रवर्ग", "label_en": "Minority Status", "required": False}
        ],
        "instructions": {
            "mr": "गृहजिल्ह्यातील ७०% जागांवरील प्रवेशासाठी मूळ जिल्हा योग्य निवडणे अत्यंत महत्त्वाचे आहे.",
            "en": "Select home district accurately as 70% seats are reserved for home district candidates."
        },
        "validation_rules": []
    },
    {
        "id": "profile_bank",
        "domain": "candidate_profile",
        "step_number": 8,
        "title": {
            "mr": "८. बँक तपशील (Bank Account Details)",
            "en": "8. Bank Account Details"
        },
        "route": "/Candidate/Bank",
        "user_type": "Candidate",
        "fields": [
            {"key": "accountNo", "label_mr": "बँक खाते क्रमांक", "label_en": "Account Number", "required": True},
            {"key": "accountHolder", "label_mr": "खातेदाराचे नाव", "label_en": "Account Holder Name", "required": True},
            {"key": "bankName", "label_mr": "बँकेचे नाव", "label_en": "Bank Name", "required": True},
            {"key": "ifscCode", "label_mr": "आयएफएससी कोड (IFSC)", "label_en": "IFSC Code", "required": True}
        ],
        "instructions": {
            "mr": "विद्यावेतन (Stipend) अथवा शासकीय शिष्यवृत्ती जमा होण्यासाठी उमेदवाराच्या स्वतःच्या नावाचे राष्ट्रीयकृत बँक खाते असणे आवश्यक आहे.",
            "en": "Provide candidate's own active nationalized bank account for scholarship and stipend direct benefit transfers."
        },
        "validation_rules": ["IFSC कोड ११-अंकी वैध असावा."]
    },
    {
        "id": "profile_work_exp",
        "domain": "candidate_profile",
        "step_number": 9,
        "title": {
            "mr": "९. कामाचा अनुभव (Work Experience)",
            "en": "9. Work Experience"
        },
        "route": "/Candidate/WorkExperience",
        "user_type": "Candidate",
        "fields": [
            {"key": "hasExperience", "label_mr": "कामाचा अनुभव आहे का?", "label_en": "Has Experience?", "required": False},
            {"key": "employer", "label_mr": "कंपनी / मालकाचे नाव", "label_en": "Employer Name", "required": False}
        ],
        "instructions": {
            "mr": "उमेदवाराला कामाचा पूर्वीचा अनुभव असल्यास संबंधित कंपनी व पदाची माहिती भरावी. नसल्यास हा टप्पा वगळू शकता.",
            "en": "Enter past work experience if applicable, or skip to the next step."
        },
        "validation_rules": []
    },
    {
        "id": "profile_verify_lock",
        "domain": "candidate_profile",
        "step_number": 10,
        "title": {
            "mr": "१०. कागदपत्रे पडताळणी व अर्ज लॉक (Verify & Lock Profile)",
            "en": "10. Verify & Lock Profile"
        },
        "route": "/Candidate/LockApplicationForm",
        "user_type": "Candidate",
        "fields": [
            {"key": "declaration", "label_mr": "हमीपत्र / घोषणा", "label_en": "Self Declaration", "required": True},
            {"key": "lockStatus", "label_mr": "अर्ज लॉक स्थिती", "label_en": "Form Lock Status", "required": True}
        ],
        "instructions": {
            "mr": """अर्ज अंतिम सबमिट व लॉक करण्याच्या पायऱ्या:
१. सर्व ९ टप्प्यांमधील भरलेली माहिती स्क्रीनवर काळजीपूर्वक तपासा.
२. 'मी सर्व नियम वाचले असून दिलेली माहिती खरी आहे' या हमीपत्रावर (Declaration) क्लिक करा.
३. अर्ज एकदा लॉक झाल्यानंतर स्वतः बदल करता येत नाही; बदलासाठी नजीकच्या ITI स्क्रूटनी केंद्रात जावे लागते.
४. 'Lock Profile' वर क्लिक करून कन्फर्म करा.""",
            "en": """Steps to Verify and Lock Application Profile:
1. Review all 9 completed sections on screen.
2. Accept the candidate legal self-declaration.
3. Note: Once locked, candidate cannot modify details without scrutiny center intervention.
4. Click 'Lock Profile' and confirm to submit for merit list consideration."""
        },
        "validation_rules": [
            "सर्व आवश्यक फील्ड भरल्याशिवाय अर्ज लॉक करता येत नाही.",
            "अंतिम सबमिशनसाठी वापरकर्त्याची स्पष्ट संमती आवश्यक असते."
        ]
    }
]


class SpecializedRegistrationRAGService:
    """Specialized Registration and Form-Filling RAG Layer."""

    def __init__(self):
        self.modules = REGISTRATION_MODULES
        logger.info(f"[RegistrationRAG] Initialized specialized registration RAG with {len(self.modules)} modules.")

    def search_registration_guidance(self, query: str, route: Optional[str] = None, language: str = "mr") -> Optional[Dict[str, Any]]:
        """
        Find exact registration guidance based on current route or user question.
        Returns cleaned, grounded instructions without dashed lines or raw headers.
        """
        q = (query or "").lower().strip()
        lang = "mr" if language in ("mr", "hi") else "en"

        # 1. Route-based resolution
        if route:
            clean_r = route.replace("/React", "").replace("/react", "").rstrip("/")
            for mod in self.modules:
                mod_r = mod["route"].replace("/React", "").replace("/react", "").rstrip("/")
                if clean_r.lower() == mod_r.lower() or clean_r.lower().endswith(mod_r.lower()):
                    return self._format_module_response(mod, lang)

        # 2. Keyword/domain matching
        for mod in self.modules:
            title_mr = mod["title"]["mr"].lower()
            title_en = mod["title"]["en"].lower()
            mod_id = mod["id"].lower()

            if any(k in q for k in [mod_id, title_mr, title_en]):
                return self._format_module_response(mod, lang)

        # 3. Intent topic checks
        if any(k in q for k in ["personal", "वैयक्तिक", "नाव", "first name", "aadhaar", "आधार"]):
            return self._format_module_response(self.modules[1], lang)  # profile_primary
        if any(k in q for k in ["address", "पत्ता", "pincode", "पिनकोड", "district", "जिल्हा", "taluka"]):
            return self._format_module_response(self.modules[2], lang)  # profile_address
        if any(k in q for k in ["qualification", "शिक्षण", "शैक्षणिक", "marksheet", "१० वी", "10th"]):
            return self._format_module_response(self.modules[5], lang)  # profile_qualification
        if any(k in q for k in ["lock", "सबमिट", "submit", "declaration", "verify form", "अंतिम"]):
            return self._format_module_response(self.modules[10], lang) # profile_verify_lock
        if any(k in q for k in ["document", "कागदपत्र", "photo", "फोटो", "signature", "स्वाक्षरी"]):
            return {
                "title": "आवश्यक कागदपत्रे तपशील" if lang == "mr" else "Required Documents Details",
                "instructions": (
                    "नोंदणीसाठी आवश्यक अधिकृत कागदपत्रे:\n"
                    "१. पासपोर्ट फोटो (२० ते ५० KB, JPG)\n"
                    "२. स्वाक्षरी (१० ते २० KB, JPG)\n"
                    "३. १० वी गुणपत्रिका (१ MB च्या आत, PDF/JPG)\n"
                    "४. आधार कार्ड\n"
                    "५. अधिवास / जातीचे प्रमाणपत्र (लागू असल्यास)."
                    if lang == "mr" else
                    "Required documents for registration:\n"
                    "1. Passport Photo (20 to 50 KB, JPG)\n"
                    "2. Scanned Signature (10 to 20 KB, JPG)\n"
                    "3. 10th Standard Marksheet (< 1 MB, PDF/JPG)\n"
                    "4. Aadhaar Card\n"
                    "5. Domicile / Caste Certificate (if applicable)."
                ),
                "route": "/React/candidate/register",
                "step_number": 0
            }

        return None

    def _format_module_response(self, mod: Dict[str, Any], lang: str) -> Dict[str, Any]:
        """Format module details cleanly."""
        title = mod["title"]["mr"] if lang == "mr" else mod["title"]["en"]
        instructions = mod["instructions"]["mr"] if lang == "mr" else mod["instructions"]["en"]
        field_names = [f["label_mr"] if lang == "mr" else f["label_en"] for f in mod["fields"]]

        return {
            "title": title,
            "step_number": mod["step_number"],
            "route": mod["route"],
            "instructions": instructions,
            "fields_summary": ", ".join(field_names),
            "validation_rules": mod["validation_rules"]
        }

    def clean_chunk_text(self, text: str) -> str:
        """
        Strip markdown separator lines, decorative dashes, and standalone headers
        so responses never output raw '3.6 वैयक्तिक माहिती' with dashed lines.
        """
        if not text:
            return ""
        # Remove long lines of dashes or equals
        cleaned = re.sub(r'^[=\-_]{4,}\s*$', '', text, flags=re.MULTILINE)
        # Collapse multiple newlines
        cleaned = re.sub(r'\n{3,}', '\n\n', cleaned).strip()
        return cleaned


registration_rag_service = SpecializedRegistrationRAGService()
