# MSBSVET KAUSHALYA AI — ARCHITECTURE & REQUEST FLOW SPECIFICATION

**Workspace Root:** `D:\MABSVET-Integration`  
**Date:** 2026-10-29  
**Status:** Consolidated Production Layout  

---

## 1. System Architecture Diagram

```
                                [ CLIENT BROWSER ]
                                        │
                         HTTPS :443 (or Dev Port :5173)
                                        │
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ MAIN APPLICATION SERVER (CPU-Only Production Server)                             │
│                                                                                  │
│  [React/Vite Frontend] (apps/portal-frontend/Test_MSBSVET/dist)                  │
│       │                                                                          │
│       ├─ SmartVoiceAssistant.jsx (Audio queue, interruption, Devanagari UI)     │
│       ├─ Form Registry (utils/formRegistry.js - 10 Profile Steps)                │
│       └─ Name/Date Parsers (utils/nameParser.js, utils/dateParser.js)            │
│                                                                                  │
│  [ASP.NET Core Gateway] (:5279) (apps/portal-backend/Portal.Server)              │
│       │                                                                          │
│       ├─ ChatbotController.cs (Reverse proxy for /api/chat and /api/tts)         │
│       ├─ PromotionalOrganisationController.cs (Document OCR Verification)       │
│       └─ OcrVerificationServiceWorker.cs (PaddleOCR API client)                  │
│                                                                                  │
│  [FastAPI Chatbot & RAG Microservice] (:8005) (services/chatbot)                 │
│       │                                                                          │
│       ├─ Hosted Google Gemini API (Chat completions & embeddings)               │
│       ├─ ChromaDB Vector Store (services/chatbot/chroma_db - 1,304 chunks)       │
│       ├─ Specialized Registration RAG (services/chatbot/app/core/rag.py)         │
│       └─ Multilingual Voice Router (services/chatbot/app/api/tts.py)             │
│               │                                                                  │
│               ├─ Language 'en' ──► Google Indic English (MP3 Stream)             │
│               ├─ Language 'hi' ──► Google Indic Hindi (MP3 Stream)               │
│               └─ Language 'mr' ──► Outbound Somya Request (WAV Stream)           │
│                                                                                  │
│  [PaddleOCR Microservice] (:8000) (services/ocr)                                 │
│       │                                                                          │
│       └─ CPU Inference for PAN, Registration, GR, and Aadhaar verification       │
└───────────────────────────────────────┬──────────────────────────────────────────┘
                                        │
                   Private VPC / LAN (:8006) + X-TTS-Api-Key Header
                                        │
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ DEDICATED REMOTE COMPUTE HOST (GPU Host for Neural TTS)                          │
│                                                                                  │
│  [Somya Unified Server] (:8006) (services/tts/server.py)                         │
│       │                                                                          │
│       ├─ Pre-shared API Key Authorization (X-TTS-Api-Key validation)             │
│       ├─ llama-server.exe (:8008, Vulkan/CUDA offload)                           │
│       │     └─ Somya-IndicTTS.Q4_K_M.gguf (Offloaded to ~2.25 GB VRAM)          │
│       └─ SNAC 24kHz Audio Decoder (PyTorch CUDA)                                 │
│             └─ Returns 24,000Hz, 1ch (Mono), 16-bit PCM WAV Stream               │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Request Flow Walkthroughs

### 2.1 Chat & RAG Request Flow
1. **User Input:** User speaks or types in Marathi, English, or Hindi in the browser widget (`SmartVoiceAssistant.jsx`).
2. **Gateway Forwarding:** Frontend sends `POST /api/chat` to ASP.NET Core Gateway (:5279).
3. **Internal Proxy:** `ChatbotController.cs` forwards the payload to FastAPI Chatbot (`http://127.0.0.1:8005/api/chat/`).
4. **Intent & RAG Resolution:**
   - Intent is classified (COURSE, REGISTRATION, DOCUMENT, ADMISSION, GENERAL).
   - If page context indicates an active form step, Specialized Profile RAG retrieves relevant guidance.
   - ChromaDB retrieves the top-k matching semantic document chunks (1,304 knowledge chunks).
5. **LLM Generation:** Google Gemini (`gemini-2.5-flash-lite`) synthesizes a clean, dashed-line-free conversational response.
6. **Response Propagation:** Response returns via Gateway to the client browser.

