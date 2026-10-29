# Collab Chatbot — MSBSVET Kaushalya AI Platform

**Repository Name:** `collab-chatbot`  
**Application Platform:** Maharashtra State Board of Vocational Education and Training (MSBSVET)  
**Architecture:** Distributed AI-Powered Microservices with ASP.NET Core Gateway, React/Vite Frontend, FastAPI LLM/RAG Assistant, Somya IndicTTS Neural Voice Engine, and PaddleOCR Document Verification.

---

## 1. System Overview & Architecture

Collab Chatbot brings AI-assisted multi-modal interaction to the MSBSVET government portal:
- **Smart Conversational Voice Assistant:** Fully bilingual (Marathi / English / Hindi) voice assistant with real-time speech recognition, barge-in speech interruption, audio chunk streaming, and animated Devanagari lip-sync UI.
- **10-Step Automated Candidate Profile Onboarding:** Conversational voice-guided candidate registration navigating through primary details, address, parents, category, qualifications, training, bank details, and final confirmation.
- **Retrieval-Augmented Generation (RAG):** Grounded institutional and course knowledge retrieval powered by ChromaDB (1,304 vectorized chunks) and Google Gemini API completions.
- **Original Somya IndicTTS Neural Voice Engine:** Generates high-fidelity 24,000 Hz mono PCM Marathi speech from Devanagari text using Somya GGUF + SNAC 24kHz audio codec. English and Hindi requests are dynamically routed to lightweight Indian English and Hindi phonological providers.
- **PaddleOCR Document Verification:** Fast, CPU-friendly optical character recognition verifying Aadhaar cards, PAN cards, GR certificates, and registration certificates in ~0.5s.
- **ASP.NET Core Reverse-Proxy Gateway:** Secure Kestrel gateway aggregating chatbot endpoints (`/api/chat`), voice streaming (`/api/tts`), and document OCR verification under one unified API.

