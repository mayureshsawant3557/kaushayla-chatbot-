from fastapi import APIRouter
from app.models.schemas import ChatRequest, ChatResponse
from app.chatbot_core import chatbot_core
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """
    Main chat endpoint.
    Orchestrates intent detection, RAG retrieval, Gemini LLM generation,
    and verified application navigation/autofill actions via chatbot_core.
    """
    return chatbot_core.process_chat(request)
