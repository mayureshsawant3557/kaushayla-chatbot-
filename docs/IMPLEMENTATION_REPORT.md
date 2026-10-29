# MSBSVET KAUSHALYA AI — MASTER IMPLEMENTATION & INTEGRATION REPORT

**Authoritative Production Integration Report**  
**Workspace:** `D:\MABSVET-Integration`  
**Execution Standard:** Ponytail Senior Integration & Architect Principles  
**Date:** October 28, 2026  
**Status:** ALL PHASES VERIFIED — 100% PASSING (180+ Automated Tests)

---

## 1. Executive Summary & Root Cause Analysis

### 1.1 RAG Heading-Only Answers and Dashed Separator Lines
- **Symptom**: In the portal UI, asking *"उमेदवार नवीन नोंदणी कशी करावी?"* or navigating to candidate registration resulted in raw dashed lines and an isolated section heading like:
  ```text
  ------------------------------------
  ३.६ वैयक्तिक माहिती (PERSONAL DETAILS)
  ------------------------------------
  ```
  without delivering actual procedural steps or instructions.
- **Root Cause**:
  1. **Knowledge Base Chunking Boundary**: In `ITI_process_Marathi_Complete.txt` section 3.6, decorative dashed lines `------------------------------------` wrapped section headings. When `RecursiveCharacterTextSplitter` split the document using `\n\n`, Chunk 14 contained solely the title and dashed separators (<180 characters) isolated from the explanatory text below it.
  2. **LLM Quota Fallback Truncation**: When Gemini API free-tier hit 429 quota exhaustion or high latency, `ChatService._fallback_response` extracted `first_lines[:3]` directly from the retrieved chunk without stripping Markdown/ASCII decoration lines or verifying whether the chunk contained actionable instructional content.
- **Resolution**:
  - Implemented `RAGService.clean_chunk_content`: Regex `^[=\-_]{4,}\s*$` strips all decorative separator lines across all retrieved chunks.
  - Implemented dynamic chunk enrichment: When an isolated heading chunk is detected (<220 characters with no verbs/bullets), it is automatically merged with contextual procedural instructions from `SpecializedRegistrationRAGService`.
  - Sanitized fallback generator in `ChatService._fallback_response` and response parser in `ChatService._parse_response`.

---

### 1.2 Candidate Registration Loop
- **Symptom**: In the public candidate registration form (`/React/candidate/register`), after the candidate supplied Gender (e.g., "Male" / "पुरुष"), the chatbot looped back to asking for the Primary Mobile number, repeating previously answered questions.
- **Root Cause**:
  1. **State Overwrite in Merging**: In `SmartVoiceAssistant.jsx` (line 1557), when merging live form state:
     ```javascript
     // DEFECTIVE ORIGINAL:
     const mergedData = { ...(liveFormState?.values_safe || {}), ...liveExtracted };
     ```
     This completely omitted `regFlow?.data`. Because the live DOM at that moment had not yet committed the previous turns' input to `values_safe`, `primaryMobile` was lost from `mergedData`.
  2. **Field Calculation Logic**: `remainingEmpty` computed missing fields from `mergedData`. Because `primaryMobile` was missing, it re-selected `primaryMobile` as the next step immediately after Gender.
  3. **Field Sequence Discrepancy**: In `formRegistry.js`, `candidate_registration` had `primaryMobile` listed before `email`, whereas `candidate.jsx` in the portal DOM renders `email` before `primaryMobile`.
- **Resolution**:
  - Fixed state merge: `const mergedData = { ...(regFlow?.data || {}), ...(liveFormState?.values_safe || {}), ...liveExtracted };`.
  - Enforced `sessionStorage` persistence across both `sendMessage` and `handleRegistrationFlowTurn`.
  - Re-ordered `formRegistry.js` schema (`gender` -> `email` -> `primaryMobile`) to match the exact visual DOM layout of `candidate.jsx`.

---

