import re
import logging

logger = logging.getLogger(__name__)


class IntentService:
    """Detects user intent from the query using keyword matching with weighted scoring."""

    INTENTS = {
        "NAVIGATION": "NAVIGATION",
        "REGISTRATION": "REGISTRATION",
        "GENERAL_REGISTRATION": "GENERAL_REGISTRATION",
        "STAFF_REGISTRATION": "STAFF_REGISTRATION",
        "INSTITUTE_REGISTRATION": "INSTITUTE_REGISTRATION",
        "PROMOTING_ORG_REGISTRATION": "PROMOTING_ORG_REGISTRATION",
        "FORM_GUIDANCE": "FORM_GUIDANCE",
        "DOCUMENTS": "DOCUMENTS",
        "REGISTRATION_STATUS": "REGISTRATION_STATUS",
        "EXAM": "EXAM",
        "ADMISSION": "ADMISSION",
        "STUDENT_PROFILE": "STUDENT_PROFILE",
        "COURSE": "COURSE",
        "INSTITUTE": "INSTITUTE",
        "GRIEVANCE": "GRIEVANCE",
        "DOWNLOAD": "DOWNLOAD",
        "ASSISTANCE": "ASSISTANCE",
        "FEE": "FEE",
        "REPORT": "REPORT",
        "SYSTEM_ACTION": "SYSTEM_ACTION",
        "KNOWLEDGE": "KNOWLEDGE",
        "GENERAL": "GENERAL",
    }

    # Keywords grouped by intent — includes English, Marathi (Devanagari), and Hinglish
    PATTERNS = {
        "PROMOTING_ORG_REGISTRATION": [
            "promoting organization", "promoting organization registration", "promoting organisation",
            "promoting organisation registration", "promoting org", "promoting org registration",
            "promoter registration", "promotingpograntion", "promotingpograntion registration",
            "promoting pograntion", "promoting orgnization",
            # Marathi
            "प्रवर्तक संस्था नोंदणी", "प्रवर्तक संस्था", "प्रवर्तक नोंदणी", "प्रमोटिंग ऑर्गनायझेशन",
            "प्रवर्तक संस्था रजिस्ट्रेशन",
            # Hinglish
            "promoting organization registration", "pravartak sanstha nondani", "promoting organization nondani",
            "pravartak sanstha", "promoting org registration"
        ],
        "INSTITUTE_REGISTRATION": [
            "institute registration", "register institute", "register an institute", "register as institute",
            "new institute registration", "institute register", "register my institute",
            "affiliated institute registration",
            # Common typos
            "instutite", "instutite registration", "institue", "institue registration", "instutite register",
            # Marathi (Devanagari)
            "संस्था नोंदणी", "संस्थेची नोंदणी", "नवीन संस्था नोंदणी", "संस्था रजिस्ट्रेशन",
            "संस्था नोंदणी करायची आहे", "संस्थेची नोंदणी करायची आहे", "संस्था नोंदणी कशी करावी",
            "संस्थेची नोंदणी कशी करायची", "संस्था नोंदणी कशी करू", "संस्था नोंदणी कशी करू?",
            "इन्स्टिट्यूट नोंदणी", "इन्स्टिट्यूट रजिस्ट्रेशन", "इन्स्टिट्यूट रजिस्ट्रेशन करायचा आहे",
            "इन्स्टिट्यूट रजिस्ट्रेशन करायचे आहे", "मला इन्स्टिट्यूट रजिस्ट्रेशन करायचा आहे",
            "मला इन्स्टिट्यूट रजिस्ट्रेशन करायचे आहे", "इन्स्टिट्यूट रजिस्टर", "इन्स्टिट्युट नोंदणी",
            "इन्स्टिट्युट रजिस्ट्रेशन", "नवीन इन्स्टिट्यूट सुरू करायची आहे", "नवीन संस्था सुरू करायची आहे",
            "संस्था अर्ज",
            # Hinglish / Roman Marathi
            "institute registration kasa karu", "institute registration kasa karu?",
            "institute registration karaycha aahe", "institute registration karaycha ahe",
            "institute registration karaycha", "institute la register karyachy",
            "institute la register karaycha", "institute register karaycha", "sanstha nondani kasa karu",
            "sanstha nondani kashi karaychi", "mala institute registration karaycha aahe",
            "sanstha nondani", "sanstha register", "sanstha nondani karaychi", "navin institute kadhaychi",
            "navin sanstha suru karaychi"
        ],
        "STAFF_REGISTRATION": [
            "staff registration", "register as staff", "register staff", "staff registration form",
            "employee registration", "staff signup", "i want to register as staff",
            # Marathi
            "स्टाफ रजिस्ट्रेशन करायचं आहे", "स्टाफ रजिस्ट्रेशन करायचे आहे", "स्टाफ रजिस्ट्रेशन",
            "कर्मचारी नोंदणी", "कर्मचारी नोंदणी करायची आहे", "कर्मचारी नोंदणी कशी करावी",
            "स्टाफ नोंदणी", "कर्मचारी रजिस्ट्रेशन", "स्टाफ फॉर्म",
            # Hinglish
            "staff registration karaycha aahe", "staff registration karaycha ahe",
            "staff registration karaycha", "mala staff registration karaycha aahe",
            "staff nondani", "staff form bharaycha", "staff register karaycha",
            "staff registration kasa karu"
        ],
        "REGISTRATION": [
            "candidate registration", "register as candidate", "register as a candidate",
            "i want to register as a candidate", "register me", "candidate registration form",
            "fill candidate form", "candidate form", "candidate signup",
            "fill registration", "fill form", "my name is", "my email is",
            "my mobile is", "first name", "last name", "date of birth",
            # Marathi Devanagari
            "कॅंडिडेट रजिस्ट्रेशन करायचं आहे", "कॅंडिडेट रजिस्ट्रेशन करायचे आहे", "कॅंडिडेट रजिस्ट्रेशन",
            "कॅन्डिडेट रजिस्ट्रेशन", "कँडिडेट रजिस्ट्रेशन", "कॅंडिडेट नोंदणी", "कॅन्डिडेट नोंदणी",
            "उमेदवार नोंदणी", "उमेदवार नोंदणी करायची आहे", "उमेदवार नोंदणी करायची", "उमेदवार रजिस्ट्रेशन",
            "कॅंडिडेट फॉर्म", "कॅन्डिडेट फॉर्म", "विद्यार्थी नोंदणी", "कॅंडिडेट अर्ज",
            "अर्ज भरणे", "अर्ज भरून द्या", "माझे नाव", "माझे आडनाव", "माझा मोबाईल", "माझा ईमेल",
            "माझी जन्मतारीख",
            # Roman Marathi / Hinglish
            "candidate registration karaycha aahe", "candidate registration karaycha ahe",
            "candidate registration karaycha", "mala candidate registration karaycha aahe",
            "mala candidate registration karaycha", "candidate registration kasa karu",
            "candidate form bharaycha", "candidate form bharun de", "candidate nondani",
            "majha first name", "majha nav", "majha mobile", "majha email", "email chukla",
            "correct email", "nav badla", "form bhar"
        ],
        "GENERAL_REGISTRATION": [
            "i want to register", "how to register", "how do i register", "start registration",
            "want to register", "registration process", "new registration", "register here",
            "i want registration", "registration help",
            # Marathi Devanagari
            "नोंदणी करायची आहे", "नोंदणी करायची", "नोंदणी कशी करावी", "नोंदणी कशी करायची",
            "रजिस्ट्रेशन करायचे आहे", "रजिस्ट्रेशन करायचं आहे", "रजिस्ट्रेशन करायचे",
            "मला नोंदणी करायची आहे", "मला रजिस्ट्रेशन करायचे आहे", "नोंदणी सुरू करा",
            # Roman Marathi / Hinglish
            "mala registration karaycha aahe", "registration karaycha aahe", "registration karaycha ahe",
            "mala registration karaycha", "registration karaycha", "mala nondani karaychi aahe",
            "nondani karaychi aahe", "nondani karaycha aahe", "registration kasa karu",
            "registration kashi karaychi", "nondani kashi karaychi", "registration kasa karaycha"
        ],
        "FORM_GUIDANCE": [
            "how to fill form", "how to fill the form", "form filling", "what should i do next",
            "what to do next", "what next", "next step", "what is next step", "help me fill form",
            # Marathi
            "फॉर्म कसा भरायचा", "फॉर्म कसा भरावा", "अर्ज कसा भरायचा", "अर्ज कसा भरावा",
            "पुढे काय करू", "पुढे काय करावे", "पुढे काय करायचे", "पुढील पायरी काय",
            "फॉर्म भरण्यास मदत करा", "अर्ज भरून द्या",
            # Hinglish
            "form kasa bharaycha", "form kasa bharu", "form kasa bharaycha?",
            "pudhe kay karu", "pudhe kay karu?", "pudhe kay karayche", "pudhe kay",
            "next step kay aahe", "next step kay"
        ],
        "DOCUMENTS": [
            "documents required", "required documents", "what documents are required",
            "document list", "documents needed", "which documents are required", "document requirements",
            # Marathi
            "कागदपत्रे काय लागतील", "कोणती कागदपत्रे लागतील", "कागदपत्रांची यादी", "आवश्यक कागदपत्रे",
            "कागदपत्रे", "डॉक्युमेंट्स काय लागतील", "कोणते डॉक्युमेंट्स लागतील",
            # Hinglish
            "documents kay lagtil", "documents lagtat", "konti documents lagtil", "document list"
        ],
        "REGISTRATION_STATUS": [
            "registration status", "application status", "check status", "check registration status",
            "track application", "application tracking",
            # Marathi
            "नोंदणी स्थिती", "अर्जाची स्थिती", "स्टेटस तपासा", "फॉर्म स्टेटस", "अर्जाचे स्टेटस",
            # Hinglish
            "status kay aahe", "status check karaycha", "application status dakhva"
        ],
        "NAVIGATION": [
            "navigate", "go to", "where is", "find page", "website", "menu",
            "how to use", "how do i", "where can i", "link", "page", "section",
            "homepage", "home page", "open", "redirect", "take me to", "show me the page",
            "take me to candidate dashboard", "take me to dashboard", "open dashboard",
            "open registration page", "open courses page", "candidate dashboard", "dashboard",
            "login", "student login", "institute login", "contact us",
            # Marathi
            "कुठे", "पृष्ठ", "वेबसाइट", "मेनू", "दुवा", "कसे वापरावे", "लॉगिन",
            "विद्यार्थी लॉगिन", "संस्था लॉगिन", "संपर्क", "डॅशबोर्ड", "डॅशबोर्ड उघडा",
            "डॅशबोर्डवर घेऊन जा", "नोंदणी पेज", "पेज उघडा", "घेऊन जा",
            "दाखवा", "कोर्सेस दाखवा", "कॅन्डिडेट डॅशबोर्ड",
            # Hinglish / Roman Marathi
            "kuthe", "page kuthe", "kasa vapraycha", "website kashi",
            "login kuthe", "contact kuthe", "kuthla page",
            "gheun ja", "var gheun ja", "dashboard var gheun ja", "candidate dashboard var gheun ja",
            "dashboard open kar", "registration page open kar", "courses page dakhav", "courses dakhav",
            "page dakhav", "var ja", "open kar"
        ],
        "COURSE": [
            "course", "courses", "program", "programme", "training", "learn", "study",
            "skill", "sector", "trade", "duration", "syllabus", "curriculum",
            "computer course", "electrician", "fitter", "ai course", "machine learning",
            "healthcare", "beauty", "available courses", "course list", "diploma",
            "certificate course", "short term", "long term", "show courses", "list courses",
            # Interruption & Discovery phrases
            "thamb, mala available courses dakhav", "thamb mala available courses dakhav",
            "mala courses dakhav", "available courses dakhav", "kontya courses sathi registration chalu aahe",
            "mala ai related course pahije", "mi ya course sathi eligible aahe ka",
            "available courses chi list dakhav", "courses dakhva", "courses chi list dakhva",
            # Marathi (Devanagari)
            "कोर्स", "अभ्यासक्रम", "प्रशिक्षण", "शिकणे", "कौशल्य", "व्यापार",
            "कालावधी", "अभ्यासक्रम यादी", "संगणक", "विद्युत", "आरोग्य",
            "कोर्सेस दाखवा", "उपलब्ध कोर्सेस दाखवा", "कोर्सेसची यादी दाखवा",
            "कोणत्या कोर्सेससाठी नोंदणी चालू आहे", "मला कोर्सेस दाखवा", "थांब मला कोर्सेस दाखव",
            # Hinglish / Roman Marathi
            "kourse", "shikaycha", "konata course", "course list dakhva",
            "courses sangaa", "training kaay", "course konale", "mala course pahije",
            "available courses", "courses dakhav"
        ],

        "INSTITUTE": [
            "institute", "institutes", "college", "center", "centre", "training center",
            "school", "campus", "branch", "near me", "location", "address",
            "instutite", "institue", "iti college", "vocational institute",
            "in pune", "in mumbai", "in nagpur", "in nashik", "in thane",
            "in aurangabad", "in kolhapur", "in solapur", "in sangli", "in satara",
            "in ratnagiri", "in latur", "in nanded", "district",
            "affiliated institutes", "institute list", "list of institutes",
            # Marathi
            "संस्था", "महाविद्यालय", "केंद्र", "शाळा", "शाखा", "जिल्हा",
            "इन्स्टिट्यूट", "इन्स्टिट्युट", "इंस्टिट्यूट", "संस्था यादी", "संस्था शोधा",
            "पुण्यातील", "मुंबईतील", "नागपूरमधील", "नाशिकमधील", "ठाण्यातील",
            # Hinglish
            "kendra", "sanstha", "institute kuthe", "institute sangaa", "sanstha dakhav",
            "Pune madhil", "Mumbai madhil", "institute list", "instutite kuthe"
        ],
        "ADMISSION": [
            "admission", "admit", "enroll", "enrolment", "enrollment", "apply",
            "application", "eligibility", "eligible", "qualification",
            "10th pass", "12th pass", "10th", "12th", "graduate", "ssc", "hsc",
            "after 10th", "after 12th", "job oriented", "career", "recommend",
            "suggest", "what can i do", "best course", "suitable",
            "which course", "what should i study", "i completed", "i passed",
            # Marathi
            "प्रवेश", "अर्ज", "पात्रता", "दहावी", "बारावी", "पदवीधर",
            "नोकरी", "करिअर", "शिफारस", "सुचवा", "मी काय करू", "चांगला कोर्स",
            "कोणता कोर्स", "माझ्यासाठी", "योग्य",
            # Hinglish
            "pravesh", "qualify", "10vi pass", "12vi pass", "mi kay karu",
            "admission kashi ghyaychi", "konata course changla", "mala suggest kara"
        ],
        "EXAM": [
            "hall ticket", "hallticket", "admit card", "timetable", "time table", "exam timetable",
            "exam schedule", "exam circular", "exam pattern", "marking scheme", "exam result",
            "marksheet", "grade card", "exam fee", "exam fees", "seating arrangement", "seat arrangement",
            "assessment marks", "stt assessment", "bcls result",
            # Marathi
            "हॉल तिकीट", "हॉलतिकीट", "प्रवेशपत्र", "वेळापत्रक", "परीक्षा वेळापत्रक", "परीक्षा परिपत्रक",
            "परीक्षा पद्धत", "गुणपद्धती", "परीक्षेचा निकाल", "गुणपत्रिका", "परीक्षा फी", "बैठक व्यवस्था",
            "प्रात्यक्षिक गुण", "मूल्यांकन गुण",
            # Hinglish
            "hall ticket kuthe", "admit card kadhi", "timetable dakhva", "result kadhi", "exam fee kashi bharaychi"
        ],
        "GRIEVANCE": [
            "complaint", "grievance", "complaint status", "grievance status", "register complaint",
            "file complaint", "lodge complaint", "problem with institute", "harassment",
            # Marathi
            "तक्रार", "तक्रार नोंदवा", "तक्रार नोंदणी", "तक्रार स्थिती", "तक्रार निवारण", "अडचण",
            # Hinglish
            "takrar", "takrar nondva", "complaint kashi karaychi", "takrar status"
        ],
        "STUDENT_PROFILE": [
            "my profile", "candidate profile", "change address", "update address", "my qualification",
            "my marks", "my bank details", "update bank", "attendance", "biometric attendance",
            "my attendance", "academisthan", "e-learning", "bcls", "aadhaar", "aadhaar kyc", "lock form", "unlock form",
            # Marathi
            "माझे प्रोफाइल", "पत्ता बदला", "माझे शिक्षण", "माझे गुण", "बँक खाते", "बँक तपशील",
            "माझी हजेरी", "बायोमेट्रिक", "अकादमिस्थान", "आधार पडताळणी", "अर्ज लॉक", "अर्ज अनलॉक",
            # Hinglish
            "majha profile", "address badla", "bank details update", "hajeri kiti aahe", "attendance dakhva"
        ],
        "ASSISTANCE": [
            "faq", "frequently asked questions", "schedule meeting", "book meeting", "appointment",
            "meet officer", "visit scheduler", "help center",
            # Marathi
            "वारंवार विचारले जाणारे प्रश्न", "बैठक", "मीटिंग", "अधिकाऱ्यांना भेटा", "भेट नियोजक",
            # Hinglish
            "meeting kadhi", "officer la bheta", "appointment pahije"
        ],
        "FEE": [
            "fee receipt", "receipt", "online receipt", "transaction history", "payment receipt",
            "fee structure", "how much fee", "tuition fee", "registration fee info",
            # Marathi
            "पावती", "फी पावती", "ऑनलाइन पावती", "व्यवहार इतिहास", "शुल्क रचना", "फी किती आहे",
            # Hinglish
            "receipt download", "fee receipt kuthe", "payment zala ka"
        ],
        "REPORT": [
            "report", "reports", "reports list", "gazette", "exam gazette", "approved candidates",
            "admitted candidates", "rejected candidates", "cancelled candidates", "principal report",
            # Marathi
            "अहवाल", "गॅझेट", "बोर्ड गॅझेट", "मंजूर विद्यार्थी यादी", "प्रवेशित विद्यार्थी", "नामंजूर विद्यार्थी",
            # Hinglish
            "gazette dakhva", "reports list kuthe", "approved list"
        ],
        "SYSTEM_ACTION": [
            "scroll down", "scroll up", "scroll to top", "scroll to bottom", "print page", "print this",
            "turn off voice", "mute audio", "turn on voice", "unmute", "switch to marathi", "switch to english",
            "speak in marathi", "speak in english", "clear chat", "reset chat", "logout", "sign out",
            # Marathi
            "खाली स्क्रोल करा", "वर स्क्रोल करा", "प्रिंट करा", "आवाज बंद करा", "आवाज सुरू करा",
            "मराठीत बोला", "इंग्रजीत बोला", "चॅट साफ करा", "लॉगआउट करा", "बाहेर पडा",
            # Hinglish
            "scroll kar", "print kar", "awaj band kar", "awaj suru kar", "marathi madhe bol"
        ],
        "DOWNLOAD": [
            "download", "file", "pdf", "document", "form", "circular",
            "handbook", "manual", "brochure", "prospectus", "download form",
            "get pdf", "show pdf", "user manual", "affiliation handbook",
            # Marathi
            "डाउनलोड", "फाइल", "दस्तऐवज", "फॉर्म", "परिपत्रक",
            "पुस्तिका", "माहितीपुस्तक", "हस्तपुस्तिका",
            # Hinglish
            "download kuthe", "pdf dya", "form download", "manual dakhva"
        ],
        "KNOWLEDGE": [
            "what is msbsvet", "about msbsvet", "tell me about", "explain",
            "information about", "details about", "affiliation", "examination",
            "exam", "result", "certificate", "notification",
            "announcement", "news", "update", "history", "board",
            # Marathi
            "काय आहे", "बद्दल", "सांगा", "माहिती", "तपशील",
            "संलग्नता", "परीक्षा", "निकाल", "प्रमाणपत्र",
            "सूचना", "बातमी", "अद्ययावत",
            # Hinglish
            "kay aahe", "mahiti", "sangaa", "MSBSVET mhanje kay",
            "exam kadhi", "result kadhi"
        ]
    }

    # Higher weight = more likely to win tie-breaking
    WEIGHTS = {
        "SYSTEM_ACTION": 8,
        "PROMOTING_ORG_REGISTRATION": 7,
        "INSTITUTE_REGISTRATION": 7,
        "STAFF_REGISTRATION": 7,
        "REGISTRATION": 6,
        "GENERAL_REGISTRATION": 6,
        "FORM_GUIDANCE": 6,
        "DOCUMENTS": 6,
        "REGISTRATION_STATUS": 6,
        "COURSE": 5,
        "EXAM": 4,
        "GRIEVANCE": 4,
        "STUDENT_PROFILE": 4,
        "ADMISSION": 3,
        "FEE": 3,
        "REPORT": 3,
        "ASSISTANCE": 3,
        "INSTITUTE": 2,
        "DOWNLOAD": 2,
        "NAVIGATION": 1,
        "KNOWLEDGE": 1
    }

    @classmethod
    def detect_intent(cls, query: str) -> tuple[str, float]:
        """Detect intent from user query.
        
        Returns:
            tuple of (intent_name, confidence_score)
            confidence_score is 0.0-1.0
        """
        q = query.lower().strip()
        scores = {intent: 0 for intent in cls.INTENTS.keys() if intent != "GENERAL"}

        for intent_name, keywords in cls.PATTERNS.items():
            for keyword in keywords:
                kw = keyword.lower()
                # Use word boundary matching for short keywords to avoid false matches
                if len(kw) <= 3:
                    if re.search(r'\b' + re.escape(kw) + r'\b', q):
                        scores[intent_name] += cls.WEIGHTS.get(intent_name, 1)
                else:
                    if kw in q:
                        scores[intent_name] += cls.WEIGHTS.get(intent_name, 1)

        # High-priority semantic and phrase boosters
        # 1. Course discovery booster (e.g. "Course dakhav mala", "मला कोर्स दाखव", "show courses")
        if re.search(r'(?:course|कोर्स|अभ्यासक्रम).*(?:dakhav|dakhva|सांग|दाखवा|बघाय|पाहिजे|list|यादी|show|view|option)|(?:dakhav|dakhva|दाखवा|सांग|show|view|list).*(?:course|कोर्स|अभ्यासक्रम)', q):
            scores["COURSE"] += 25

        # 2. Documents prerequisite inquiry (e.g. "कागदपत्रे काय लागतील?", "documents required")
        if re.search(r'(?:document|कागदपत्र|कागदपत्रे|dastavej|दस्तावेज).*(?:require|लाग|needed|यादी|list|काय|what|सांग)|(?:require|लाग|needed|list).*(?:document|कागदपत्र)', q):
            scores["DOCUMENTS"] += 30

        # 3. Registration / application status inquiry (e.g. "माझ्या अर्जाची स्थिती काय आहे?", "registration status")
        if re.search(r'(?:status|स्थिती|तपासा|check).*(?:application|registration|नोंदणी|अर्ज)|(?:application|registration|नोंदणी|अर्ज).*(?:status|स्थिती|check|तपासा)', q):
            scores["REGISTRATION_STATUS"] += 30

        # 4. Form-filling assistance & next step (e.g. "Form kasa bharaycha?", "Pudhe kay karu?", "पुढे काय करू?")
        if re.search(r'(?:form|अर्ज|फॉर्म).*(?:kasa|कसा|bhar|भर|fill|how|guide|मदत)|(?:pudhe|पुढे).*(?:kay|काय|karu|करू|कर|next)|(?:next\s*step|what\s*next|what\s*should\s*i\s*do)', q):
            scores["FORM_GUIDANCE"] += 30

        # 5. Role-specific registration boosters
        is_candidate_explicit = any(k in q for k in ["candidate", "कॅंडिडेट", "कँडिडेट", "कॅन्डिडेट", "उमेदवार"])
        is_staff_explicit = any(k in q for k in ["staff", "कर्मचारी", "शिक्षक"])
        is_inst_explicit = any(k in q for k in ["institute", "sanstha", "संस्था", "संस्थेची", "इन्स्टिट्यूट", "इन्स्टिट्युट"])
        is_prom_explicit = any(k in q for k in ["promoting", "pravartak", "प्रवर्तक"])
        is_reg_action = any(k in q for k in ["register", "registration", "नोंदणी", "रजिस्ट्रेशन", "karaycha", "karaychi", "करू", "करायचं", "करायचे", "करायची", "form", "फॉर्म", "अर्ज"])

        if is_prom_explicit and is_reg_action:
            scores["PROMOTING_ORG_REGISTRATION"] += 35
        elif is_inst_explicit and is_reg_action:
            scores["INSTITUTE_REGISTRATION"] += 35
        elif is_staff_explicit and is_reg_action:
            scores["STAFF_REGISTRATION"] += 35
        elif is_candidate_explicit and is_reg_action:
            scores["REGISTRATION"] += 35
        elif is_reg_action and not (is_candidate_explicit or is_staff_explicit or is_inst_explicit or is_prom_explicit):
            # Generic registration without role specified -> GENERAL_REGISTRATION (triggers role clarification)
            scores["GENERAL_REGISTRATION"] += 25

        best_intent = "GENERAL"
        best_score = 0

        for intent, score in scores.items():
            if score > best_score:
                best_score = score
                best_intent = intent

        # Safeguard: If query contains promoting org or institute / sanstha and registration / register,
        # ensure it maps to PROMOTING_ORG_REGISTRATION or INSTITUTE_REGISTRATION, never candidate REGISTRATION
        if is_prom_explicit and is_reg_action:
            best_intent = "PROMOTING_ORG_REGISTRATION"
            best_score = max(best_score, 10)
        elif is_inst_explicit and is_reg_action:
            best_intent = "INSTITUTE_REGISTRATION"
            best_score = max(best_score, 10)

        # Calculate confidence (normalize score)
        max_possible = max(len(cls.PATTERNS.get(best_intent, [])) * cls.WEIGHTS.get(best_intent, 1), 1)
        confidence = min(best_score / max_possible, 1.0) if best_score > 0 else 0.0

        logger.info(f"Intent detected: {best_intent} (score: {best_score}, confidence: {confidence:.2f})")
        return best_intent, confidence


intent_service = IntentService()
