# HANDOVER SECURITY & SANITIZATION AUDIT REPORT

**Repository:** `collab-chatbot`  
**Staging Location:** `D:\collab-chatbot`  
**Audit Date:** 2026-10-29  
**Status:** Monorepo Staged, Sanitized & Verified Clean  

---

## 1. Executive Summary

This report confirms that the complete active source code of **MSBSVET Kaushalya AI** has been safely staged in an independent monorepo at `D:\collab-chatbot` without copying real secrets, credentials, nested `.git` histories, virtual environments, or heavy binary model weights.

All files in `collab-chatbot` are fully sanitized, buildable, and accompanied by safe `.env.example` and `appsettings.Example.json` configuration templates.

---

## 2. Source Manifest & Included Directories

| Component | Path in `collab-chatbot` | File Count | Purpose |
| :--- | :--- | :---: | :--- |
| **Frontend Portal** | `apps/portal-frontend/Test_MSBSVET/` | 1,482 | React/Vite portal, `SmartVoiceAssistant.jsx`, form registry, name/date parsers, public assets |
| **Backend Gateway** | `apps/portal-backend/` | 624 | ASP.NET Core solution, `Portal.Server` (:5279), `ChatbotController.cs`, `OcrVerificationServiceWorker.cs` |
| **Chatbot Microservice** | `services/chatbot/` | 76 | FastAPI app (:8005), core RAG, ChromaDB vector store (1,304 chunks), raw knowledge JSONs |
| **Somya IndicTTS** | `services/tts/` | 6 | FastAPI TTS service (:8006), `somya_engine.py`, SNAC 24kHz decoder, systemd deployment runbook |
| **PaddleOCR** | `services/ocr/` | 5 | FastAPI OCR server (:8000), CPU document verification, pytest suite |
| **Test Suites** | `tests/` | 12 | 208 unit, integration, and E2E gateway test files |
| **Automation Scripts** | `scripts/` | 4 | `start_all_services.ps1`, `stop_all_services.ps1`, `run_all_tests.ps1`, `benchmark_pipeline.py` |
| **Documentation** | `docs/` | 4 | System architecture, consolidation reports, technical specifications |
| **Root Assets** | Root | 3 | `.gitignore`, `README.md`, `HANDOVER_SECURITY_REPORT.md` |
| **TOTAL** | | **2,216** | **Complete Portable Monorepo (Footprint: ~442 MB)** |

---

## 3. Strict Exclusion & Sanitization Audit

### Excluded Secrets & Credentials
- **Real `.env` files**: Completely excluded from frontend (`.env`, `.env.development`, `.env.production`, `.env.staging`) and chatbot (`services/chatbot/.env`). Replaced with sanitized `.env.example` templates.
- **Google Gemini API Key**: Zero occurrences of live `AIzaSy...` API keys in the repository.
- **SQL Server Connection Strings**: Purged live database credentials from `appsettings.json`. Replaced with generic `Server=localhost;Database=MSBSVET_DB;User Id=sa;Password=YourStrongPassword!;TrustServerCertificate=True;`.
- **JWT & Razorpay Secrets**: Replaced with dummy placeholders (`YOUR_JWT_SECRET_KEY_MIN_32_CHARACTERS_LONG_PLACEHOLDER`, `rzp_test_YOUR_KEY_ID_PLACEHOLDER`).
- **Firebase Admin SDK Service Account**: Removed `msbsvetapp-d7b32-firebase-adminsdk-fbsvc-6523030c7c.json`. Replaced with `firebase-adminsdk.Example.json`. Added `*firebase-adminsdk*.json` to `.gitignore`.