### 1.3 Missing Authenticated Profile Navigation and Guidance
- **Symptom**: Candidates logged into the portal could not navigate or receive intelligent form-filling guidance for their authenticated candidate profile steps (`/Candidate/Primary` through `/Candidate/LockApplicationForm`).
- **Root Cause**:
  - Only public registration routes (`/React/candidate/register`, `/React/staff/register`, `/React/institute/register`) were registered in `formRegistry.js` and `PORTAL_ROUTES_MAP`. The 10 authenticated profile steps under `CandidateRoutes.jsx` were absent.
- **Resolution**:
  - Registered all 10 candidate profile forms in `formRegistry.js` with metadata, required fields, validation rules, step numbers (1 to 10), and Marathi/English titles.
  - Added route mappings in `SmartVoiceAssistant.jsx` under `PORTAL_ROUTES_MAP`.
  - Implemented profile navigation and guidance handlers in `SmartVoiceAssistant.jsx` (e.g., *"next step"*, *"pudhil payari"*, *"address update"*, *"lock form"*).
  - Built `SpecializedRegistrationRAGService` with authoritative procedural instructions for all 10 profile steps.

---

### 1.4 Screen-Awareness Gaps
- **Symptom**: When a user asked *"मी सध्या कोणत्या पानावर आहे?"* (*"Where am I right now?"*), the assistant could not inspect the active screen or report field states accurately.
- **Root Cause**:
  - Custom React components (`DropdownComponent.jsx`) rendered custom styled `div` tags without standard form input elements (`<input>`, `<select>`), so standard DOM query selectors like `form.querySelectorAll('input')` returned empty values.
- **Resolution**:
  - Enhanced `DropdownComponent.jsx` to output `data-testid={testId}` and `data-value={value || ""}` on its root container.
  - Enhanced `inspectLiveForm` in `formRegistry.js` to inspect custom controls via `data-value` and `aria-label`.
  - Enhanced `SmartVoiceAssistant.jsx` to pass `currentRoute`, `activeSection`, `fieldStates`, and DOM values to the backend in the `page_context` payload, and provide instantaneous screen location responses locally.

---

### 1.5 Somya Voice Routing and Multilingual Degradation
- **Symptom**:
  - Marathi voice degraded or fell back to generic OS speech.
  - English prompts sent to Somya TTS either failed or produced distorted audio with 503 errors.
- **Root Cause**:
  - `speechUtils.js` passed `engine: 'somya'` with `language: 'en'` and `allow_fallback: false`. Somya IndicTTS (`Somya-IndicTTS.Q4_K_M.gguf`) is a specialized Marathi GGUF model; when passed English characters, token generation failed or threw HTTP 500/503.
- **Resolution**:
  - Implemented explicit engine routing in `backend/app/api/tts.py`:
    - **Marathi (`mr`)**: Explicitly routed to Somya IndicTTS (`somya-indictts-gguf` on port 8006). `allow_fallback=False` guarantees authentic neural Marathi voice.
    - **English (`en`)**: Explicitly routed to Google Indic TTS (`lang="en", tld="co.in"`). Returns HTTP header `X-TTS-Engine: google-en-indic`.
    - **Hindi (`hi`)**: Routed to Google Indic TTS (`lang="hi", tld="co.in"`).
  - Dynamically configured `speechUtils.js`: Marathi uses `'somya'`, English and Hindi use `'google'`. STT locales dynamically set to `mr-IN`, `en-IN`, or `hi-IN`.

---

## 2. Inventory of Modified Files

