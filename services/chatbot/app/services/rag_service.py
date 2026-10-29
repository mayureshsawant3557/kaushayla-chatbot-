from app.core.vectorstore import vector_store_manager
from app.core.config import settings
from app.services.registration_rag_service import registration_rag_service
from langchain_core.documents import Document
import re
import logging

logger = logging.getLogger(__name__)


class RAGService:
    """Retrieval Augmented Generation service using ChromaDB and Specialized Registration RAG."""

    INTENT_TOP_K = {
        "COURSE": 8,
        "INSTITUTE": 8,
        "ADMISSION": 6,
        "KNOWLEDGE": 6,
        "DOCUMENTS": 4,
        "DOWNLOAD": 4,
        "NAVIGATION": 3,
        "REGISTRATION": 4,
        "STAFF_REGISTRATION": 4,
        "FORM_GUIDANCE": 4,
        "GENERAL": 5,
    }

    @staticmethod
    def clean_chunk_content(text: str) -> str:
        """Strip decorative dashed lines, repetitive separators, and clean headers."""
        if not text:
            return ""
        # Remove markdown/ASCII lines of 4 or more hyphens, underscores, or equals
        cleaned = re.sub(r'^[=\-_]{4,}\s*$', '', text, flags=re.MULTILINE)
        # Collapse multiple blank lines into max 2
        cleaned = re.sub(r'\n{3,}', '\n\n', cleaned).strip()
        return cleaned

    @staticmethod
    def retrieve_context(
        query: str,
        intent: str = "GENERAL",
        top_k: int = None,
        current_page: str = None,
        page_context: dict = None,
        language: str = "mr"
    ) -> list:
        """
        Retrieve relevant document chunks with intent and screen awareness.
        Integrates specialized Registration RAG for candidate registration and profile forms.
        """
        if intent in ("GENERAL_REGISTRATION", "SYSTEM_ACTION"):
            return []

        if top_k is None:
            top_k = RAGService.INTENT_TOP_K.get(intent, settings.RAG_TOP_K)

        docs = []

        # 1. Specialized Registration RAG Layer (Phase 2 & 4 requirement)
        is_registration_or_form = (
            intent in ("REGISTRATION", "FORM_GUIDANCE", "STAFF_REGISTRATION", "DOCUMENTS") or
            (current_page and any(p in current_page.lower() for p in ["candidate", "register", "address", "profile", "staff"])) or
            any(k in query.lower() for k in ["register", "नोंदणी", "फॉर्म", "form", "address", "पत्ता", "कागदपत्रे", "personal details", "वैयक्तिक"])
        )

        if is_registration_or_form:
            reg_info = registration_rag_service.search_registration_guidance(
                query=query,
                route=current_page,
                language=language
            )
            if reg_info:
                content = f"### {reg_info['title']}\n\n{reg_info['instructions']}"
                if reg_info.get("fields_summary"):
                    content += f"\n\nसमाविष्ट फील्ड्स (Fields): {reg_info['fields_summary']}"
                if reg_info.get("validation_rules"):
                    content += f"\n\nवैधता नियम (Validation Rules):\n" + "\n".join(f"- {r}" for r in reg_info["validation_rules"])

                reg_doc = Document(
                    page_content=content,
                    metadata={
                        "source": "MSBSVET Official Registration & Profile Manual",
                        "source_file": "msbsvet_registration_manual.md",
                        "domain": "registration_specialized_rag",
                        "route": reg_info.get("route", "")
                    }
                )
                docs.append(reg_doc)
                logger.info(f"[RegistrationRAG] Injected specialized registration guidance for: {reg_info['title']}")

        # 2. ChromaDB Semantic Search with Query Refinement
        try:
            vectorstore = vector_store_manager.get_vectorstore()
            search_query = query

            # Hybrid query enhancement rather than wiping user query
            if intent == "DOCUMENTS":
                search_query = f"{query} required documents specifications photo signature size कागदपत्रे"
            elif intent == "REGISTRATION":
                search_query = f"{query} candidate registration form steps procedure उमेदवार नोंदणी"
            elif intent == "FORM_GUIDANCE":
                page_slug = (current_page or "").split("/")[-1]
                search_query = f"{query} {page_slug} application form filling steps सूचना"

            raw_docs = vectorstore.similarity_search(search_query, k=top_k)

            # 3. Post-process retrieved chunks: Clean dashes, stitch isolated headings
            for d in raw_docs:
                clean_text = RAGService.clean_chunk_content(d.page_content)
                # If chunk is an isolated heading (e.g. fewer than 220 chars), enrich with context
                if len(clean_text) < 220 and any(h in clean_text for h in ["वैयक्तिक माहिती", "पत्ता माहिती", "आवश्यक कागदपत्रे"]):
                    # Enrich with specialized guidance body
                    enriched = registration_rag_service.search_registration_guidance(clean_text, language=language)
                    if enriched:
                        clean_text = f"### {enriched['title']}\n\n{enriched['instructions']}"

                d.page_content = clean_text
                # Filter out generic prerequisite dumps when user is asking for specific form steps
                if intent in ("REGISTRATION", "FORM_GUIDANCE") and "Prerequisites & Documents" in d.page_content and len(docs) > 0:
                    continue
                docs.append(d)

            # Limit to top_k total docs
            docs = docs[:top_k]

            if docs:
                sources = set(d.metadata.get("source_file", d.metadata.get("source", "unknown")) for d in docs)
                logger.info(f"RAG retrieved {len(docs)} chunks for intent={intent} | Sources: {sources}")
            else:
                logger.warning(f"RAG returned 0 chunks for query: {query[:50]}...")

            return docs

        except Exception as e:
            logger.error(f"Error retrieving context from ChromaDB: {e}")
            return docs

    @staticmethod
    def get_document_count() -> int:
        """Get total number of documents in the vector store."""
        return vector_store_manager.get_document_count()


rag_service = RAGService()
