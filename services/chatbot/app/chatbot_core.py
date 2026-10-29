"""
MSBSVET KAUSHALYA AI CHATBOT — INTEGRATION LAYER 1
chatbot_core.py: Centralized orchestration for LLM, RAG, Intent, and Conversation Context.

Preserves existing approved architecture:
- Model: gemini-2.5-flash-lite via google.genai
- Embeddings: models/gemini-embedding-001 via langchain_google_genai
- Vector Store: ChromaDB (1,304+ indexed MSBSVET knowledge chunks)
- Multilingual: Marathi (mr), Roman Marathi (Hinglish), Hindi, English (en)
- Context-Aware: Form Guidance, Navigation Actions, Registration Workflows
"""

import re
import logging
from typing import Dict, Any, Optional, List
from google import genai

from app.core.config import settings
from app.models.schemas import ChatRequest, ChatResponse, Course, Institute, Action, Download, QuickReply
from app.services.intent_service import intent_service
from app.services.rag_service import rag_service
from app.services.chat_service import chat_service
from app.services.course_service import course_service
from app.services.institute_service import institute_service
from app.services.navigation_service import navigation_service
from app.services.download_service import download_service

logger = logging.getLogger(__name__)

STOPWORDS = {
    'नाव', 'नांव', 'नावं', 'आडनाव', 'माझं', 'माझे', 'माझा', 'माझी', 'आमचे',
    'आहे', 'असे', 'असून', 'होय', 'नाही', 'कृपया', 'सांगा', 'करा',
    'my', 'name', 'is', 'the', 'first', 'last', 'middle', 'surname', 'full',
    'am', 'i', 'call', 'me', 'mr', 'mrs', 'ms', 'shri', 'smt',
    'aahe', 'ahe', 'nav', 'naav', 'naam', 'majha', 'majhe', 'maza', 'maze',
    'hai', 'mera', 'meri', 'kripya', 'shriman', 'shrimati',
    'है', 'हूँ', 'था', 'थी', 'मेरा', 'मेरी', 'पूरा', 'पहला', 'नाम', 'आयटीआय'
}