### 2.2 Text-to-Speech (TTS) Voice Synthesis Flow
1. **Language Determination:** The language of the response is verified (`mr`, `en`, or `hi`).
2. **Authoritative Engine Routing (`tts.py`):**
   - **Marathi (`mr`):** Routes to Somya IndicTTS. FastAPI connects to `effective_tts_url` (:8006) with `X-TTS-Api-Key`.
   - **English (`en`):** Routes to Google Indic English (`gTTS-en-IN`), returning an MP3 audio stream.
   - **Hindi (`hi`):** Routes to Google Indic Hindi (`gTTS-hi-IN`), returning an MP3 audio stream.
3. **Sentence Chunking (`/api/tts/chunks`):** Long answers are partitioned at punctuation boundaries (`।`, `.`, `?`, `!`, `\n`) with a **140-character maximum**.
4. **Immediate Streaming:** Chunk 0 synthesizes in < 0.1s; the browser begins playing immediately while subsequent chunks synthesize in the background.
5. **Gateway Buffering:** ASP.NET Core Gateway streams the raw audio bytes with matching headers (`Content-Type: audio/wav` or `audio/mpeg`, `X-TTS-Engine`) to the browser.

### 2.3 Document OCR Verification Flow
1. **Document Upload:** User uploads a document (PAN card, Registration Certificate, GR, or Aadhaar) in the portal.
2. **Gateway Processing:** `PromotionalOrganisationController.cs` receives the file and invokes `OcrVerificationServiceWorker.cs`.
3. **OCR Inference:** Worker calls `POST http://127.0.0.1:8000/api/document/verify` with the file bytes and expected identifier.
4. **PaddleOCR Extraction:** PaddleOCR runs on CPU:
   - For PDFs: PyMuPDF rasterizes pages at 2.0x scale to numpy arrays.
   - Text candidates are extracted and normalized (punctuation and whitespace stripped).
   - Normalized candidate is compared against normalized expected number.
5. **Outcome:** Returns JSON `{ "verified": true, "detected_number": "...", "confidence": 0.98 }`.

---

## 3. Production Deployment Architecture (GPU-Less Main Server)

| Tier | Component | Host | Hardware Requirements |
|---|---|---|---|
| **Tier 1 (Public Web)** | React/Vite Frontend | Main App Server | Static files served via Kestrel/Nginx |
| **Tier 1 (Gateway)** | ASP.NET Core 8 Gateway | Main App Server | 4 vCPU, 8 GB RAM, .NET 8 Runtime |
| **Tier 2 (Chatbot & RAG)** | FastAPI Chatbot & ChromaDB | Main App Server | 4 vCPU, 8 GB RAM, Python 3.11 |
| **Tier 2 (Document OCR)** | PaddleOCR Microservice | Main App Server | Included in Main Server (CPU inference ~354ms) |
| **Tier 3 (Neural TTS)** | Somya IndicTTS Service | Dedicated Compute Host | 1x NVIDIA GPU (T4 / L4 / RTX, ≥ 4GB VRAM), 16GB RAM |

---

## 4. Environment Variables Reference

| Variable | Target Service | Purpose | Sample Value (Non-Secret) |
|---|---|---|---|
| `GEMINI_API_KEY` | Chatbot (:8005) | Paid Google Gemini API key for LLM and embeddings | `AIzaSy...` |
| `SOMYA_TTS_BASE_URL` | Chatbot (:8005) | Address of dedicated remote GPU TTS host | `https://tts.internal.msbsvet.gov.in:8006` |
| `SOMYA_TTS_API_KEY` | Chatbot & TTS | Pre-shared authorization token sent in `X-TTS-Api-Key` | `32-char-random-string` |
| `TTS_CONNECT_TIMEOUT_SEC` | Chatbot (:8005) | Fast-fail connection timeout for remote TTS host | `3.5` |
| `TTS_READ_TIMEOUT_SEC` | Chatbot (:8005) | Bounded read timeout for single synthesis utterances | `30.0` |
| `OCR_SERVICE_URL` | Gateway (:5279) | Address of local PaddleOCR microservice | `http://127.0.0.1:8000` |
| `CHATBOT_SERVICE_URL` | Gateway (:5279) | Address of local FastAPI chatbot service | `http://127.0.0.1:8005` |

---

## 5. Before & After Directory Tree

### Before Consolidation (Scattered Layout)
```
D:\MABSVET-Integration\
├── OCR\
│   ├── backend\                       # OCR Microservice
│   ├── frontend\                      # Old standalone OCR frontend
│   └── MSBSVET\
│       ├── msbsvet frontend\Test_MSBSVET  # React Portal
│       └── msbsvet backend\           # .NET Backend
├── Reference\
│   ├── MSBSVET_CHATBOT-main\backend\  # FastAPI Chatbot
│   ├── bilingual-chatbot-backend-v2\  # Reference repo
│   ├── CHatbot feed\                  # Feed datasets
│   └── flask_backend\                 # Old Flask prototype
├── tts-lab\                           # Somya TTS lab
├── test_*.py, test_*.mjs (12 loose test files in root)
└── *.md (5 loose reports in root)
```

