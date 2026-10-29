# MSBSVET KAUSHALYA AI — TEAM HANDOVER AUDIT & READINESS CHECKLIST

**Workspace Root:** `D:\MABSVET-Integration`  
**Audit Date:** 2026-10-29  
**Auditor:** Antigravity Senior Engineering Assistant (Ponytail Mode)  
**Overall Verdict:** **NOT READY** (Detailed justification and remediation checklist below)

---

## 1. Executive Summary & Handover Decision

### Verdict: **NOT READY**

| Handover Channel | Status | Primary Blocker |
| :--- | :--- | :--- |
| **Shared Git Repository Handover** | **BLOCKED** | None of the microservices (`services/chatbot`, `services/tts`, `services/ocr`), tests, or scripts exist in any remote Git repository. Furthermore, all 36 active Kaushalya AI source modifications across the frontend and backend remain uncommitted and unpushed on local feature worktrees. Cloned from GitHub, the project contains **zero** AI features. |
| **Direct ZIP Archive Handover** | **BLOCKED** | The local workspace currently contains live production/development secrets (`GEMINI_API_KEY`, SQL Server connection strings, JWT signing keys, Razorpay keys), over 15 GB of unbuildable machine-specific virtual environments (`venv`, `.venv`, `node_modules`), build output directories (`bin`, `obj`, `dist`), and active process locks (`llama-server.exe`). A raw ZIP would cause severe credential exposure and platform incompatibility. |