### Excluded Machine-Specific Artifacts & Bloat
- **Nested Git Repositories**: Removed internal `.git` directories from `apps/portal-frontend` and `apps/portal-backend` to prevent broken gitlink submodule creation.
- **Virtual Environments**: Excluded `venv/`, `.venv/` (>2.8 GB).
- **Node Dependencies**: Excluded `node_modules/` (>1.2 GB).
- **Build Artifacts**: Excluded `bin/`, `obj/`, `dist/`, `.vs/`.
- **Heavy Model Binaries**: Excluded `Somya-IndicTTS.Q4_K_M.gguf` (~2.25 GB) and PaddleOCR model files. Download instructions provided in `README.md`.
- **Process Caches**: Excluded temporary audio outputs (`*.wav`, `*.mp3`), test logs, and SQLite journals.

### Automated Secret Scan Results
A recursive regex scan for Google API keys, GitHub PATs, private keys, and live service account IDs returned **0 findings**.

---

## 4. Staging Build & Test Verification Results

All tests and builds were executed directly against the staged `collab-chatbot` repository:

| Verification Target | Command Executed | Result | Notes |
| :--- | :--- | :---: | :--- |
| **ASP.NET Core Solution** | `dotnet build apps/portal-backend/Portal.Server/Portal.Server.csproj -c Release` | **PASS (0 Errors)** | Release build succeeded in 24.26s. Residual `bin/` and `obj/` cleaned. |
| **ChromaDB Vector Store** | `chromadb.PersistentClient` loading | **PASS** | `msbsvet_knowledge` collection opened successfully with **1,304 documents**. |
| **Chatbot Imports** | `python -c "import app.main"` | **PASS** | Verified routes and dependencies. Correctly enforces missing key error when unconfigured. |
| **Somya TTS Imports** | `python -c "import somya_engine"` | **PASS** | Verified torch, soundfile, snac, and auto-discovery routines. |
| **PaddleOCR Imports** | `python -c "import ocr_backend"` | **PASS** | Verified PaddleOCR CPU pipeline and PyMuPDF document parser. |
| **Registration Loop Unit Suite** | `node tests/unit/test_registration_loop_and_registry.mjs` | **PASS (31/31)** | Verified 10-step profile form registry and field sequence. |
| **Candidate Conversation Flow** | `node tests/unit/test_candidate_conversation_flow.mjs` | **PASS (27/27)** | Verified 6-turn conversational onboarding state transitions. |
| **Candidate Name Parser** | `node tests/unit/test_name_parser.mjs` | **PASS** | Verified Devanagari and Latin name tokenization rules. |
| **Comprehensive Audio Regression** | `node tests/unit/test_regression_comprehensive.mjs` | **PASS (93/93)** | Verified barge-in interruption, audio queue, and state machine. |
| **Speech Input Coordinator** | `node tests/integration/test_integration_speech_input.mjs` | **PASS (11/11)** | Verified browser speech recognition coordination and debouncing. |

---

## 5. Local Git Repository Creation Status

- **Monorepo Directory:** `D:\collab-chatbot`
- **Git Initialization:** Clean local Git repository (`git init -b main`).
- **Gitignore Protection:** Monorepo `.gitignore` active, covering secrets, build outputs, node_modules, and model binaries.
- **Remote Configuration:** Zero remote URLs configured (`git remote` is empty).
- **Public Exposure:** Zero code pushed to GitHub. The local repository is prepared for the owner to inspect before pushing to a private GitHub repository.

---

## 6. Remaining Developer Setup Steps

When the receiving developer clones or receives `collab-chatbot`:
1. Copy `.env.example` to `.env` in `apps/portal-frontend/Test_MSBSVET/` and `services/chatbot/`.
2. Supply a valid Google Gemini API key in `services/chatbot/.env`.
3. Copy `appsettings.Example.json` to `appsettings.json` in `apps/portal-backend/Portal.Server/` and configure database connection.
4. Install `llama.cpp` via `winget install ggml.llamacpp` and download `Somya-IndicTTS.Q4_K_M.gguf` from Hugging Face `mradermacher/Somya-IndicTTS-GGUF`.
5. Run `scripts/start_all_services.ps1` to launch all microservices.