### After Consolidation (Clean Single Root)
```
D:\MABSVET-Integration\
├── apps\
│   ├── portal-frontend\               # React/Vite portal (Test_MSBSVET) + preserved Git repo
│   └── portal-backend\                # ASP.NET Core solution (Portal.Server) + preserved Git repo
├── services\
│   ├── chatbot\                       # FastAPI chatbot, RAG engine, ChromaDB (1,304 docs)
│   ├── tts\                           # Somya IndicTTS engine, server.py, deploy/
│   └── ocr\                           # PaddleOCR microservice (CPU)
├── tests\
│   ├── unit\                          # 155 Unit & state machine tests
│   ├── integration\                   # 29 Integration, routing, and multi-service tests
│   └── e2e\                           # 24 Full 8-stage gateway integration tests
├── scripts\                           # run_all_tests.ps1, start/stop service scripts
├── docs\                              # Engineering documentation and audit reports
├── README.md                          # Quick start, runbooks, and test commands
└── ARCHITECTURE.md                    # System architecture and request flow specification
```

---

## 6. File-by-File Migration Inventory

| Original Path | Consolidated Path | Nature | Purpose |
|---|---|---|---|
| `OCR/MSBSVET/msbsvet frontend/Test_MSBSVET` | `apps/portal-frontend/Test_MSBSVET` | Migrated | Active React/Vite frontend application |
| `OCR/MSBSVET/msbsvet frontend/.git` | `apps/portal-frontend/.git` | Preserved | Frontend Git history, branches, and commit log |
| `OCR/MSBSVET/msbsvet backend/*` | `apps/portal-backend/*` | Migrated | Active ASP.NET Core solution, Portal.Server, Portal.Business |
| `OCR/MSBSVET/msbsvet backend/.git` | `apps/portal-backend/.git` | Preserved | Backend Git history, branches, and commit log |
| `Reference/MSBSVET_CHATBOT-main/backend/*` | `services/chatbot/*` | Migrated | Active FastAPI chatbot, ChromaDB, RAG pipeline, .env |
| `tts-lab/*` | `services/tts/*` | Migrated | Somya IndicTTS server, somya_engine.py, deploy runbooks |
| `OCR/backend/*` | `services/ocr/*` | Migrated | PaddleOCR microservice, requirements.txt, ocr_backend.py |
| `test_registration_loop_and_registry.mjs` | `tests/unit/test_registration_loop_and_registry.mjs` | Migrated & Updated | Form Registry & monotonic progression tests |
| `test_candidate_conversation_flow.mjs` | `tests/unit/test_candidate_conversation_flow.mjs` | Migrated & Updated | 6-turn conversational registration simulation |
| `test_name_parser.mjs` | `tests/unit/test_name_parser.mjs` | Migrated & Updated | Candidate name parser unit tests |
| `test_regression_comprehensive.mjs` | `tests/unit/test_regression_comprehensive.mjs` | Migrated & Updated | Audio queue, speech lifecycle, screen context tests |
| `OCR/backend/tests/test_api.py` | `tests/unit/test_api.py` | Migrated & Updated | PaddleOCR endpoint pytest suite |
| `test_language_routing_and_auth.py` | `tests/integration/test_language_routing_and_auth.py` | Migrated | Marathi WAV, English/Hindi MP3, chunking tests |
| `test_master_implementation.py` | `tests/integration/test_master_implementation.py` | Migrated & Updated | Cross-service health, RAG dash stripping, profile RAG |
| `test_integration_speech_input.mjs` | `tests/integration/test_integration_speech_input.mjs` | Migrated & Updated | Speech recognition coordinator tests |
| `test_integration_chatbot_core.py` | `tests/integration/test_integration_chatbot_core.py` | Migrated & Updated | Direct chatbot core integration tests |
| `test_e2e_full_integration.py` | `tests/e2e/test_e2e_full_integration.py` | Migrated & Updated | 8-stage full architecture integration suite |
| `test_e2e_tts.py` | `tests/e2e/test_e2e_tts.py` | Migrated | Direct end-to-end TTS check |
| Root test & doc files | `tests/`, `scripts/`, `docs/` | Cleaned from root | Loose duplicate root files removed after verification |
