from google import genai
from app.core.config import settings
from app.models.schemas import Course, Institute, Action, Download, QuickReply
import re
import json
import logging
from collections import defaultdict

logger = logging.getLogger(__name__)


class ChatService:
    """Main chat service with LLM integration, conversation memory, and structured output."""

    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        # In-memory conversation history keyed by session_id
        self._history: dict[str, list[dict]] = defaultdict(list)

    def detect_language(self, text: str) -> str:
        """Detect language: 'en' (English), 'mr' (Marathi), 'hi' (Hinglish Marathi)."""
        # Check for Devanagari script
        if re.search(r'[\u0900-\u097F]', text):
            return "mr"

        # Hinglish Marathi patterns (Romanized Marathi words)
        hinglish_words = (
            r'\b(tu|mi|mala|tula|ahe|ahet|kay|kasa|kase|kadhi|kuthe|'
            r'shakto|shakate|karu|karaycha|karaychi|karayche|chale|chalt|chalel|'
            r'sangaa|sangu|dakhva|dakhava|pahije|havi|ghyaychay|ghyaycha|ghyaychi|'
            r'aahe|nahi|honar|kadhiparyant|kiti|konti|konata|konache|sagla|sarkha|'
            r'barobar|changla|changali|changale|majha|mazha|tumcha|tumhi|amhi|'
            r'tyanche|shikvaa|shikaycha|milel|milayla|jar|tar|mhanun|pan|ani|'
            r'kinva|ki|pudhe|ata|mag|adhi|nantar|karan|mhanje|kuthala|kuthali|'
            r'kuthale|pass|paas|pravesh|sanstha|kourse|mahiti|'
            r'bhar|bharaycha|bharaychi|bharayche|nondani|kagadpatre|arja)\b'
        )
        has_hinglish = re.search(hinglish_words, text, re.IGNORECASE)
        has_english = re.search(r'[A-Za-z]', text)

        if has_hinglish:
            matches = re.findall(hinglish_words, text, re.IGNORECASE)
            if len(matches) >= 2:
                return "hi"  # Hinglish Marathi
            if not has_english:
                return "mr"

        if has_english:
            return "en"

        return "en"  # Default to English

    def _get_history(self, session_id: str) -> list[dict]:
        """Get conversation history for a session."""
        return self._history.get(session_id, [])

    def _add_to_history(self, session_id: str, role: str, content: str):
        """Add a message to conversation history."""
        self._history[session_id].append({"role": role, "content": content})
        # Keep only the last N messages
        max_msgs = settings.MAX_HISTORY_MESSAGES
        if len(self._history[session_id]) > max_msgs:
            self._history[session_id] = self._history[session_id][-max_msgs:]

    def _build_system_prompt(self, lang: str, intent: str, current_page: str = None, page_context: dict = None) -> str:
        """Build the system prompt for the LLM."""
        page_context_text = ""
        if page_context and isinstance(page_context, dict):
            u_type = page_context.get("user_type", "General")
            f_id = page_context.get("form_id", "None")
            filled = page_context.get("fields", {}).get("filled", [])
            empty = page_context.get("fields", {}).get("empty", [])
            invalid = page_context.get("fields", {}).get("invalid", [])
            focused = page_context.get("fields", {}).get("focused")
            last_act = page_context.get("last_action")
            act_desc = f"{last_act.get('action')} ({last_act.get('status')})" if isinstance(last_act, dict) and last_act.get('action') else "None"
            page_context_text = f"""
LIVE PAGE & FORM CONTEXT:
- Active Form: {f_id} (Registration Type: {u_type})
- Visible Fields Filled: {', '.join(filled) if filled else 'None'}
- Required Fields Empty: {', '.join(empty) if empty else 'None'}
- Invalid Fields (Errors): {', '.join(invalid) if invalid else 'None'}
- Currently Focused Field: {focused or 'None'}
- Last Action / Button Click: {act_desc}
When answering "Pudhe kay karu?" or next-step queries, answer based on the real form state above! State which fields are filled and ask for the next empty required field.
"""

        return f"""You are "Kaushalya (कौशल्या)", the official interactive AI assistant of MSBSVET (Maharashtra State Board of Skill, Vocational Education and Training).
You have FULL ACCESS to the entire MSBSVET portal, all of its routes, pages, components, features, and actions. You are fully empowered to perform what the user asks you to do!

CRITICAL RULES:

1. LANGUAGE RULE:
   - If user language is "mr" (Marathi) or "hi" (Hinglish), reply in natural Marathi (Devanagari script) with standard technical English terms (Code-Mixing: "Website", "Candidate Registration", "Form", "Mobile Number", "OTP", "Submit").
   - If user language is "en" (English), reply in clear, professional Indian English.
   - Current user language: {lang}
   - Current page context: {current_page or 'Public Portal'}
{page_context_text}
2. REGISTRATION WORKFLOW & ROLE GUIDANCE:
   - The portal serves multiple user types: Candidate (उमेदवार), Staff (कर्मचारी), Institute (संस्था), and Promoting Organization (प्रवर्तक संस्था).
   - When a user asks to register without specifying their role (e.g. "Mala registration karaycha aahe" / "I want to register" / "नोंदणी करायची आहे"), DO NOT assume Candidate and DO NOT dump document lists! You MUST clarify which type they want:
     "तुम्हाला कोणत्या प्रकारची नोंदणी करायची आहे — Candidate (उमेदवार), Staff (कर्मचारी), Institute (संस्था) की Promoting Organization (प्रवर्तक संस्था)?" (or English equivalent).
   - If user wants CANDIDATE registration (e.g. "कॅंडिडेट रजिस्ट्रेशन करायचं आहे" / "Candidate registration karaycha aahe"):
     * Direct them to /React/candidate/register.
     * Explain the first step: Enter personal details (First Name, Last Name, Date of Birth, Mobile Number).
     * Ask ONLY for the information needed for that step.
     * NEVER dump the "Prerequisites & Documents Required" section when the user is trying to start registration!
     * NEVER ask for Aadhaar numbers, passwords, or OTPs in chat.
   - If user wants STAFF registration (e.g. "Staff registration karaycha aahe"):
     * Direct them to /React/staff/register.
     * Explain the staff verification process.
   - If user wants INSTITUTE registration (e.g. "Institute registration kasa karu?"):
     * Explain that under MSBSVET, to start an institute, the governing organization must first register as a Promoting Organization (प्रवर्तक संस्था) at /React/Public/PromotingOrganizationRegistration.
     * Step 2: Apply for LOI (Letter of Intent) at /React/institute/approval/loi-generation.
     * Step 3: Infrastructure inspection & approval.
   - If user wants PROMOTING ORGANIZATION registration:
     * Direct them to /React/Public/PromotingOrganizationRegistration.
   - If user asks "Pudhe kay karu?" / "Form kasa bharaycha?":
     * Explain the exact next actionable step clearly based on their registration progress.
   - If user asks for DOCUMENTS ("कागदपत्रे काय लागतील?", "documents required"):
     * List verified documents: Color photo (20-50 KB JPG), Signature (10-20 KB JPG), 10th marksheet under 1 MB, Aadhaar card, Domicile/Caste certificate if applicable.
   - If user asks for COURSES ("Course dakhav mala", "मला कोर्स दाखव"):
     * Treat as a separate discovery intent and show official MSBSVET courses (AI & ML, COPA, Electrician, etc.). Never invent fake course names.

3. PERFORM WHAT USER SAYS (ACTIONS):
   - Navigate: {{"label": "...", "type": "navigate", "url": "/React/...", "auto_execute": true}}
   - Form Fill: When candidate provides details (name, email, mobile, gender, dob), extract and return {{"label": "Live Form Fill", "type": "fill_form", "data": {{"firstName": "...", "lastName": "...", "email": "...", "primaryMobile": "..."}}, "auto_execute": true}} and navigate to `/React/candidate/register`.
   - Scroll page: When user says "scroll down", "scroll up", "scroll to top/bottom", include {{"type": "scroll", "data": {{"direction": "down"|"up"|"top"|"bottom"}}, "auto_execute": true}}
   - Print: When user says "print page", include {{"type": "print", "auto_execute": true}}
   - Language: When user asks to change language to Marathi/English, include {{"type": "language", "data": {{"lang": "mr"|"en"}}, "auto_execute": true}}
   - Voice/Mute: When user asks to mute or enable voice, include {{"type": "tts", "data": {{"enabled": true|false}}, "auto_execute": true}}
   - Logout: When user asks to log out, include {{"type": "logout", "auto_execute": true}}

4. PERSONA:
   - Proactive, friendly, highly capable, professional. You represent MSBSVET officially.
   - NEVER tell the user you have limited access or that you cannot assist with a section of the portal.

5. RESPONSE FORMAT:
   You MUST respond with a valid JSON object. No markdown code fences, no extra text — ONLY the JSON:
   {{
     "answer": "Your natural language response text with markdown formatting allowed",
     "courses": [
       {{"name": "...", "description": "...", "duration": "...", "eligibility": "...", "sector": "...", "url": "/React/Public/courses"}}
     ],
     "institutes": [
       {{"name": "...", "district": "...", "address": "...", "courses": ["..."], "url": "/React/Public/institutes"}}
     ],
     "actions": [
       {{"label": "...", "type": "navigate", "url": "/React/...", "auto_execute": true}},
       {{"label": "Autofill Form", "type": "fill_form", "data": {{"firstName": "..."}}, "auto_execute": true}}
     ],
     "downloads": [
       {{"name": "...", "description": "...", "url": "...", "file_type": "pdf"}}
     ]
   }}

6. INTENT: The user query intent is: {intent}
"""

    def generate_response(
        self,
        user_message: str,
        intent: str,
        context_docs: list,
        session_id: str = "default",
        current_page: str = None,
        page_context: dict = None
    ) -> dict:
        """Generate a structured response using Gemini.
        
        Returns:
            dict with keys: answer, language, courses, institutes, actions, downloads
        """
        lang = self.detect_language(user_message)

        # Build context from retrieved documents
        if context_docs:
            context_text = "\n\n---\n\n".join([
                f"[Source: {doc.metadata.get('source_file', doc.metadata.get('source', 'Unknown'))}]\n{doc.page_content}"
                for doc in context_docs
            ])
        else:
            context_text = "No relevant documents found in the knowledge base."

        # Build conversation history string
        history = self._get_history(session_id)
        history_text = ""
        if history:
            history_text = "\n\nCONVERSATION HISTORY:\n"
            for msg in history[-6:]:  # Last 6 messages for context
                role_label = "User" if msg["role"] == "user" else "Kaushalya"
                history_text += f"{role_label}: {msg['content'][:200]}\n"

        # Build the full prompt
        system_prompt = self._build_system_prompt(lang, intent, current_page, page_context)
        user_prompt = f"""{history_text}

CONTEXT (from MSBSVET PDFs and website):
{context_text}

USER QUESTION:
{user_message}

Remember: Respond with ONLY a valid JSON object. No markdown fences. Only include courses/institutes/actions/downloads if you have real data from the context above."""

        # Save user message to history before API call
        self._add_to_history(session_id, "user", user_message)

        try:
            response = self.client.models.generate_content(
                model=settings.LLM_MODEL,
                contents=user_prompt,
                config=genai.types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=settings.LLM_TEMPERATURE,
                    response_mime_type="application/json"
                )
            )

            response_text = response.text.strip()
            
            # Parse JSON response
            result = self._parse_response(response_text, lang, intent)
            
            # Save bot response to history
            self._add_to_history(session_id, "assistant", result["answer"][:300])
            
            return result

        except Exception as e:
            logger.error(f"Error calling Gemini API: {e}")
            if intent == "GENERAL_REGISTRATION":
                gen_answer = (
                    "तुम्हाला कोणत्या प्रकारची नोंदणी करायची आहे — Candidate (उमेदवार), Staff (कर्मचारी), Institute (संस्था) की Promoting Organization (प्रवर्तक संस्था)?"
                    if lang in ("mr", "hi") else
                    "Which type of registration would you like to perform—Candidate, Staff, Institute, or Promoting Organization?"
                )
                self._add_to_history(session_id, "assistant", gen_answer[:300])
                return {
                    "answer": gen_answer,
                    "language": lang,
                    "courses": [],
                    "institutes": [],
                    "actions": [],
                    "downloads": [],
                }

            if intent == "REGISTRATION":
                reg_answer = (
                    "उमेदवार नोंदणी फॉर्म स्क्रीनवर उघडला आहे. नोंदणी सुरू करण्यासाठी आधी तुमचे पहिले नाव (First Name) काय आहे?"
                    if lang in ("mr", "hi") else
                    "The candidate registration form is opened on screen. To begin, what is your First Name?"
                )
                self._add_to_history(session_id, "assistant", reg_answer[:300])
                return {
                    "answer": reg_answer,
                    "language": lang,
                    "courses": [],
                    "institutes": [],
                    "actions": [{
                        "label": "कॅन्डिडेट नोंदणी फॉर्म" if lang in ("mr", "hi") else "Candidate Registration Form",
                        "type": "navigate",
                        "url": "/React/candidate/register",
                        "auto_execute": True,
                        "requires_auth": False
                    }],
                    "downloads": [],
                }

            if intent == "STAFF_REGISTRATION":
                staff_answer = (
                    "कर्मचारी नोंदणी फॉर्म स्क्रीनवर उघडला आहे. कृपया नोंदणीसाठी तुमचा सक्रिय मोबाईल नंबर व प्राथमिक माहिती प्रविष्ट करा."
                    if lang in ("mr", "hi") else
                    "The staff registration form is opened on screen. Please provide your active mobile number and basic details to proceed."
                )
                self._add_to_history(session_id, "assistant", staff_answer[:300])
                return {
                    "answer": staff_answer,
                    "language": lang,
                    "courses": [],
                    "institutes": [],
                    "actions": [{
                        "label": "कर्मचारी नोंदणी फॉर्म" if lang in ("mr", "hi") else "Staff Registration Form",
                        "type": "navigate",
                        "url": "/React/staff/register",
                        "auto_execute": True,
                        "requires_auth": False
                    }],
                    "downloads": [],
                }

            if intent in ("INSTITUTE_REGISTRATION", "PROMOTING_ORG_REGISTRATION"):
                inst_answer = (
                    "नवीन संस्था सुरू करण्यासाठी MSBSVET च्या नियमांनुसार आधी प्रवर्तक संस्था (Promoting Organization) ची नोंदणी करणे आवश्यक असते. मी तुम्हाला प्रवर्तक संस्था नोंदणी पृष्ठावर घेऊन जात आहे.\n\nयेथे नोंदणी पूर्ण झाल्यानंतर तुम्ही LOI (Letter of Intent) साठी अर्ज करू शकता."
                    if lang in ("mr", "hi") else
                    "To start a new Institute under MSBSVET, you must first register your Promoting Organization at /React/Public/PromotingOrganizationRegistration. Once approved, you can apply for an LOI."
                )
                self._add_to_history(session_id, "assistant", inst_answer[:300])
                return {
                    "answer": inst_answer,
                    "language": lang,
                    "courses": [],
                    "institutes": [],
                    "actions": [{
                        "label": "प्रवर्तक संस्था नोंदणी" if lang in ("mr", "hi") else "Promoting Organization Registration",
                        "type": "navigate",
                        "url": "/React/Public/PromotingOrganizationRegistration",
                        "auto_execute": True,
                        "requires_auth": False
                    }],
                    "downloads": [],
                }

            if intent == "DOCUMENTS":
                doc_answer = (
                    "MSBSVET नोंदणीसाठी खालील अधिकृत कागदपत्रे आवश्यक आहेत:\n\n1. रंगीत पासपोर्ट फोटो (२० ते ५० KB, JPG)\n2. स्वाक्षरी (१० ते २० KB, JPG)\n3. १० वी गुणपत्रिका व उत्तीर्ण प्रमाणपत्र (१ MB च्या आत, PDF/JPG)\n4. आधार कार्ड (ओळख पडताळणीसाठी)\n5. अधिवास (Domicile) / जातीचे प्रमाणपत्र (लागू असल्यास)."
                    if lang in ("mr", "hi") else
                    "Here are the required documents for MSBSVET registration:\n\n1. Color Passport Photo (20 to 50 KB, JPG)\n2. Signature (10 to 20 KB, JPG)\n3. 10th Standard Marksheet & Passing Certificate (under 1 MB, PDF/JPG)\n4. Aadhaar Card (for identity verification)\n5. Domicile / Caste Certificate (if applicable)."
                )
                self._add_to_history(session_id, "assistant", doc_answer[:300])
                return {
                    "answer": doc_answer,
                    "language": lang,
                    "courses": [],
                    "institutes": [],
                    "actions": [],
                    "downloads": [],
                }

            if intent == "FORM_GUIDANCE":
                if page_context and isinstance(page_context, dict) and page_context.get("form_id"):
                    f_id = page_context.get("form_id")
                    u_type = page_context.get("user_type", "Candidate")
                    empty = page_context.get("fields", {}).get("empty", [])
                    filled = page_context.get("fields", {}).get("filled", [])
                    if empty:
                        next_field = empty[0]
                        guide_answer = (
                            f"सध्या तुम्ही {u_type} नोंदणी फॉर्म भरत आहात. पुढील आवश्यक पायरी म्हणजे: कृपया {next_field} प्रविष्ट करा."
                            if lang in ("mr", "hi") else
                            f"You are currently filling the {u_type} registration form. Next step: Please enter {next_field}."
                        )
                    else:
                        guide_answer = (
                            "सर्व आवश्यक माहिती भरली आहे. कृपया स्क्रीनवरील माहिती तपासा आणि OTP पडताळणी करून फॉर्म सबमिट करा."
                            if lang in ("mr", "hi") else
                            "All required fields are completed. Please verify via OTP and submit the form."
                        )
                else:
                    page = (current_page or "").lower()
                    if "staff" in page:
                        guide_answer = (
                            "कर्मचारी (Staff) नोंदणी फॉर्म भरताना: प्रथम मूलभूत माहिती व पदनाम भरा, शैक्षणिक पात्रता जोडा, आणि आवश्यक कागदपत्रे अपलोड करा. पुढील पायरीसाठी मला विचारा."
                            if lang in ("mr", "hi") else
                            "Step-by-step Staff form guidance: Enter basic details and designation, add educational qualifications, and upload required documents. Ask 'What should I do next?' anytime."
                        )
                    elif "promoting" in page or "sanstha" in page:
                        guide_answer = (
                            "प्रवर्तक संस्था (Promoting Organization) नोंदणी फॉर्म भरताना: संस्थेचा प्रकार (Trust/Society) निवडा, अधिकृत GR नंबर व नोंदणी क्रमांक भरा, आणि LOI साठी अर्ज करा."
                            if lang in ("mr", "hi") else
                            "Step-by-step Promoting Organization form guidance: Select organization type (Trust/Society), enter registration and GR number, and submit for LOI generation."
                        )
                    else:
                        guide_answer = (
                            "उमेदवार (Candidate) फॉर्म भरताना: आधी वैयक्तिक माहिती (नाव, जन्मतारीख, लिंग) भरा, मोबाईल OTP तपासा, आणि कागदपत्रे अपलोड करा. पुढील पायरीसाठी 'पुढे काय करू?' विचारा."
                            if lang in ("mr", "hi") else
                            "Step-by-step Candidate form guidance: Enter your personal details (name, date of birth, gender), verify mobile via OTP, and upload required documents. Ask 'What should I do next?' anytime."
                        )
                self._add_to_history(session_id, "assistant", guide_answer[:300])
                return {
                    "answer": guide_answer,
                    "language": lang,
                    "courses": [],
                    "institutes": [],
                    "actions": [],
                    "downloads": [],
                }

            if intent == "REGISTRATION_STATUS":
                status_answer = (
                    "तुमच्या नोंदणी व अर्जाची स्थिती तपासण्यासाठी आपण Application ID आणि Password वापरून उमेदवार डॅशबोर्ड (/React/Candidate/dashboard) वर लॉगिन करू शकता."
                    if lang in ("mr", "hi") else
                    "To check your application and registration status, please sign in to the Candidate Dashboard (/React/Candidate/dashboard) using your Application ID and Password."
                )
                self._add_to_history(session_id, "assistant", status_answer[:300])
                return {
                    "answer": status_answer,
                    "language": lang,
                    "courses": [],
                    "institutes": [],
                    "actions": [{
                        "label": "कॅन्डिडेट डॅशबोर्ड" if lang in ("mr", "hi") else "Candidate Dashboard",
                        "type": "navigate",
                        "url": "/React/Candidate/dashboard",
                        "auto_execute": True,
                        "requires_auth": True
                    }],
                    "downloads": [],
                }

            # If session has history, check if this was a follow-up about history to survive quota spikes
            history = self._get_history(session_id)
            if len(history) >= 2:
                all_text = " ".join([h.get("content", "") for h in history])
                name_match = re.search(r'\b(?:name is|nav|नाव|am)\s+([A-Za-z]+)', all_text, re.IGNORECASE)
                trade_match = re.search(r'\b(?:trade|course|study|शिकायचे|trade trade)\s+([A-Za-z\s]+?)(?:\.|$|,|\btrade\b)', all_text, re.IGNORECASE)
                name = name_match.group(1).strip() if name_match else ""
                trade = trade_match.group(1).strip() if trade_match else ""
                if name or trade:
                    res_msg = (
                        f"You previously mentioned your name is {name or 'Candidate'} and you were asking about {trade or 'courses'}."
                        if lang == "en" else
                        f"तुम्ही आधी तुमचे नाव {name or 'उमेदवार'} आणि {trade or 'अभ्यासक्रमा'}बद्दल विचारले होते."
                    )
                    self._add_to_history(session_id, "assistant", res_msg[:300])
                    return {
                        "answer": res_msg,
                        "language": lang,
                        "courses": [],
                        "institutes": [],
                        "actions": [],
                        "downloads": []
                    }

            # If RAG retrieved context from knowledge base, provide clean, structured knowledge snippet
            if context_docs:
                for doc in context_docs:
                    c = doc.page_content.strip()
                    # Strip decorative dashed/equal lines
                    clean_c = re.sub(r'^[=\-_]{4,}\s*$', '', c, flags=re.MULTILINE).strip()
                    clean_c = re.sub(r'\n{3,}', '\n\n', clean_c)
                    if len(clean_c) > 30 and not clean_c.startswith("No relevant"):
                        # Ensure we don't return an isolated header line alone
                        non_header_lines = [l.strip() for l in clean_c.split('\n') if l.strip() and not re.match(r'^[#\d\.\s\-_]+$', l.strip())]
                        if non_header_lines:
                            formatted = "\n".join(non_header_lines[:6])[:450]
                            self._add_to_history(session_id, "assistant", formatted[:300])
                            return {
                                "answer": formatted,
                                "language": lang,
                                "courses": [],
                                "institutes": [],
                                "actions": [],
                                "downloads": []
                            }

            error_msg = (
                "क्षमस्व, सध्या सर्व्हरशी कनेक्ट करण्यात अडचण येत आहे. कृपया पुन्हा प्रयत्न करा."
                if lang in ("mr", "hi") else
                "Sorry, I'm having trouble connecting to the server. Please try again."
            )
            self._add_to_history(session_id, "assistant", error_msg[:300])
            return {
                "answer": error_msg,
                "language": lang,
                "courses": [],
                "institutes": [],
                "actions": [],
                "downloads": [],
            }

    def _parse_response(self, response_text: str, lang: str, intent: str) -> dict:
        """Parse the LLM JSON response into a structured dict and sanitize answer text."""
        try:
            # Try to parse as JSON directly
            data = json.loads(response_text)
        except json.JSONDecodeError:
            # Try to extract JSON from markdown code fences
            json_match = re.search(r'```(?:json)?\s*\n?(.*?)\n?\s*```', response_text, re.DOTALL)
            if json_match:
                try:
                    data = json.loads(json_match.group(1))
                except json.JSONDecodeError:
                    data = {"answer": response_text}
            else:
                data = {"answer": response_text}

        # Normalize and sanitize the answer text (strip dashed separators and empty headings)
        raw_ans = data.get("answer", response_text) or ""
        clean_ans = re.sub(r'^[=\-_]{4,}\s*$', '', str(raw_ans), flags=re.MULTILINE)
        clean_ans = re.sub(r'\n{3,}', '\n\n', clean_ans).strip()

        result = {
            "answer": clean_ans,
            "language": lang,
            "courses": [],
            "institutes": [],
            "actions": [],
            "downloads": [],
        }

        # Parse courses
        for c in data.get("courses", []):
            if isinstance(c, dict) and c.get("name"):
                result["courses"].append(Course(
                    name=c.get("name", ""),
                    description=c.get("description"),
                    duration=c.get("duration"),
                    eligibility=c.get("eligibility"),
                    sector=c.get("sector"),
                    url=c.get("url", "https://msbsvet.edu.in/Public/Courses.aspx")
                ).model_dump())

        # Parse institutes
        for i in data.get("institutes", []):
            if isinstance(i, dict) and i.get("name"):
                result["institutes"].append(Institute(
                    name=i.get("name", ""),
                    address=i.get("address"),
                    district=i.get("district"),
                    courses=i.get("courses"),
                    url=i.get("url", "https://msbsvet.edu.in/Public/Institutes.aspx")
                ).model_dump())

        # Parse actions
        for a in data.get("actions", []):
            if isinstance(a, dict):
                result["actions"].append(Action(
                    label=a.get("label", "Action"),
                    type=a.get("type", "navigate"),
                    url=a.get("url"),
                    data=a.get("data"),
                    auto_execute=a.get("auto_execute", False),
                    requires_auth=a.get("requires_auth", False)
                ).model_dump())

        # Parse downloads
        for d in data.get("downloads", []):
            if isinstance(d, dict) and d.get("name"):
                result["downloads"].append(Download(
                    name=d.get("name", ""),
                    description=d.get("description"),
                    url=d.get("url"),
                    file_type=d.get("file_type", "pdf")
                ).model_dump())

        return result

    def clear_history(self, session_id: str):
        """Clear conversation history for a session."""
        if session_id in self._history:
            del self._history[session_id]
            logger.info(f"Cleared history for session: {session_id}")


chat_service = ChatService()
