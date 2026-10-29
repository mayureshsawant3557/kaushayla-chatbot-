import os
import time
import re
import cv2
import numpy as np
from typing import List, Dict, Any

import uvicorn
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from paddleocr import PaddleOCR
import fitz  # PyMuPDF

# ==========================================
# Configuration & Constants
# ==========================================
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "bmp", "tiff", "pdf"}
MAX_UPLOAD_SIZE_MB = 10
PROJECT_NAME = "OCR Verification API"

def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# ==========================================
# Normalization & Security
# ==========================================
def normalize_identifier(identifier: str) -> str:
    """
    Normalizes identifier for exact comparison.
    Trims whitespace, removes spaces, hyphens, slashes, and makes uppercase.
    """
    if not identifier: return ""
    identifier = str(identifier).upper()
    return re.sub(r'[^A-Z0-9]', '', identifier)

def mask_identifier(identifier: str) -> str:
    """Masks sensitive numbers for logging/debugging (e.g., ********7471)."""
    if not identifier: return ""
    ident_str = str(identifier)
    if len(ident_str) <= 4:
        return "****"
    return "*" * (len(ident_str) - 4) + ident_str[-4:]

# ==========================================
# Document-Specific Extraction
# ==========================================
def extract_aadhaar_candidates(ocr_texts: List[str]) -> List[str]:
    candidates = []
    for text in ocr_texts:
        digits = re.sub(r'\D', '', text)
        if len(digits) == 12:
            candidates.append(digits)
    return candidates

def extract_pan_candidates(ocr_texts: List[str]) -> List[str]:
    candidates = []
    pan_pattern = r'\b([A-Z]{5}[0-9]{4}[A-Z]{1})\b'
    for text in ocr_texts:
        match = re.search(pan_pattern, text.upper())
        if match:
            candidates.append(match.group(1))
    return candidates

def extract_gr_candidates(ocr_texts: List[str]) -> List[str]:
    candidates = []
    keywords = [
        "gr no", "gr number", "resolution no", "government resolution", 
        "शासन निर्णय", "क्र.", "क्रमांक", "reference no", "ref no"
    ]
    for i, text in enumerate(ocr_texts):
        lower_text = text.lower()
        for kw in keywords:
            if kw in lower_text:
                # Part on the same line
                part = text[lower_text.find(kw) + len(kw):].strip(" :;=-_")
                if part:
                    candidates.append(part)
                # Next line candidate
                if i + 1 < len(ocr_texts):
                    candidates.append(ocr_texts[i+1].strip())
            
    return candidates

def extract_registration_candidates(ocr_texts: List[str]) -> List[str]:
    candidates = []
    keywords = [
        "registration no", "incorporation no", "reg no", "reg. no", 
        "cin", "llpin", "registration number", "क्रमांक", "नोंदणी", 
        "gr no", "gr number", "gr certificate"
    ]
    for i, text in enumerate(ocr_texts):
        lower_text = text.lower()
        for kw in keywords:
            if kw in lower_text:
                part = text[lower_text.find(kw) + len(kw):].strip(" :;=-_")
                if part:
                    candidates.append(part)
                if i + 1 < len(ocr_texts):
                    candidates.append(ocr_texts[i+1].strip())
                    
        # Match common corporate identifiers like CIN
        if re.search(r'\b[L|U]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}\b', text.upper()):
            candidates.append(text.upper())
            
    return candidates

def get_candidates_for_doc_type(ocr_texts: List[str], document_type: str) -> List[str]:
    dt = document_type.lower()
    if dt == "aadhaar":
        return extract_aadhaar_candidates(ocr_texts)
    elif dt == "pan":
        return extract_pan_candidates(ocr_texts)
    elif dt in ["gr_certificate", "gr"]:
        return extract_gr_candidates(ocr_texts)
    elif dt in ["registration_certificate", "registration"]:
        return extract_registration_candidates(ocr_texts)
    else:
        # Fallback: treat every line as a potential candidate for unknown doc types
        return [text.strip() for text in ocr_texts if bool(re.search(r'\d', text))]