```
                                [ CLIENT BROWSER ]
                                        │
                         HTTPS :443 (or Dev Port :5173)
                                        │
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│ MAIN APPLICATION SERVER (CPU-Only Main Host)                                     │
│                                                                                  │
│  [React/Vite Frontend] (:5173) (apps/portal-frontend/Test_MSBSVET)               │
│       │                                                                          │
│       ├─ SmartVoiceAssistant.jsx (Audio queue, Devanagari UI, interruption)     │
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
│       ├─ Hosted Google Gemini API (LLM chat completions & embeddings)            │
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
│ DEDICATED COMPUTE HOST (GPU Host for Neural Somya TTS)                           │
│                                                                                  │
│  [Somya Unified Server] (:8006) (services/tts/server.py)                         │
│       │                                                                          │
│       ├─ llama-server.exe (:8008, Vulkan/CUDA offload)                           │
│       │     └─ Somya-IndicTTS.Q4_K_M.gguf (Offloaded to ~2.25 GB VRAM)          │
│       └─ SNAC 24kHz Audio Decoder (PyTorch CUDA)                                 │
│             └─ Returns 24,000Hz, 1ch (Mono), 16-bit PCM WAV Stream               │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure

```
collab-chatbot/
├── apps/
│   ├── portal-frontend/               # React/Vite Portal (Test_MSBSVET)
│   │   └── Test_MSBSVET/
│   │       ├── src/                   # Components, SmartVoiceAssistant.jsx, utils/
│   │       ├── public/                # Static assets, logos, icons
│   │       ├── package.json
│   │       └── .env.example           # Sanitized environment template
│   └── portal-backend/                # ASP.NET Core 8 Solution
│       ├── MSBSVET-Backend.sln
│       ├── Portal.Server/             # Web API gateway (:5279), ChatbotController
│       ├── Portal.Business/           # Business logic, IOcrVerificationService
│       ├── Portal.Data/               # Data access
│       ├── Portal.Entities/           # DTOs and models
│       └── Portal.Server/appsettings.Example.json # Sanitized config template
│
├── services/
│   ├── chatbot/                       # FastAPI Chatbot & RAG Microservice (:8005)
│   │   ├── app/                       # FastAPI routes, core RAG, prompt engineering
│   │   ├── chroma_db/                 # ChromaDB Vector Database (1,304 pre-indexed chunks)
│   │   ├── data/                      # Knowledge base JSON datasets
│   │   ├── requirements.txt
│   │   └── .env.example
│   ├── tts/                           # Somya IndicTTS Neural Voice Service (:8006)
│   │   ├── server.py                  # Unified FastAPI server
│   │   ├── somya_engine.py            # Somya GGUF runner & SNAC 24kHz decoder
│   │   ├── deploy/                    # Systemd service & remote GPU host runbook
│   │   ├── requirements.txt
│   │   └── .env.example
│   └── ocr/                           # PaddleOCR Microservice (:8000, CPU Mode)
│       ├── ocr_backend.py             # FastAPI OCR server
│       ├── requirements.txt
│       └── tests/                     # Pytest suite
│
├── tests/                             # 208 Consolidated Automated Tests
│   ├── unit/                          # 155 Unit & state-machine regression tests
│   ├── integration/                   # 29 Integration, routing, and speech tests
│   └── e2e/                           # 24 E2E 8-Stage Gateway verification tests
│
├── scripts/                           # Automation scripts (dynamic portable paths)
│   ├── start_all_services.ps1         # Launches OCR, TTS, Chatbot, and Gateway
│   ├── stop_all_services.ps1          # Gracefully terminates all microservices
│   ├── run_all_tests.ps1              # Runs the complete 208-test automated suite
│   └── benchmark_pipeline.py          # Latency & throughput benchmarking
│
├── docs/                              # Technical specifications & audit reports
│   ├── ARCHITECTURE.md
│   └── POST_CONSOLIDATION_VERIFICATION_REPORT.md
│
├── .gitignore                         # Comprehensive monorepo gitignore
├── README.md                          # This onboarding guide
└── HANDOVER_SECURITY_REPORT.md        # Security verification & sanitization audit
```

---

## 3. Required Runtimes & Prerequisites

Before starting, install the following runtimes:
- **Node.js**: `v18.x` or `v20.x` LTS (`node -v`, `npm -v`)
- **.NET SDK**: `.NET 8.0 SDK` (`dotnet --version`)
- **Python**: `Python 3.10` or `3.11` (64-bit)
- **llama.cpp**:
  - Windows: `winget install ggml.llamacpp`
  - Linux: Build from https://github.com/ggerganov/llama.cpp with CUDA support.

---

## 4. Configuration Setup (Safe Templates)

### 1. Frontend Configuration
Copy `apps/portal-frontend/Test_MSBSVET/.env.example` to `apps/portal-frontend/Test_MSBSVET/.env`:
```bash
cp apps/portal-frontend/Test_MSBSVET/.env.example apps/portal-frontend/Test_MSBSVET/.env
```
Default `VITE_BACKEND_URL=http://localhost:5279` points to the local ASP.NET Core gateway.

### 2. Chatbot Configuration
Copy `services/chatbot/.env.example` to `services/chatbot/.env`:
```bash
cp services/chatbot/.env.example services/chatbot/.env
```
Edit `services/chatbot/.env` and supply your **Google Gemini API Key**:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
LLM_MODEL=gemini-2.5-flash-lite
SOMYA_TTS_URL=http://127.0.0.1:8006/synthesize
PORT=8005
```

### 3. Backend Gateway Configuration
Copy `apps/portal-backend/Portal.Server/appsettings.Example.json` to `apps/portal-backend/Portal.Server/appsettings.json`:
```bash
cp apps/portal-backend/Portal.Server/appsettings.Example.json apps/portal-backend/Portal.Server/appsettings.json
```
Set your local SQL Server connection string under `ConnectionStrings.DBConnection`.

---

## 5. External Assets & Model Weights Setup

The following large binaries are intentionally excluded from the Git repository:

### 1. Somya IndicTTS Neural Voice Model (Marathi Voice)
- **Model:** `Somya-IndicTTS.Q4_K_M.gguf` (~2.25 GB)
- **Source:** Hugging Face repository `mradermacher/Somya-IndicTTS-GGUF`
- **Download:**
  ```powershell
  # Download to your models directory or huggingface cache
  huggingface-cli download mradermacher/Somya-IndicTTS-GGUF Somya-IndicTTS.Q4_K_M.gguf --local-dir "C:\Models\Somya"
  ```
- **Environment:** Set `SOMYA_GGUF_PATH=C:\Models\Somya\Somya-IndicTTS.Q4_K_M.gguf` (or place in default Hugging Face hub cache).

### 2. SNAC 24kHz Audio Codec
- **Model ID:** `hubertsiuzdak/snac_24khz`
- **Setup:** Automatically downloaded on first launch by PyTorch into `~/.cache/huggingface/hub/`. Active internet access required on first run.

### 3. PaddleOCR PP-OCRv4 Detection & Recognition Models
- **Setup:** Automatically downloaded by PaddlePaddle on first OCR verification to `~/.paddleocr/whl/`.

### 4. ChromaDB Vector Knowledge Store
- **Included in Repo:** Pre-vectorized 1,304 knowledge base chunks are already provided in [`services/chatbot/chroma_db`](file:///D:/collab-chatbot/services/chatbot/chroma_db) (34.6 MB). No initial vector indexing required.

---

## 6. Dependency Installation

### Frontend Dependencies:
```powershell
cd apps/portal-frontend/Test_MSBSVET
npm install
```

### Backend Dependencies:
```powershell
cd apps/portal-backend
dotnet restore Portal.Server/Portal.Server.csproj
```

### Python Services Dependencies:
Create independent virtual environments for each service:

```powershell
# 1. OCR Service
cd services/ocr
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# 2. TTS Service
cd ../tts
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# 3. Chatbot Service
cd ../chatbot
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