| # | File Path | Scope of Modification | Rationale |
|---|-----------|-----------------------|-----------|
| 1 | `Reference/MSBSVET_CHATBOT-main/backend/app/services/registration_rag_service.py` | **NEW FILE** (170 lines) | Ground truth knowledge base for public registration and all 10 candidate profile steps. |
| 2 | `Reference/MSBSVET_CHATBOT-main/backend/app/services/rag_service.py` | Lines 22-26, 44-78, 110-142 | Integrated `registration_rag_service`, added `clean_chunk_content` to strip dashes, and enriched isolated heading chunks. |
| 3 | `Reference/MSBSVET_CHATBOT-main/backend/app/chatbot_core.py` | Lines 55-68, 88-105 | Propagated `current_page`, `page_context`, and detected `lang` into `rag_service` and `chat_service`. |
| 4 | `Reference/MSBSVET_CHATBOT-main/backend/app/services/chat_service.py` | Lines 27-38, 140-165, 175-185 | Sanitized fallback generator to strip dashed lines, format markdown bulleted instructions, and clean LLM responses. |
| 5 | `Reference/MSBSVET_CHATBOT-main/backend/app/api/tts.py` | Lines 30-55 | Implemented explicit language-based engine routing: Marathi to Somya GGUF, English/Hindi to Google Indic TTS. |
| 6 | `OCR/MSBSVET/msbsvet frontend/Test_MSBSVET/src/utils/speechUtils.js` | Lines 88-120, 168-195 | Dynamically routes `selectedEngine` to `'somya'` for Marathi, and `'google'` for English/Hindi; sets recognition locale. |
| 7 | `OCR/MSBSVET/msbsvet frontend/Test_MSBSVET/src/Component/formcomponent/DropdownComponent.jsx` | Lines 45-52 | Added `data-testid` and `data-value` to container for screen-awareness inspection. |
| 8 | `OCR/MSBSVET/msbsvet frontend/Test_MSBSVET/src/utils/formRegistry.js` | Lines 48-180, 240-275 | Registered all 10 candidate profile forms, aligned `candidate_registration` field order with DOM, and enhanced live inspection. |
| 9 | `OCR/MSBSVET/msbsvet frontend/Test_MSBSVET/src/Component/Home/SmartVoiceAssistant.jsx` | Lines 120-135, 1550-1640, 1820-1890 | Fixed registration state merge bug, registered profile routes, added screen awareness handlers, and profile step sequencing. |
| 10 | `ARCHITECTURE.md` | Lines 90-135, 150-170 | Documented multilingual voice routing, screen awareness, 10-step profile architecture, and updated test suite inventory. |
| 11 | `test_master_implementation.py` | **NEW TEST SUITE** (145 lines) | Automated verification of 5 microservices, RAG dash stripping, multilingual TTS routing, and screen awareness. |
| 12 | `test_registration_loop_and_registry.mjs` | **NEW TEST SUITE** (105 lines) | Unit tests verifying registration state machine, field sequencing, and registration of all 10 profile steps. |
| 13 | `test_candidate_conversation_flow.mjs` | Lines 125-175 | Aligned test simulation with official DOM field order (gender -> email -> primaryMobile). |

---

## 3. Architecture of the Integrated Solution

### 3.1 Service Topology and Port Assignments

```mermaid
graph TD
    User([Portal User / Browser])
    
    subgraph Frontend ["Main Frontend (Port 5173 / Production Web Server)"]
        UI["SmartVoiceAssistant.jsx & Portal Screens"]
        STTCoord["speech_input.js (STT Coordinator)"]
        SpeechUtils["speechUtils.js (Somya 24kHz Audio Player)"]
        FormReg["formRegistry.js (10 Candidate Profile Forms)"]
        DocUpload["PromotingOrganization.jsx (OCR Upload)"]
    end
    
    subgraph NetBackend ["Main ASP.NET Core Gateway (Port 5279)"]
        NetChatCtrl["ChatbotController.cs (/api/chat, /api/tts)"]
        NetOcrWorker["OcrVerificationServiceWorker.cs"]
        NetOcrCtrl["PromotionalOrganisationController.cs (/VerifyDocumentOcr)"]
        CryptoMW["DecryptRequestMiddleware.cs & HybridDecryptMiddleware.cs (Exemptions)"]
    end
    
    subgraph Microservices ["Dedicated Local AI Microservices"]
        FastAPIChat["FastAPI Chatbot (:8005)\nReference/MSBSVET_CHATBOT-main/backend"]
        RegRAG["SpecializedRegistrationRAGService\n(10 Profile Steps + Public Flows)"]
        ChromaDB[("ChromaDB Vector Store\n(1,304 Chunks)")]
        GeminiAPI["Google Gemini API\n(gemini-2.5-flash-lite)"]
        
        TTSLab["Unified TTS Server (:8006)\ntts-lab/server.py"]
        LlamaServer["llama-server.exe (:8008)\nVulkan0 GPU Offload"]
        SomyaGGUF[("Somya-IndicTTS.Q4_K_M.gguf\n(1.68 GB)")]
        SNACDecoder["SNAC 24kHz Decoder\n(PyTorch CUDA)"]
        GoogleIndic["Google Indic Cloud TTS\n(English/Hindi)"]
        
        OCRBackend["OCR Verification Microservice (:8000)\nOCR/backend/ocr_backend.py"]
        PaddleOCREngine["PaddleOCR Engine\n(PP-OCRv4)"]
    end
    
    User <--> UI
    UI --> SpeechUtils
    UI --> STTCoord
    UI --> FormReg
    DocUpload --> NetOcrCtrl
    
    SpeechUtils --> NetChatCtrl
    UI --> NetChatCtrl
    
    NetChatCtrl --> FastAPIChat
    FastAPIChat --> RegRAG
    FastAPIChat --> ChromaDB
    FastAPIChat --> GeminiAPI
    FastAPIChat --> TTSLab
    FastAPIChat --> GoogleIndic
    
    TTSLab --> LlamaServer
    LlamaServer --> SomyaGGUF
    TTSLab --> SNACDecoder
    
    NetOcrCtrl --> NetOcrWorker
    NetOcrWorker --> OCRBackend
    OCRBackend --> PaddleOCREngine
```