# ==========================================
# PaddleOCR Initialization & Execution
# ==========================================
class OCRService:
    def __init__(self):
        self.ocr_engine = None
        self.is_initialized = False

    def initialize(self):
        if not self.is_initialized:
            try:
                print("Initializing PaddleOCR Engine...")
                self.ocr_engine = PaddleOCR(lang='en', use_angle_cls=True)
                self.is_initialized = True
                print("PaddleOCR Engine Initialized Successfully.")
            except Exception as e:
                print(f"Failed to initialize PaddleOCR: {e}")
                self.is_initialized = False

    def process_and_verify(self, image_bytes: bytes, document_type: str, expected_number: str) -> Dict[str, Any]:
        if not self.is_initialized:
            self.initialize()
            
        if not self.is_initialized or not self.ocr_engine:
            return {
                "success": False,
                "verified": False,
                "document_type": document_type,
                "message": "OCR engine failed to initialize"
            }

        try:
            full_text = []
            
            is_pdf = image_bytes.startswith(b'%PDF')
            
            if is_pdf:
                doc = fitz.open(stream=image_bytes, filetype="pdf")
                for page_num in range(len(doc)):
                    page = doc.load_page(page_num)
                    # 2.0 zoom for better OCR resolution
                    mat = fitz.Matrix(2.0, 2.0)
                    pix = page.get_pixmap(matrix=mat)
                    
                    img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w, pix.n)
                    
                    if pix.n == 4:
                        img = cv2.cvtColor(img, cv2.COLOR_RGBA2RGB)
                    elif pix.n == 1:
                        img = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
                        
                    result = self.ocr_engine.ocr(img)
                    if result:
                        self._extract_text_from_result(result, full_text)
                doc.close()
            else:
                nparr = np.frombuffer(image_bytes, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                
                if img is None:
                    raise ValueError("Could not decode image")
                    
                result = self.ocr_engine.ocr(img)
                if result:
                    self._extract_text_from_result(result, full_text)
            
            if not full_text:
                return {
                    "success": False,
                    "verified": False,
                    "message": "Unable to extract required document number"
                }

            candidates = get_candidates_for_doc_type(full_text, document_type)
            norm_expected = normalize_identifier(expected_number)
            
            matched = False
            for candidate in candidates:
                norm_candidate = normalize_identifier(candidate)
                if norm_candidate and norm_expected and norm_expected == norm_candidate:
                    matched = True
                    break

            # Security: Do not log full identifiers, use masked values if debugging
            # print(f"Verified {mask_identifier(expected_number)} -> {matched}")

            if matched:
                return {
                    "success": True,
                    "verified": True,
                    "match": True,
                    "document_type": document_type,
                    "message": "Document verified successfully"
                }
            else:
                return {
                    "success": True,
                    "verified": False,
                    "match": False,
                    "document_type": document_type,
                    "message": "Document number does not match"
                }
            
        except Exception as e:
            print(f"OCR Error: {e}")
            return {
                "success": False,
                "verified": False,
                "match": False,
                "document_type": document_type,
                "message": "Unable to extract required document number"
            }

    def _extract_text_from_result(self, result, full_text_list):
        if hasattr(result[0], 'keys') and 'rec_texts' in result[0]:
            res_obj = result[0]
            texts = res_obj.get('rec_texts', [])
            for i in range(len(texts)):
                text = str(texts[i])
                if isinstance(text, tuple): text = text[0]
                full_text_list.append(text)
        elif isinstance(result[0], list):
            for line in result[0]:
                if not line or len(line) < 2: continue
                text = line[1][0]
                full_text_list.append(text)


ocr_service = OCRService()

# ==========================================
# Application Startup & API Routes
# ==========================================
app = FastAPI(title=PROJECT_NAME)

allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    ocr_service.initialize()

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": PROJECT_NAME,
        "ocr_engine": "PaddleOCR",
        "supported_documents": ["aadhaar", "pan", "gr_certificate", "registration_certificate"]
    }

@app.post("/api/document/verify")
async def verify_document(
    file: UploadFile = File(...),
    document_type: str = Form(...),
    expected_number: str = Form(...)
):
    """
    Verifies if the expected document number matches the extracted number from the uploaded document.
    """
    if not file:
        return {
            "success": False,
            "verified": False,
            "match": False,
            "document_type": document_type,
            "message": "Unable to extract required document number"
        }
    
    if not allowed_file(file.filename):
        return {
            "success": False,
            "verified": False,
            "match": False,
            "document_type": document_type,
            "message": "Unable to extract required document number"
        }
    
    try:
        contents = await file.read()
    except Exception as e:
        return {
            "success": False,
            "verified": False,
            "match": False,
            "document_type": document_type,
            "message": "Unable to extract required document number"
        }
    
    if len(contents) > MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        return {
            "success": False,
            "verified": False,
            "match": False,
            "document_type": document_type,
            "message": "Unable to extract required document number"
        }
        
    if len(contents) == 0:
        return {
            "success": False,
            "verified": False,
            "match": False,
            "document_type": document_type,
            "message": "Unable to extract required document number"
        }
        
    result = ocr_service.process_and_verify(contents, document_type, expected_number)
    
    # Fastapi UploadFile handles temp file deletion upon closure automatically
    await file.close()
    
    return result

import urllib.request
from pydantic import BaseModel

class VerifyJsonRequest(BaseModel):
    file_url: str
    document_type: str
    expected_number: str

@app.post("/api/document/verify-json")
async def verify_document_json(req: VerifyJsonRequest):
    try:
        if req.file_url.startswith("http://") or req.file_url.startswith("https://"):
            req_http = urllib.request.Request(req.file_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req_http, timeout=15) as response:
                contents = response.read()
        elif os.path.exists(req.file_url):
            with open(req.file_url, "rb") as f:
                contents = f.read()
        else:
            return {
                "success": False,
                "verified": False,
                "match": False,
                "document_type": req.document_type,
                "message": f"Unable to fetch file from {req.file_url}"
            }
        return ocr_service.process_and_verify(contents, req.document_type, req.expected_number)
    except Exception as e:
        return {
            "success": False,
            "verified": False,
            "match": False,
            "document_type": req.document_type,
            "message": f"Error processing file: {str(e)}"
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