---

## 7. Service Startup & Health Verification

All 4 services can be started together using the automated launch script:
```powershell
.\scripts\start_all_services.ps1
```

Or launched individually in separate terminals:
1. **OCR Microservice (Port 8000):**
   ```powershell
   cd services/ocr
   .\venv\Scripts\python.exe ocr_backend.py
   # Health: curl -f http://127.0.0.1:8000/health
   ```
2. **Somya IndicTTS Service (Port 8006):**
   ```powershell
   cd services/tts
   .\.venv\Scripts\python.exe server.py
   # Health: curl -f http://127.0.0.1:8006/health
   # Auto-spawns internal llama-server on port 8008
   ```
3. **FastAPI Chatbot (Port 8005):**
   ```powershell
   cd services/chatbot
   .\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8005
   # Health: curl -f http://127.0.0.1:8005/api/health
   ```
4. **ASP.NET Core Gateway (Port 5279):**
   ```powershell
   cd apps/portal-backend/Portal.Server
   dotnet run --launch-profile http
   # Health: curl -X POST http://127.0.0.1:5279/api/chat -H "Content-Type: application/json" -d "{\"message\":\"hello\"}"
   ```
5. **React Frontend (Port 5173):**
   ```powershell
   cd apps/portal-frontend/Test_MSBSVET
   npm run dev
   # Open browser at http://localhost:5173
   ```

To stop all services:
```powershell
.\scripts\stop_all_services.ps1
```

---

## 8. Running Automated Tests

Run the complete 208-test automated regression suite:
```powershell
.\scripts\run_all_tests.ps1
```

Test Suite Breakdown:
- **155 Unit & State-Machine Tests:** Form registry step progression (31 tests), candidate conversational flow (27 tests), name parsing regex assertions, audio queue & state transitions (93 tests), PaddleOCR unit tests (4 tests).
- **29 Integration Tests:** TTS multilingual routing & auth (5 tests), master multi-service integration (5 tests), speech recognition coordinator (11 tests), direct chatbot core (8 tests).
- **24 E2E 8-Stage Gateway Tests:** Full end-to-end pipeline validation through Kestrel proxy, ChromaDB RAG, and PaddleOCR document verification.

---

## 9. Hardware Boundaries & Production Limitations

1. **CPU vs. GPU Inference for Somya TTS:**
   - On a machine with an NVIDIA GPU (e.g. RTX 3050 Laptop GPU or higher), Marathi neural synthesis takes **~3.35 seconds**.
   - On CPU-only hardware, Somya synthesis takes **13.7 to 36.1 seconds** per sentence.
   - For production, deploy [`services/tts/deploy`](file:///D:/collab-chatbot/services/tts/deploy) onto a dedicated Linux GPU host (e.g. AWS g4dn/g5) and configure `SOMYA_TTS_URL` in `services/chatbot/.env` accordingly.
2. **Gemini API Billing:**
   - Free tier keys enforce a `20 requests/day` limit on `gemini-2.5-flash-lite`. A Google Cloud billing account must be attached for production load.
3. **PaddleOCR CPU Mode:**
   - PaddleOCR runs in CPU mode by default (`use_gpu=False`) and completes document verification in ~0.5 seconds without needing a GPU.