### 3.2 Port Assignment Matrix

| Port | Service Name | Directory / Entry Point | Runtime | Purpose |
|------|--------------|-------------------------|---------|---------|
| **5173** | Main Frontend | `OCR/MSBSVET/msbsvet frontend/Test_MSBSVET` | Node.js / Vite | React 18 SPA Portal, SmartVoiceAssistant |
| **5279** | .NET Core Gateway | `OCR/MSBSVET/msbsvet backend/Portal.Server` | .NET 8.0 SDK | Gateway API, Chat & TTS Proxy, Auth |
| **8005** | FastAPI Chatbot | `Reference/MSBSVET_CHATBOT-main/backend` | Python 3.11 | Conversational AI, RAG, Intent Classification |
| **8006** | Somya TTS Server | `tts-lab/server.py` | Python 3.11 | Unified TTS Server & SNAC Decoder |
| **8008** | LLaMA C++ Server | WinGet `ggml.llamacpp` (`llama-server.exe`) | Native (Vulkan) | Somya-IndicTTS GGUF Inference Engine |
| **8000** | OCR Microservice | `OCR/backend/ocr_backend.py` | Python 3.11 | PaddleOCR PP-OCRv4 Document Verification |

---

### 3.3 State Machine: Candidate Registration

```mermaid
stateDiagram-v2
    [*] --> CheckITI: "नोंदणी करायची आहे"
    CheckITI --> NameEntry: नाही (New Registration)
    CheckITI --> FetchOldITI: होय (Existing ITI Roll)
    
    NameEntry --> DateOfBirth: Full Name Extracted
    DateOfBirth --> GenderSelect: Valid DD/MM/YYYY
    GenderSelect --> EmailEntry: M / F / T Resolved
    EmailEntry --> MobileEntry: Valid Email Format
    MobileEntry --> ReviewSummary: 10-Digit Mobile Number
    ReviewSummary --> SendOTP: Candidate Confirms ("हो")
    SendOTP --> VerifyOTP: OTP Dispatched
    VerifyOTP --> [*]: Profile Created (Redirect to /Candidate/Primary)
```

---

## 4. Multilingual Matrix