To make this project shareable without data loss or security leaks, follow the **Immediate Remediation Checklist** in [Section 10](#10-remediation-checklist--safest-next-actions).

---

## 2. Directory Structure & Active Source Inventory

The workspace is organized into five consolidated top-level directories. All vendor packages, virtual environments, binaries, and build outputs are segregated from core source files:

```
D:\MABSVET-Integration\
├── apps\
│   ├── portal-frontend\               # React/Vite Portal
│   │   ├── Test_MSBSVET\              # Source, public assets, components
│   │   └── .git\                      # Preserved independent Git worktree
│   └── portal-backend\                # ASP.NET Core 8 Solution
│       ├── Portal.Server\             # Web API gateway, controllers, middleware
│       ├── Portal.Business\           # Business logic, OCR worker implementation
│       ├── Portal.Data\               # Data access
│       ├── Portal.Entities\           # DTOs and entities
│       └── .git\                      # Preserved independent Git worktree
│
├── services\
│   ├── chatbot\                       # FastAPI Chatbot & RAG Microservice (:8005)
│   │   ├── app\                       # FastAPI application routes and RAG core
│   │   ├── chroma_db\                 # ChromaDB Vector Store (1,304 vectorized chunks, 34.6 MB)
│   │   ├── data\                      # Raw knowledge base JSON files (courses, website)
│   │   └── requirements.txt           # Python package requirements
│   ├── tts\                           # Somya IndicTTS Neural Voice Service (:8006)
│   │   ├── server.py                  # Unified FastAPI service wrapper
│   │   ├── somya_engine.py            # Somya GGUF inference & SNAC 24kHz audio decoder
│   │   ├── deploy\                    # Remote GPU host deployment package (systemd service)
│   │   └── requirements.txt           # TTS dependencies (torch, soundfile, snac, requests)
│   └── ocr\                           # PaddleOCR Microservice (:8000, CPU Mode)
│       ├── ocr_backend.py             # FastAPI OCR server (PAN, Aadhaar, GR, Reg cert)
│       ├── requirements.txt           # PaddlePaddle CPU & PyMuPDF requirements
│       └── tests\                     # Pytest suite
│
├── tests\                             # 208 Consolidated Automated Tests (100% Passing)
│   ├── unit\                          # 155 Unit & State Machine tests (.mjs, .py)
│   ├── integration\                   # 29 Integration & Language Routing tests (.py, .mjs)
│   └── e2e\                           # 24 E2E 8-Stage Gateway tests (.py)
│
├── scripts\                           # Service lifecycle & benchmark automation
│   ├── start_all_services.ps1         # Launches OCR (:8000), TTS (:8006), Chatbot (:8005), Gateway (:5279)
│   ├── stop_all_services.ps1          # Gracefully terminates all 4 microservice processes
│   ├── run_all_tests.ps1              # Master test runner (all 208 tests)
│   └── benchmark_pipeline.py          # Latency & throughput benchmarking tool
│
└── docs\                              # Technical specifications and audit reports
    ├── ARCHITECTURE.md                # System topology and multilingual request flow
    ├── README.md                      # Consolidated developer setup instructions
    ├── POST_CONSOLIDATION_VERIFICATION_REPORT.md # Verification evidence report
    └── TEAM_HANDOVER_CHECKLIST.md     # This handover audit report
```

### Active Source File Inventory (Excluding Vendor/Build Artifacts)

| Directory | Non-Vendor Files | Disk Footprint | Code Files | Primary Languages |
| :--- | :---: | :---: | :---: | :--- |
| `apps/` | 2,106 | 370.32 MB | 1,322 | JavaScript/JSX, C# (.cs), HTML/CSS |
| `services/` | 82 | 71.92 MB | 39 | Python (.py), JSON, Shell/Service config |
| `tests/` | 12 | 0.08 MB | 12 | JavaScript (.mjs), Python (.py) |
| `scripts/` | 4 | 0.01 MB | 4 | PowerShell (.ps1), Python (.py) |
| `docs/` | 6 | 0.10 MB | 6 | Markdown (.md) |
| **TOTAL** | **2,210** | **442.43 MB** | **1,383** | Polyglot (JS, C#, Python, PS1, SQL) |

*(Note: Raw directory size with `node_modules` and Python `venv` exceeds 15.8 GB).*

---

## 3. Git Repository & Remote Status Audit

An exhaustive filesystem scan located six independent `.git` directories across the workspace.

### Detailed Git Repository Audit

| Repository Path | Remote URL | Active Branch | HEAD Commit | Uncommitted / Untracked Changes | Pushed to Remote? |
| :--- | :--- | :---: | :---: | :---: | :---: |
| `apps/portal-backend` | `https://github.com/mayureshsawant3557/MSBSVET-Backend.git` | `master` | `f69f9b5` | **11 files** | **NO** (Local modifications uncommitted) |
| `apps/portal-frontend` | `https://github.com/mayureshsawant3557/MSBSVET-Frontend.git` | `master` | `78f02a6` | **25 files** | **NO** (Local modifications uncommitted) |
| `services/chatbot` | *None* (Unversioned directory) | N/A | N/A | Entire directory | **NO REMOTE REPO** |
| `services/tts` | *None* (Unversioned directory) | N/A | N/A | Entire directory | **NO REMOTE REPO** |
| `services/ocr` | *None* (Unversioned directory) | N/A | N/A | Entire directory | **NO REMOTE REPO** |
| `tests/`, `scripts/`, `docs/` | *None* (Unversioned workspace root) | N/A | N/A | Entire directories | **NO REMOTE REPO** |
| `OCR/MSBSVET/msbsvet backend` | `https://github.com/mayureshsawant3557/MSBSVET-Backend.git` | `master` | `f69f9b5` | 11 files | Legacy duplicate archive |
| `OCR/MSBSVET/msbsvet frontend` | `https://github.com/mayureshsawant3557/MSBSVET-Frontend.git` | `master` | `78f02a6` | 25 files | Legacy duplicate archive |
| `Reference/MSBSVET_CHATBOT-main` | `https://github.com/Kalpesh-S-Mahajan/MSBSVET_CHATBOT-main.git` | `main` | `d9b720d` | 3 files (`backend/` untracked) | Reference repository only |
| `Reference/bilingual-chatbot-backend-v2` | `https://github.com/Kalpesh-S-Mahajan/iti-admission-chatbot.git` | `main` | `4f259dd` | Clean | Reference repository only |

### Exact Uncommitted Kaushalya AI Files

#### 1. Backend (`apps/portal-backend`) — 11 Uncommitted Files
- `?? Portal.Server/Controllers/Base/ChatbotController.cs` (Kestrel reverse-proxy for `/api/chat` and `/api/tts`)
- `?? Portal.Business/Interface/Base/IOcrVerificationService.cs` (OCR interface)
- `?? Portal.Business/Worker/Base/OcrVerificationServiceWorker.cs` (PaddleOCR client worker)
- `M  Portal.Server/Controllers/Institute/PromotionalOrganisationController.cs` (OCR document verification endpoint)
- `M  Portal.Server/Middleware/DecryptRequestMiddleware.cs` (Whitelist for chatbot/OCR endpoints)
- `M  Portal.Server/Middleware/DependencyInjection.cs` (DI registration for OCR worker)
- `M  Portal.Server/Middleware/HybridDecryptMiddleware.cs` (Bypass for multipart/form-data & AI routes)
- `M  Portal.Server/Portal.Server.csproj` (Http client & proxy package references)
- `M  Portal.Server/Program.cs` (Reverse-proxy and CORS middleware configuration)
- `M  Portal.Server/Properties/launchSettings.json` (Port 5279 launch profiles)
- `M  Portal.Server/appsettings.json` (`ChatbotServiceUrl` & `OcrVerificationServiceUrl` configuration)

#### 2. Frontend (`apps/portal-frontend`) — 25 Uncommitted Files
- `?? Test_MSBSVET/src/Component/Home/SmartVoiceAssistant.jsx` (Conversational Voice Assistant UI)
- `?? Test_MSBSVET/src/utils/formRegistry.js` (10-Step Profile Form Registry & field mapping)
- `?? Test_MSBSVET/src/utils/nameParser.js` (Devanagari/English name tokenizer)
- `?? Test_MSBSVET/src/utils/dateParser.js` (Multilingual date normalization)
- `?? Test_MSBSVET/src/utils/speechUtils.js` (Audio chunk queue, speech synthesis client)
- `?? Test_MSBSVET/src/utils/speech_input.js` (Speech recognition coordinator & debouncer)
- `?? Test_MSBSVET/jsconfig.json` (Path alias config)
- `?? Test_MSBSVET/test_date_parsing.js` (Date test scratch helper)
- `M  Test_MSBSVET/src/App.jsx` (Mounts SmartVoiceAssistant on landing and login routes)
- `M  Test_MSBSVET/package.json` & `package-lock.json` (Speech and audio package dependencies)
- `M  Test_MSBSVET/src/Component/Login/CandidateAndStaff/Address.jsx` (Autofill integration)
- `M  Test_MSBSVET/src/Component/Login/CandidateAndStaff/Parent.jsx` (Autofill integration)
- `M  Test_MSBSVET/src/Component/Login/CandidateAndStaff/Category.jsx` (Autofill integration)
- `M  Test_MSBSVET/src/Component/Login/CandidateAndStaff/BankDetailsForm.jsx` (Autofill integration)
- `M  Test_MSBSVET/src/Component/UserTypes/candidate.jsx` (Autofill integration)
- `M  Test_MSBSVET/src/Component/UserTypes/Staff.jsx` (Autofill integration)
- `M  Test_MSBSVET/src/Component/formcomponent/DropdownComponent.jsx` (Controlled value prop fix)
- `M  Test_MSBSVET/src/Component/formcomponent/FormComponent.jsx` (Controlled value prop fix)
- `M  Test_MSBSVET/src/Component/Institute/PromotingOrgnisation/PromotingOrganization.jsx` (OCR verification modal integration)
- `M  Test_MSBSVET/src/pages/Registrations/PromotingOrganizationRegistration.jsx` (OCR integration)
- `M  Test_MSBSVET/.env`, `.env.development`, `.env.production`, `.env.staging` (API endpoint variables)

---

## 4. Verification of Remote Repository Content (GitHub Reality Check)

> [!CAUTION]
> **CRITICAL FINDING:** Files existing locally do NOT prove they exist on GitHub.
> A third-party developer who clones `MSBSVET-Frontend` and `MSBSVET-Backend` from GitHub today will receive a legacy application that completely lacks:
> 1. The Smart Voice Assistant (`SmartVoiceAssistant.jsx`).
> 2. The 10-step Candidate Registration conversational onboarding system.
> 3. The FastAPI Chatbot, ChromaDB vector database, and RAG knowledge base.
> 4. The Somya IndicTTS neural voice service and deployment packages.
> 5. The PaddleOCR microservice and .NET document verification worker.
> 6. All 208 automated regression, integration, and E2E test suites.

---

## 5. Nested Git Repositories & Monorepo Hazards

The workspace root `D:\MABSVET-Integration` currently contains **no root `.git` repository**.

### The Gitlink Hazard
If an engineer attempts to create a monorepo by simply executing `git init` in `D:\MABSVET-Integration` followed by `git add .`, Git will detect the embedded `.git` directories in `apps/portal-frontend` and `apps/portal-backend`.
- **Result:** Git will stage them as **gitlinks** (submodule mode `160000 commit`), recording only a pointer to local commit hashes `78f02a6` and `f69f9b5`.
- **Failure Mode:** None of the files inside `apps/portal-frontend` or `apps/portal-backend` will be tracked in the monorepo. When cloned by another developer, both `apps/portal-frontend` and `apps/portal-backend` will be **completely empty folders**.

### Recommended Monorepo Creation Strategy (Preserving Full Git History)
To safely merge the existing histories into a unified repository without breaking changes:
1. **Commit Local Changes to Feature Branches First:**
   - In `apps/portal-frontend`: create branch `feat/kaushalya-voice-assistant`, stage all 25 files, and commit.
   - In `apps/portal-backend`: create branch `feat/kaushalya-gateway-proxy`, stage all 11 files, and commit.
2. **Initialize Monorepo with Git Subtree Merge:**
   - Create root repository in a clean workspace or after safely backing up `.git` directories.
   - Use `git subtree add --prefix=apps/portal-frontend apps/portal-frontend feat/kaushalya-voice-assistant` to import full frontend commit history under `apps/portal-frontend/`.
   - Use `git subtree add --prefix=apps/portal-backend apps/portal-backend feat/kaushalya-gateway-proxy` to import full backend commit history under `apps/portal-backend/`.
   - Add `services/`, `tests/`, `scripts/`, `docs/`, `.gitignore`, and `.env.example` as native top-level commits.
   - Archive and remove embedded `.git` directories within `apps/*` so they remain standard directories in the monorepo.

---

## 6. Sanitized Handover Manifest (Source Code Only)

When packaging the application for handover, include **only** the following paths.

### Handover File Inclusion List
```
apps/portal-frontend/Test_MSBSVET/
  ├── package.json
  ├── package-lock.json
  ├── vite.config.js
  ├── jsconfig.json
  ├── index.html
  ├── .env.example                     # Sanitized template
  ├── public/                          # Static images, icons, logos
  └── src/                             # Complete React source tree (including SmartVoiceAssistant.jsx & utils/)

apps/portal-backend/
  ├── MSBSVET-Backend.sln
  ├── Portal.Server/                   # Controllers, Program.cs, launchSettings.json, appsettings.Example.json
  ├── Portal.Business/                 # Business services, IOcrVerificationService, OcrVerificationServiceWorker
  ├── Portal.Data/                     # Data access
  ├── Portal.DataMySQL/                # MySQL provider
  └── Portal.Entities/                 # DTOs and database models

services/chatbot/
  ├── app/                             # FastAPI application, core RAG, multilingual TTS routing
  ├── data/                            # courses.json, website_knowledge.json
  ├── requirements.txt
  └── .env.example                     # Sanitized template

services/tts/
  ├── server.py                        # FastAPI TTS server
  ├── somya_engine.py                  # Somya GGUF runner & SNAC audio decoder
  ├── deploy/                          # Systemd service unit & remote GPU host deployment runbook
  └── requirements.txt

services/ocr/
  ├── ocr_backend.py                   # FastAPI PaddleOCR microservice
  ├── requirements.txt
  └── tests/                           # Pytest suite

tests/                                 # All 208 unit, integration, and e2e test files
scripts/                               # start_all_services.ps1, stop_all_services.ps1, run_all_tests.ps1
docs/                                  # ARCHITECTURE.md, README.md, POST_CONSOLIDATION_VERIFICATION_REPORT.md
```

---

## 7. Strict Exclusion List (Do Not Hand Over)

The following files and directories **must never** be included in a shared Git repository or handover ZIP:

```
# Secrets & Credentials (HIGH SECURITY RISK)
**/.env
**/.env.development
**/.env.production
**/.env.staging
apps/portal-backend/Portal.Server/appsettings.json (Contains real DB passwords, JWT key, Razorpay keys)
services/chatbot/.env (Contains real GEMINI_API_KEY)

# Machine-Specific Virtual Environments & Dependencies (>15 GB)
**/node_modules/
**/venv/
**/.venv/

# Build Outputs & Binary Artifacts
**/bin/
**/obj/
**/dist/
**/.vs/
**/.vscode/

# Ephemeral Caches & Temporary Files
**/__pycache__/
**/*.pyc
**/*.log
**/*.sqlite3-journal
services/tts/outputs/*.wav
services/tts/outputs/*.mp3

# Heavy Pre-trained Model Weights (Fetch Separately)
**/*.gguf                              # Somya-IndicTTS (~2.25 GB)
**/*.pdparams                          # PaddleOCR model weights
**/*.pdmodel
```

---

## 8. External Assets & Model Weights Setup Guide

The receiving developer must provision the following weights and database assets:

### 1. Somya IndicTTS Neural Model (Marathi Voice)
- **Model Name:** `Somya-IndicTTS.Q4_K_M.gguf` (~2.25 GB)
- **Hugging Face Repository:** `mradermacher/Somya-IndicTTS-GGUF`
- **Download Command:**
  ```powershell
  # Using huggingface_hub CLI or curl
  huggingface-cli download mradermacher/Somya-IndicTTS-GGUF Somya-IndicTTS.Q4_K_M.gguf --local-dir "C:\Models\Somya"
  ```
- **Environment Variable:** Set `SOMYA_GGUF_PATH=C:\Models\Somya\Somya-IndicTTS.Q4_K_M.gguf`

### 2. llama.cpp Binary (`llama-server.exe`)
- **Installation via WinGet (Windows):**
  ```powershell
  winget install ggml.llamacpp
  ```
- **Linux Installation (Ubuntu for remote host):**
  ```bash
  apt update && apt install -y build-essential cmake
  git clone https://github.com/ggerganov/llama.cpp
  cd llama.cpp && cmake -B build -DGGML_CUDA=ON && cmake --build build --config Release -j
  ```
- **Environment Variable:** Set `LLAMA_SERVER_PATH=/path/to/llama-server`

### 3. SNAC 24kHz Audio Codec Decoder
- **Model ID:** `hubertsiuzdak/snac_24khz`
- **Setup:** Automatically downloaded to `~/.cache/huggingface/hub/` on the first execution of `somya_engine.py`. Requires active internet access during first launch.

### 4. ChromaDB Vector Store (1,304 Chunks)
- **Included in Handover:** The pre-vectorized SQLite database at `services/chatbot/chroma_db/` (34.56 MB) can be safely shared across developers. It contains no user data or secrets (only public MSBSVET website and course knowledge).
- **Rebuilding from Scratch (Optional):** If rebuilt, the developer runs the RAG ingestion script against `services/chatbot/data/website_knowledge.json` and `courses.json` using a valid `GEMINI_API_KEY`.

### 5. PaddleOCR Detection & Recognition Weights
- **Model Suite:** PP-OCRv4 Mobile/Server models.
- **Setup:** Automatically downloaded by PaddlePaddle on first request to `~/.paddleocr/whl/`.

---

## 9. Startup Order, Health Checks & GPU Hardware Boundaries

### Actual Service Startup Sequence
To prevent connection-refused errors, services must be launched in dependency order:

```
Step 1: PaddleOCR Microservice (:8000)
  Command: services/ocr/venv/Scripts/python.exe ocr_backend.py
  Health Check: curl -f http://127.0.0.1:8000/health

Step 2: Somya IndicTTS Service (:8006)
  Command: services/tts/.venv/Scripts/python.exe server.py
  Health Check: curl -f http://127.0.0.1:8006/health
  (Note: Automatically starts internal llama-server on port 8008)

Step 3: FastAPI Chatbot & RAG Microservice (:8005)
  Command: services/chatbot/venv/Scripts/python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8005
  Health Check: curl -f http://127.0.0.1:8005/api/health

Step 4: ASP.NET Core Main Application Gateway (:5279)
  Command: dotnet run --project apps/portal-backend/Portal.Server/Portal.Server.csproj --launch-profile http
  Health Check: curl -X POST http://127.0.0.1:5279/api/chat -H "Content-Type: application/json" -d "{\"message\":\"hello\"}"

Step 5: React/Vite Frontend Portal (:5173 / Production Web Server)
  Command: cd apps/portal-frontend/Test_MSBSVET && npm run dev
  Health Check: Browser navigation to http://localhost:5173
```
*(Automated launch script: [`scripts/start_all_services.ps1`](file:///D:/MABSVET-Integration/scripts/start_all_services.ps1))*.

### Can the Receiving Developer Run Without a GPU?
- **Frontend, Gateway, Chatbot, and PaddleOCR:** **YES.** All run efficiently on standard CPU-only hardware. PaddleOCR inference completes in ~0.5 seconds on CPU.
- **Somya IndicTTS (Marathi Voice):**
  - **CPU Mode:** Can technically run on CPU (`-ngl 0` in llama-server and `device='cpu'` in PyTorch), but synthesis latency is **13.7 to 36.1 seconds** per sentence, which is unusable for interactive conversation.
  - **GPU Mode:** On a consumer GPU (e.g. RTX 3050 Laptop GPU or higher), synthesis takes **3.35 seconds**.
  - **Production Plan:** Somya IndicTTS will run on a dedicated remote compute host with a GPU. Because that remote compute host is **not yet provisioned**, a receiving developer on a CPU-only laptop must either:
    1. Temporarily test speech using English or Hindi (routed via Google Indic TTS at <1.2s latency), OR
    2. Provision a cloud GPU instance (e.g. AWS g4dn/g5 or RunPod) and deploy `services/tts/deploy/` there, pointing `SOMYA_TTS_URL` to that remote IP.

---

## 10. Remediation Checklist & Safest Next Actions

To transition this project from **NOT READY** to **READY FOR HANDOVER**, complete the following actions:

### Phase A: Prepare Sanitized Configuration Templates (Safe, Zero-Risk)
- [ ] Create [`apps/portal-frontend/Test_MSBSVET/.env.example`](file:///D:/MABSVET-Integration/apps/portal-frontend/Test_MSBSVET/.env.example) with placeholder values.
- [ ] Create [`services/chatbot/.env.example`](file:///D:/MABSVET-Integration/services/chatbot/.env.example) documenting `GEMINI_API_KEY=your_key_here`, `SOMYA_TTS_URL`, etc.
- [ ] Create [`apps/portal-backend/Portal.Server/appsettings.Example.json`](file:///D:/MABSVET-Integration/apps/portal-backend/Portal.Server/appsettings.Example.json) with sanitized connection strings.

### Phase B: Prepare for ZIP Handover (If Handing Over via Secure Archive)
- [ ] Write an automated packaging script (`scripts/package_handover_zip.ps1`) using the inclusion/exclusion filters defined in Section 6 & 7.
- [ ] Verify that the resulting ZIP contains no secrets, virtual environments, or binaries, and measures under ~450 MB.
- [ ] Mark status as **READY FOR ZIP HANDOVER**.

### Phase C: Prepare for Shared Git Repository Handover (If Handing Over via GitHub)
- [ ] **Frontend:** Create branch `feat/kaushalya-voice-assistant` in `apps/portal-frontend`, commit the 25 files with a clear message, and push to `mayureshsawant3557/MSBSVET-Frontend`.
- [ ] **Backend:** Create branch `feat/kaushalya-gateway-proxy` in `apps/portal-backend`, commit the 11 files with a clear message, and push to `mayureshsawant3557/MSBSVET-Backend`.
- [ ] **Microservices:** Create a new remote repository (e.g., `MSBSVET-Kaushalya-AI` or a unified monorepo following Section 5) to host `services/`, `tests/`, `scripts/`, and `docs/`.
- [ ] Mark status as **READY FOR SHARED REPOSITORY HANDOVER**.