class ChatbotCore:
    """
    Unified integration core for MSBSVET AI Chatbot.
    Coordinates intent detection, ChromaDB RAG retrieval, Gemini LLM generation,
    and verified application navigation/autofill actions.
    """

    def __init__(self):
        self.settings = settings
        self.intent_service = intent_service
        self.rag_service = rag_service
        self.chat_service = chat_service
        self.course_service = course_service
        self.institute_service = institute_service
        self.navigation_service = navigation_service
        self.download_service = download_service
        logger.info("[ChatbotCore] Initialized with Gemini 2.5 Flash Lite & ChromaDB RAG.")

    def process_chat(self, request: ChatRequest) -> ChatResponse:
        """
        Main entry point for all chat requests (typed or voice-transcribed).
        
        Args:
            request: ChatRequest containing message, session_id, current_page, and page_context.
            
        Returns:
            ChatResponse with answer, intent, language, courses, institutes, actions, and quick replies.
        """
        user_message = (request.message or "").strip()
        session_id = request.session_id or "default"
        current_page = getattr(request, "current_page", None)
        page_context = getattr(request, "page_context", None)

        if not user_message:
            return ChatResponse(
                intent="GENERAL",
                language="mr",
                answer="नमस्कार! मी कौशल्य AI सहाय्यक आहे. मी तुम्हाला कशी मदत करू शकतो?",
                quick_replies=[
                    QuickReply(label="📚 अभ्यासक्रम माहिती", query="उपलब्ध कोर्सेस कोणते आहेत?"),
                    QuickReply(label="📝 नोंदणी कशी करायची?", query="नोंदणी प्रक्रिया सांगा")
                ]
            )

        try:
            # 1. Language & Intent Detection
            lang = self.chat_service.detect_language(user_message)
            intent, confidence = self.intent_service.detect_intent(user_message)
            logger.info(f"[ChatbotCore][SID:{session_id}] Lang: {lang} | Intent: {intent} (conf: {confidence:.2f}) | Msg: {user_message[:50]}...")

            # 2. Retrieve Context from ChromaDB and Specialized Registration RAG
            context_docs = self.rag_service.retrieve_context(
                user_message,
                intent=intent,
                current_page=current_page,
                page_context=page_context,
                language=lang
            )

            # 3. Generate structured response via LLM
            result = self.chat_service.generate_response(
                user_message=user_message,
                intent=intent,
                context_docs=context_docs,
                session_id=session_id,
                current_page=current_page,
                page_context=page_context
            )

            # 4. Supplement structured data from domain services when LLM doesn't supply enough
            courses = result.get("courses", [])
            institutes = result.get("institutes", [])
            actions = result.get("actions", [])
            downloads = result.get("downloads", [])
            quick_replies = result.get("quick_replies", [])
            lang = result.get("language", "mr")

            # 5. Intent-specific post-processing
            if intent == "GENERAL_REGISTRATION":
                quick_replies = [
                    {"label": "👤 Candidate (उमेदवार)", "query": "Candidate registration karaycha aahe"},
                    {"label": "👨‍🏫 Staff (कर्मचारी)", "query": "Staff registration karaycha aahe"},
                    {"label": "🏢 Institute (संस्था)", "query": "Institute registration kasa karu?"},
                    {"label": "🏛️ Promoting Organization", "query": "Promoting organization registration"}
                ]

            if intent == "STAFF_REGISTRATION":
                staff_nav = {
                    "label": "कर्मचारी नोंदणी फॉर्म" if lang in ("mr", "hi") else "Staff Registration Form",
                    "type": "navigate",
                    "url": "/React/staff/register",
                    "auto_execute": True,
                    "requires_auth": False
                }
                actions = [staff_nav] + [a for a in actions if a.get("url") != staff_nav["url"]]
                quick_replies = [
                    {"label": "📝 फॉर्म कसा भरायचा?", "query": "Form kasa bharaycha?"},
                    {"label": "▶️ पुढे काय करू?", "query": "Pudhe kay karu?"}
                ]

            if intent == "COURSE" and not courses:
                found = self.course_service.search(query=user_message)
                if found:
                    courses = [self.course_service.to_schema(c).model_dump() for c in found[:5]]

                course_nav = {
                    "label": "सर्व कोर्सेस निर्देशिका (All Courses)" if lang in ("mr", "hi") else "All Courses Directory",
                    "type": "navigate",
                    "url": "/React/Public/courses",
                    "auto_execute": False,
                    "requires_auth": False
                }
                if not any(a.get("url") == course_nav["url"] for a in actions):
                    actions.append(course_nav)

                quick_replies = [
                    {"label": "📝 या कोर्ससाठी नोंदणी करा", "query": "मला नोंदणी करायची आहे"},
                    {"label": "🎓 सर्व उपलब्ध कोर्सेस", "query": "उपलब्ध कोर्सेस दाखवा"},
                    {"label": "▶️ नोंदणी सुरू ठेवा", "query": "resume registration"}
                ]

            if intent == "INSTITUTE" and not institutes:
                found = self.institute_service.search(query=user_message)
                if found:
                    institutes = [self.institute_service.to_schema(i).model_dump() for i in found[:5]]

            # 6. Handle SYSTEM_ACTION (scroll, print, tts, language, logout, clear)
            lower_msg = user_message.lower()
            if intent == "SYSTEM_ACTION":
                if any(k in lower_msg for k in ["scroll down", "खाली स्क्रोल", "scroll down kar", "खाली जा"]):
                    actions.append({"label": "Scroll Down", "type": "scroll", "data": {"direction": "down"}, "auto_execute": True})
                elif any(k in lower_msg for k in ["scroll up", "वर स्क्रोल", "scroll up kar", "वर जा"]):
                    actions.append({"label": "Scroll Up", "type": "scroll", "data": {"direction": "up"}, "auto_execute": True})
                elif any(k in lower_msg for k in ["scroll to top", "scroll top", "वरती जा"]):
                    actions.append({"label": "Scroll to Top", "type": "scroll", "data": {"direction": "top"}, "auto_execute": True})
                elif any(k in lower_msg for k in ["scroll to bottom", "scroll bottom", "तळाशी जा"]):
                    actions.append({"label": "Scroll to Bottom", "type": "scroll", "data": {"direction": "bottom"}, "auto_execute": True})
                elif any(k in lower_msg for k in ["print", "प्रिंट"]):
                    actions.append({"label": "Print Page", "type": "print", "data": {}, "auto_execute": True})
                elif any(k in lower_msg for k in ["mute", "turn off voice", "आवाज बंद", "awaj band"]):
                    actions.append({"label": "Mute Voice", "type": "tts", "data": {"enabled": False}, "auto_execute": True})
                elif any(k in lower_msg for k in ["unmute", "turn on voice", "आवाज सुरू", "awaj suru"]):
                    actions.append({"label": "Enable Voice", "type": "tts", "data": {"enabled": True}, "auto_execute": True})

            # 7. Candidate registration auto-navigation & form field extraction
            if intent == "REGISTRATION":
                extracted_data = {}
                has_name_kw = re.search(r'(?:नाव|नांव|नावं|आडनाव|name|surname|मेरा\s+नाम|my\s+name|i\s+am|मी\s+[A-Za-z\u0900-\u097F]+)', user_message, re.IGNORECASE)
                if has_name_kw:
                    cleaned_name = user_message.strip()
                    prefixes = [
                        r'^(?:माझं|माझे|माझा|माझी)?\s*(?:आडनाव|कुलनाव)\s*(?:आहे|असे)?\s*[:=,-]?\s*',
                        r'^(?:माझं|माझे|माझा|माझी)?\s*(?:मधले\s*नाव|वडिलांचे\s*नाव)\s*(?:आहे|असे)?\s*[:=,-]?\s*',
                        r'^(?:माझं|माझे|माझा|माझी)?\s*(?:पहिले|प्रथम)\s*(?:नाव)\s*(?:आहे|असे)?\s*[:=,-]?\s*',
                        r'^(?:माझं|माझे|माझा|माझी|आमचे)?\s*(?:पूर्ण|संपूर्ण|ऑफिशियल)?\s*(?:नाव|नावं|नांव)\s*(?:आहे|असे|असून)?\s*[:=,-]?\s*',
                        r'^(?:my|the)?\s*(?:last\s*name|surname)\s*(?:is)?\s*[:=,-]?\s*',
                        r'^(?:my|the)?\s*(?:middle\s*name|father\s*name)\s*(?:is)?\s*[:=,-]?\s*',
                        r'^(?:my|the)?\s*(?:first\s*name)\s*(?:is)?\s*[:=,-]?\s*',
                        r'^(?:my|the)?\s*(?:full|official)?\s*(?:name)\s*(?:is)?\s*[:=,-]?\s*',
                        r'^(?:i\s*am|i\'m|this\s*is|call\s*me)\s+',
                        r'^(?:मेरा|मेरी|हमारा)?\s*(?:पूरा|पहला)?\s*(?:नाम)\s*(?:है)?\s*[:=,-]?\s*',
                        r'^(?:मी)\s+',
                        r'^(?:majha|majhe|maza|maze|mera|meri)?\s*(?:purna|sampurna|first|last|middle)?\s*(?:nav|naav|naam|aadnav|surname)\s*(?:aahe|ahe|hai)?\s*[:=,-]?\s*'
                    ]
                    for p in prefixes:
                        cleaned_name = re.sub(p, '', cleaned_name, flags=re.IGNORECASE).strip()

                    suffixes = [
                        r'\s*(?:आहे|हे|असं\s*आहे|असे\s*आहे|होय|ना|है|हूँ|था|थी)\s*$',
                        r'\s*(?:is\s*my\s*name|here|please)\s*$',
                        r'\s*(?:aahe|ahe|as\s*aahe|asa\s*ahe|hai|hoy)\s*$'
                    ]
                    for s in suffixes:
                        cleaned_name = re.sub(s, '', cleaned_name, flags=re.IGNORECASE).strip()

                    raw_toks = [t.strip() for t in re.split(r'\s+', cleaned_name) if t.strip()]
                    valid_toks = [
                        t for t in raw_toks
                        if len(t) >= 2 and re.match(r'^[\u0900-\u097FA-Za-z]+$', t) and t.lower() not in STOPWORDS
                    ]

                    if valid_toks:
                        formatted_toks = [t.capitalize() if re.match(r'^[A-Za-z]+$', t) else t for t in valid_toks]
                        if len(formatted_toks) == 1:
                            extracted_data["firstName"] = formatted_toks[0]
                        elif len(formatted_toks) == 2:
                            extracted_data["firstName"] = formatted_toks[0]
                            extracted_data["lastName"] = formatted_toks[1]
                        elif len(formatted_toks) == 3:
                            extracted_data["firstName"] = formatted_toks[0]
                            extracted_data["middleName"] = formatted_toks[1]
                            extracted_data["lastName"] = formatted_toks[2]
                        else:
                            extracted_data["firstName"] = formatted_toks[0]
                            extracted_data["middleName"] = " ".join(formatted_toks[1:-1])
                            extracted_data["lastName"] = formatted_toks[-1]

                email_m = re.search(r'[\w.-]+@[\w.-]+\.\w+', user_message)
                if email_m:
                    extracted_data["email"] = email_m.group(0).strip()

                mobile_m = re.search(r'\b[6-9]\d{9}\b', user_message)
                if mobile_m:
                    extracted_data["primaryMobile"] = mobile_m.group(0).strip()

                reg_nav = {
                    "label": "कॅन्डिडेट नोंदणी फॉर्म" if lang == "mr" else "Candidate Registration Form",
                    "type": "navigate",
                    "url": "/React/candidate/register",
                    "auto_execute": True,
                    "requires_auth": False
                }
                actions = [reg_nav] + [a for a in actions if a.get("url") != reg_nav["url"]]

                if extracted_data:
                    actions.append({
                        "label": "Live Form Update",
                        "type": "fill_form",
                        "data": extracted_data,
                        "auto_execute": True
                    })

            # 8. Downloads search
            if intent == "DOWNLOAD" and not downloads:
                downloads = self.download_service.search(user_message)

            # Convert to strongly typed schema instances
            course_objs = [Course(**c) if isinstance(c, dict) else c for c in courses]
            institute_objs = [Institute(**i) if isinstance(i, dict) else i for i in institutes]
            action_objs = [Action(**a) if isinstance(a, dict) else a for a in actions]
            download_objs = [Download(**d) if isinstance(d, dict) else d for d in downloads]
            qr_objs = [QuickReply(**q) if isinstance(q, dict) else q for q in quick_replies]

            return ChatResponse(
                intent=intent,
                language=lang,
                answer=result.get("answer", ""),
                courses=course_objs,
                institutes=institute_objs,
                actions=action_objs,
                downloads=download_objs,
                quick_replies=qr_objs,
                session_id=session_id
            )

        except Exception as e:
            logger.error(f"[ChatbotCore] Chat processing exception: {e}", exc_info=True)
            is_mr = any(ord(c) >= 0x0900 and ord(c) <= 0x097F for c in user_message)
            return ChatResponse(
                intent="ERROR",
                language="mr" if is_mr else "en",
                answer="माफ करा, विनंती प्रक्रिया करताना तांत्रिक त्रुटी आली. कृपया थोड्या वेळाने प्रयत्न करा." if is_mr else "Sorry, a temporary issue occurred while processing your request. Please try again.",
                courses=[],
                institutes=[],
                actions=[],
                downloads=[],
                quick_replies=[
                    QuickReply(label="🔄 पुन्हा विचारा", query=user_message),
                    QuickReply(label="🏠 मुख्य पृष्ठ", query="Home")
                ],
                session_id=session_id
            )


# Global singleton instance
chatbot_core = ChatbotCore()