| Dimension | Marathi (`mr`) | English (`en`) | Hindi (`hi`) | Roman Marathi (`mr-Latn`) |
|-----------|----------------|----------------|--------------|---------------------------|
| **Detection Mechanism** | Unicode range `[\u0900-\u097F]` + Marathi stopwords (`आहे`, `कसा`, `दाखवा`) | ASCII regex + English dictionary tokens | Hindi stopwords (`है`, `करना`, `दिखाइए`) | Transliteration lexicon (`karaycha`, `dakhav`, `aahe`) |
| **STT Engine** | Web Speech API `mr-IN` with Marathi voice hints | Web Speech API `en-IN` | Web Speech API `hi-IN` | Web Speech API `mr-IN` / `en-IN` dual pass |
| **System Prompt** | Official MSBSVET Marathi prompt emphasizing procedural clarity | Professional English guidance prompt | Formal Hindi guidance prompt | Marathi system prompt with phonetic transliteration |
| **TTS Engine** | **Somya IndicTTS GGUF** (Port 8006) | **Google Indic TTS** (`lang="en", tld="co.in"`) | **Google Indic TTS** (`lang="hi", tld="co.in"`) | Somya IndicTTS GGUF (Devanagari normalized) |
| **Audio Spec** | 24,000 Hz, 16-bit Mono WAV | 24,000 Hz Mono MP3 / WAV | 24,000 Hz Mono MP3 / WAV | 24,000 Hz, 16-bit Mono WAV |
| **Fallback Policy** | `allow_fallback=False` (Strict authentic Somya voice) | `allow_fallback=True` | `allow_fallback=True` | `allow_fallback=False` |

---

## 5. Candidate Profile Steps (All 10 Official Forms)

| Step # | Route | Title (Marathi / English) | Key Fields | Validation Rules | Sample Chatbot Guidance Prompt |
|:------:|-------|---------------------------|------------|------------------|--------------------------------|
| **1** | `/Candidate/Primary` | वैयक्तिक प्राथमिक माहिती<br>(Primary Details) | First Name, Father/Husband Name, Mother Name, Gender, DOB | Names in English + Marathi; Aadhaar 12-digits verified | *"पायरी १: आपली वैयक्तिक माहिती भरा. आधार कार्डानुसार अचूक नाव लिहा."* |
| **2** | `/Candidate/Address` | पत्ता तपशील<br>(Address Details) | Address Line 1/2, State, District, Taluka, Pin Code | 6-digit valid Maharashtra PIN code; Taluka from District | *"पायरी २: आपला कायमस्वरूपी व पत्रव्यवहाराचा पत्ता, जिल्हा आणि पिनकोड भरा."* |
| **3** | `/Candidate/Parent` | पालक तपशील<br>(Parent/Guardian Details) | Guardian Name, Relationship, Occupation, Annual Income | Income numeric; Valid relationship selector | *"पायरी ३: पालकांचे संपूर्ण नाव, व्यवसाय आणि वार्षिक उत्पन्न नोंदवा."* |
| **4** | `/Candidate/Category` | जात व प्रवर्ग माहिती<br>(Category & Reservation) | Social Category, Caste, Validity Number, Disability | Certificate upload mandatory if reserved category selected | *"पायरी ४: आपला प्रवर्ग (SC/ST/OBC/Open) निवडा व जात प्रमाणपत्र तपशील द्या."* |
| **5** | `/Candidate/Qualification` | शैक्षणिक पात्रता<br>(Educational Qualification) | Exam Passed (SSC/HSC), Board, Passing Year, Percentage | Percentage between 35% and 100%; Passing year ≤ current year | *"पायरी ५: १० वी किंवा १२ वीचे गुण, बोर्ड आणि उत्तीर्ण वर्ष नोंदवा."* |
| **6** | `/Candidate/Training` | पूर्वीचे प्रशिक्षण<br>(Previous Training) | Prior Vocational Course, Institute Name, Year, Duration | Valid institute name if prior training selected | *"पायरी ६: आपण यापूर्वी कोणते व्यावसायिक प्रशिक्षण घेतले असल्यास त्याची नोंद करा."* |
| **7** | `/Candidate/Additional` | अतिरिक्त माहिती<br>(Additional Details) | Mother Tongue, Minority Status, Orphan Status, Sports | Binary switches; Valid certificate if sports/minority | *"पायरी ७: आपली मातृभाषा, अल्पसंख्याक किंवा क्रीडा संवर्गाची माहिती द्या."* |
| **8** | `/Candidate/Bank` | बँक खाते तपशील<br>(Bank Account Details) | Bank Name, Branch, Account Number, IFSC Code | IFSC code 11 chars `^[A-Z]{4}0[A-Z0-9]{6}$`; Re-enter account match | *"पायरी ८: शिष्यवृत्तीसाठी आपले बँक खाते क्रमांक आणि IFSC कोड अचूक भरा."* |
| **9** | `/Candidate/WorkExperience` | कामाचा अनुभव<br>(Work Experience) | Employer Name, Designation, Total Years, Monthly Salary | Dates chronological; Salary numeric | *"पायरी ९: कामाचा अनुभव असल्यास कंपनीचे नाव, पद आणि कालावधी नोंदवा."* |
| **10** | `/Candidate/LockApplicationForm` | अर्ज लॉक करणे<br>(Lock Application Form) | Declaration Checkbox, Undertaking, Final OTP | All prior 9 steps must be 100% complete; Irreversible action | *"पायरी १०: सर्व माहिती तपासून अर्ज लॉक करा. एकदा लॉक केल्यावर बदल करता येणार नाही."* |

