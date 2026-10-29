from pydantic import BaseModel, Field
from typing import List, Optional


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default"
    current_page: Optional[str] = None
    page_context: Optional[dict] = None


class Course(BaseModel):
    name: str
    name_mr: Optional[str] = None
    description: Optional[str] = None
    description_mr: Optional[str] = None
    duration: Optional[str] = None
    eligibility: Optional[str] = None
    sector: Optional[str] = None
    status: Optional[str] = None
    important_dates: Optional[str] = None
    required_documents: Optional[List[str]] = None
    url: Optional[str] = None



class Institute(BaseModel):
    name: str
    address: Optional[str] = None
    district: Optional[str] = None
    courses: Optional[List[str]] = None
    url: Optional[str] = None


class Action(BaseModel):
    label: str
    type: str = "navigate"  # navigate, autofill, download, external
    url: Optional[str] = None
    data: Optional[dict] = None
    auto_execute: Optional[bool] = False
    requires_auth: Optional[bool] = False


class Download(BaseModel):
    name: str
    description: Optional[str] = None
    url: Optional[str] = None
    file_type: Optional[str] = "pdf"


class QuickReply(BaseModel):
    label: str
    query: str


class ChatResponse(BaseModel):
    intent: str
    language: str
    answer: str
    courses: Optional[List[Course]] = []
    institutes: Optional[List[Institute]] = []
    actions: Optional[List[Action]] = []
    downloads: Optional[List[Download]] = []
    quick_replies: Optional[List[QuickReply]] = []
    required_information: Optional[List[str]] = []
    session_id: Optional[str] = "default"


class ReindexResponse(BaseModel):
    status: str
    message: str
    document_count: Optional[int] = 0