---

## 6. Automated Regression Test Results

### 6.1 Test Execution Summary

| Test Suite File | Framework / Runner | Total Tests | Passed | Failed | Status |
|-----------------|--------------------|:-----------:|:------:|:------:|:------:|
| `test_master_implementation.py` | Python `unittest` | 5 | 5 | 0 | **100% PASS** |
| `test_registration_loop_and_registry.mjs` | Node.js | 31 | 31 | 0 | **100% PASS** |
| `test_e2e_full_integration.py` | Python / Requests / Wave | 24 | 24 | 0 | **100% PASS** |
| `test_regression_comprehensive.mjs` | Node.js Assertions | 93 | 93 | 0 | **100% PASS** |
| `test_candidate_conversation_flow.mjs` | Node.js State Machine | 27 | 27 | 0 | **100% PASS** |
| **TOTAL** | | **180** | **180** | **0** | **100% PASS** |

### 6.2 Key Verification Benchmarks
1. **RAG Output Hygiene**:
   - Query: *"उमेदवार नवीन नोंदणी कशी करावी?"*
   - Output: 450 characters of structured Marathi procedural text. Zero dashed lines (`----`), zero isolated headings.
2. **Registration Loop Fix**:
   - Steps traversed: `itiRegistered` -> `firstName` -> `middleName` -> `lastName` -> `dob` -> `gender` -> `email` -> `primaryMobile` -> `review`.
   - Result: Gender transitions cleanly to Email and Mobile; no loop back to Mobile.
3. **Multilingual Voice Routing**:
   - Marathi: Routed to `somya-indictts-gguf` (106,100 bytes, 24kHz Mono WAV).
   - English: Routed to `google-en-indic` (50,496 bytes, MP3).
4. **OCR Gateway Document Verification**:
   - Input: Synthetic PDF with Registration Number `HINGOLI/0000052/2022`.
   - Result: HTTP 200 `{"verified": true, "message": "VERIFIED"}` via ASP.NET Core gateway.
5. **Production Build Status**:
   - Frontend Vite Production Bundle: `npm run build` succeeded in 3m 19s (dist folder free of hardcoded localhost URLs).
   - ASP.NET Core Release Build: `dotnet build -c Release` succeeded (0 Errors, 38 Warnings).

---

## 7. Cleanup Log and Asset Retention

| Asset / Path | Action | Rationale |
|--------------|:------:|-----------|
| `scratch_tts.mp3` | **DELETED** | Obsolete 22-byte dummy scratch file from early pipeline testing. |
| `Reference/MSBSVET_CHATBOT-main/backend/chroma_db/` | **RETAINED** | Contains 1,304 vector embeddings (3,072-dim) for portal knowledge retrieval. |
| `%USERPROFILE%\.cache\huggingface\hub\models--mradermacher--Somya-IndicTTS-GGUF\` | **RETAINED** | Somya Q4_K_M GGUF model weights (1.68 GB) powering authentic Marathi neural TTS. |
| `%USERPROFILE%\.cache\huggingface\hub\models--hubertsiuzdak--snac_24khz\` | **RETAINED** | SNAC neural audio codec weights (24kHz PyTorch decoder). |
| `%USERPROFILE%\.paddleocr\` | **RETAINED** | PP-OCRv4 detection and recognition model weights. |
| `test_master_implementation.py` | **RETAINED** | Automated CI/CD regression test suite for master implementation features. |
| `test_registration_loop_and_registry.mjs` | **RETAINED** | Automated unit tests for 10-step profile form registry and state transitions. |

---

## 8. Operational Runbook

### 8.1 Startup Sequence

Run each command in its designated terminal:

```powershell
# Step 1: Start OCR Microservice (Port 8000)
cd "D:\MABSVET-Integration\OCR\backend"
& ".\venv\Scripts\python.exe" ocr_backend.py

# Step 2: Start Somya TTS Server (Port 8006 + Port 8008 llama-server)
cd "D:\MABSVET-Integration\tts-lab"
& ".\.venv\Scripts\python.exe" server.py

# Step 3: Start Chatbot Microservice (Port 8005)
cd "D:\MABSVET-Integration\Reference\MSBSVET_CHATBOT-main\backend"
& ".\venv\Scripts\python.exe" -m uvicorn app.main:app --host 0.0.0.0 --port 8005

# Step 4: Start ASP.NET Core Gateway Backend (Port 5279)
cd "D:\MABSVET-Integration\OCR\MSBSVET\msbsvet backend\Portal.Server"
dotnet run

# Step 5: Start React Frontend (Port 5173)
cd "D:\MABSVET-Integration\OCR\MSBSVET\msbsvet frontend\Test_MSBSVET"
npm run dev
```

### 8.2 Health Check Endpoints

| Service | Health Check URL | Expected Response |
|---------|------------------|-------------------|
| Frontend | `http://127.0.0.1:5173/` | HTTP 200 (HTML page) |
| Gateway | `http://127.0.0.1:5279/api/chatbot/health` | HTTP 200 `{"status": "healthy"}` |
| Chatbot | `http://127.0.0.1:8005/api/health` | HTTP 200 `{"chroma_documents": 1304}` |
| Somya TTS | `http://127.0.0.1:8006/health` | HTTP 200 `{"engines": {"somya": {"available": true}}}` |
| OCR | `http://127.0.0.1:8000/health` | HTTP 200 `{"ocr_engine": "PaddleOCR"}` |

### 8.3 Environment Variables Reference

- `GEMINI_API_KEY`: API key for Google Gemini LLM (`gemini-2.5-flash-lite`).
- `DEFAULT_TTS_ENGINE`: Set to `somya` for authentic Marathi voice enforcement.
- `ALLOW_TTS_FALLBACK`: Set to `false` for Marathi, `true` for English/Hindi.
- `VITE_AI_BACKEND_URL`: Set to `/api` for production deployment behind reverse proxy.

---

## 9. Known Limitations and Recommendations

1. **Gemini API Rate Limiting**: The free-tier Gemini API key occasionally experiences 429 quota exhaustion during high concurrency. The fallback procedural generator in `chat_service.py` provides clean answers without crashing, but for high-volume production, an enterprise Google Cloud API tier or self-hosted local LLM is recommended.
2. **GPU VRAM Allocation**: On systems with 4 GB VRAM (e.g., RTX 3050 Laptop), `llama-server.exe` operates on Vulkan GPU and SNAC PyTorch operates on CUDA. This leaves ~1.2 GB free VRAM. If larger batch sizes or higher concurrent TTS streams are required, upgrading to a 8GB+ GPU is recommended.
3. **Pillow Dependency in Chatbot Venv**: `Reference/MSBSVET_CHATBOT-main/backend/venv` has an incompatible C-extension build for `PIL._imaging`. While the chatbot itself does not use Pillow (OCR handles document imaging in `OCR/backend/venv`), running scripts that import PIL from the chatbot venv will fail. We recommend running all OCR-related tooling exclusively with `OCR/backend/venv/Scripts/python.exe`.
