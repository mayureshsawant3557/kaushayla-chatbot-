# MSBSVET KAUSHALYA AI — REMOTE SOMYA TTS ARCHITECTURE & PRODUCTION READINESS REPORT

**Workspace Root:** `D:\MABSVET-Integration`  
**Date & Timestamp:** 2026-10-29T13:10:00+05:30  
**Implementation Focus:** Decoupled Remote Somya IndicTTS for GPU-less Main Application Server  
**Current State:** Code implementation, language routing, pre-shared key security, bounded timeouts, sentence chunking, deployment packaging, and local integration tests **COMPLETE & VERIFIED (184/184 Standard Tests Passing + 5/5 Language Routing Tests Passing)**. Dedicated remote GPU cloud host provisioning **PENDING CLOUD CREDENTIALS**.

---

## 1. Actual Code Files Modified & Purpose

In adherence to the Ponytail senior dev philosophy (minimal changes, maximal impact, zero code bloat), modifications were strictly restricted to the configuration, routing, and deployment boundaries:

| File Path | Nature | Purpose |
|---|---|---|
| `Reference/MSBSVET_CHATBOT-main/backend/app/core/config.py` | Modified | Added `SOMYA_TTS_BASE_URL`, `SOMYA_TTS_API_KEY`, `TTS_CONNECT_TIMEOUT_SEC` (3.5s), and `TTS_READ_TIMEOUT_SEC` (30.0s). Implemented `effective_tts_url` property with precedence fallback (`SOMYA_TTS_BASE_URL` -> `TTS_SERVER_URL` -> `http://127.0.0.1:8006`), trailing slash sanitization, and URL scheme normalization. |
| `Reference/MSBSVET_CHATBOT-main/backend/app/api/tts.py` | Modified | 1. Enforced authoritative language-specific voice routing (Marathi -> Somya GGUF, English -> Google Indic English, Hindi -> Google Indic Hindi).<br>2. Fixed cache lookup keying and header metadata propagation.<br>3. Implemented dynamic `get_tts_service_config()` helper.<br>4. Added bounded connect/read timeouts `(connect_to, read_to)`.<br>5. Added upstream `X-TTS-Api-Key` authorization headers.<br>6. Implemented diagnosable HTTP 503 error propagation on host failure.<br>7. Added `/api/tts/chunks` endpoint for long-response sentence chunking.<br>8. Enriched `/api/tts/status` health monitoring. |
| `tts-lab/server.py` | Modified | Added optional pre-shared `X-TTS-Api-Key` authentication validation in `/synthesize` (HTTP 401 on unauthorized access). Enriched `/health` endpoint to advertise `"auth_enabled"` status while preserving backwards-compatible unauthenticated access for local development. |
| `test_language_routing_and_auth.py` | Added | Automated verification suite validating Marathi (24kHz Mono WAV via Somya GGUF), English (MP3 via Google Indic), Hindi (MP3 via Google Indic), sentence chunking, and ASP.NET Core gateway audio proxying. |
| `tts-lab/deploy/requirements-tts-host.txt` | Added | Self-contained Python dependencies file for standalone deployment on the dedicated GPU host. |
| `tts-lab/deploy/.env.example` | Added | Production configuration template specifying port, host, pre-shared API key, GPU offload layers, and model paths. |
| `tts-lab/deploy/msbsvet-tts.service` | Added | Production Linux systemd service unit with auto-restart, memory limits (8GB), and journald logging. |
| `tts-lab/deploy/start_tts_host.sh` | Added | Standalone execution and health-check script for the dedicated GPU instance. |
| `tts-lab/deploy/README.md` | Added | Complete engineering runbook for provisioning Ubuntu 22.04 LTS / Windows Server with GPU for Somya IndicTTS. |

---

## 2. Configurable Local vs. Remote TTS Routing Design

### 2.1 The Request Flow
```
[Client Browser]
       │
       ▼ (Public HTTPS :443)
[Main Production Server (CPU-Only)]
   ├─ React/Vite Frontend (Static Bundle in dist/)
   ├─ ASP.NET Core Gateway (:5279)
   │     └─ Proxies /api/chat and /api/tts to internal FastAPI
   ├─ FastAPI Chatbot & RAG (:8005)
   │     ├─ Hosted Google Gemini API (Chat & Embeddings)
   │     ├─ Local ChromaDB (1,304 Chunks)
   │     └─ Dynamic TTS Router (tts.py)
   │           ├─ Language: 'mr' ──► Dedicated Remote Somya GPU Host (:8006)
   │           ├─ Language: 'en' ──► Google Indic English TTS (MP3)
   │           └─ Language: 'hi' ──► Google Indic Hindi TTS (MP3)
   └─ PaddleOCR Microservice (:8000, CPU-only)
       │
       ▼ (Private Internal VPC / HTTPS + X-TTS-Api-Key)
[Dedicated Remote TTS Compute Host (GPU)]
   ├─ Somya Unified Server (:8006)
   └─ llama-server.exe / Vulkan / CUDA (:8008)
         ├─ Somya-IndicTTS.Q4_K_M.gguf (Offloaded to VRAM)
         └─ SNAC 24kHz Decoder (PyTorch)
```

### 2.2 Security & Isolation Principles
1. **Zero Browser Exposure:** The remote GPU TTS host is **never exposed directly to public client traffic**. The browser speaks only to the main application server (`:5279` / `:443`).
2. **No Hardcoded Secrets or IPs:** No production IP addresses, hostnames, or API tokens exist in frontend code or git-tracked source files.
3. **Environment-Driven Routing:**
   - **Local Development:** When `SOMYA_TTS_BASE_URL` is empty, the application seamlessly defaults to `http://127.0.0.1:8006`.
   - **Production:** Setting `SOMYA_TTS_BASE_URL=https://tts.internal.msbsvet.gov.in:8006` immediately routes all synthesis requests to the private GPU host without rebuilding or touching code.
4. **Pre-Shared Key Authentication:** If `SOMYA_TTS_API_KEY` is set, every outbound request from FastAPI sends `X-TTS-Api-Key`. The TTS host validates this header, rejecting unauthorized requests with HTTP 401.

---

## 3. Verified Language-Specific Voice Routing

### 3.1 Routing Specification & Verification Matrix

Every synthesis request is authoritatively resolved to the correct engine based on detected language, preventing accidental cross-language corruption:

| Language | Engine Identifier | Upstream Provider | Audio Format | Verified Output Headers & Characteristics |
|---|---|---|---|---|
| **Marathi (`mr`)** | `somya-indictts-gguf` | Dedicated Somya Host (`/synthesize`) | **24kHz, 1ch (Mono), 16-bit PCM WAV** | `X-TTS-Engine: somya-indictts-gguf`<br>`X-TTS-Provider: somya`<br>`X-TTS-Audio-Spec: 24kHz-mono-wav`<br>`Content-Type: audio/wav` |
| **English (`en`)** | `google-en-indic` | Google Indic English (`gTTS`, `en`, `tld=co.in`) | **MP3 Stream (Indian English accent)** | `X-TTS-Engine: google-en-indic`<br>`X-TTS-Provider: google-indic-en`<br>`X-TTS-Model: gTTS-en-IN`<br>`Content-Type: audio/mpeg` |
| **Hindi (`hi`)** | `google-hi-indic` | Google Indic Hindi (`gTTS`, `hi`, `tld=co.in`) | **MP3 Stream (Hindi phonology)** | `X-TTS-Engine: google-hi-indic`<br>`X-TTS-Provider: google-indic-hi`<br>`X-TTS-Model: gTTS-hi-IN`<br>`Content-Type: audio/mpeg` |

### 3.2 Root Cause Analysis of Previous Discrepancy & Resolution

In earlier testing, Hindi synthesis occasionally fell through to Somya or returned `somya` in headers:
- **Root Cause 1 (Default Engine Parameter):** The Pydantic request model `TTSRequest` defaulted `engine` to `"somya"` via `settings.DEFAULT_TTS_ENGINE`. When a Hindi request arrived without an explicit engine flag, an earlier conditional `if tts_lang == "hi" and engine != "somya":` evaluated to `False` because `engine == "somya"`.
- **Root Cause 2 (Cache Keying & Headers):** On cache hit, the response returned `headers["X-TTS-Engine"] = engine` (which was `"somya"`) rather than the actual synthesized audio format.
- **The Fix:**
  1. In `app/api/tts.py`, engine resolution was strictly tied to language *prior* to cache lookup:
     ```python
     if tts_lang == "en":
         engine = "google-en-indic"
     elif tts_lang == "hi":
         engine = "google-hi-indic"
     else:
         engine = (req.engine or getattr(settings, "DEFAULT_TTS_ENGINE", "somya")).lower()
     ```
  2. Cache returns now reflect the authoritative engine (`somya-indictts-gguf`, `google-en-indic`, `google-hi-indic`) with matching MIME types (`audio/wav` vs `audio/mpeg`).
  3. Verified via `test_language_routing_and_auth.py` with 100% pass across all 3 languages.

---

## 4. Bounded Timeout & Sentence Chunking Strategy for Long Responses

### 4.1 Bounded Timeout Architecture

To prevent thread exhaustion or reverse-proxy gateway drops during complex queries:

| Component | Timeout Configuration | Purpose |
|---|---|---|
| **Chatbot to TTS (Connect)** | `TTS_CONNECT_TIMEOUT_SEC = 3.5s` | Fails fast if the remote TTS host is unreachable or down. |
| **Chatbot to TTS (Read)** | `TTS_READ_TIMEOUT_SEC = 30.0s` | Bounds synthesis wait time for single-utterance audio generation. |
| **Sentence Chunk Synthesis** | `timeout = 25.0s` | Per-chunk synthesis deadline on `/api/tts/chunks`. |
| **ASP.NET Core Gateway Proxy** | `HttpClient.Timeout = 60.0s` | Accommodates multi-step proxy buffering without premature socket abort. |
| **Frontend Browser Watchdog** | `speechWatchdog = 40.0s` | Unfreezes UI audio state if an upstream network drop occurs. |

### 4.2 Sentence Chunking & Streaming Playback (`/api/tts/chunks`)

Long chatbot answers (e.g., 500+ character policy explanations) could previously cause multi-second synthesis delays.
1. **Sentence Boundary Chunking:** The `/api/tts/chunks` endpoint partitions long text at punctuation boundaries (`।`, `.`, `?`, `!`, `\n`) with a target limit of **140 characters per chunk**.
2. **Immediate First-Chunk Playback:** The client synthesizes Chunk 0 first. In GPU benchmark tests, Chunk 0 (short sentence) synthesizes in **0.02s–0.8s**, enabling the browser to begin speaking almost instantaneously.
3. **Pipelined Background Queuing:** Subsequent chunks (Chunk 1, Chunk 2...) are synthesized in parallel background threads and appended to the audio playback queue while Chunk 0 is actively playing.
4. **Resilience to CPU Fallback:** If Somya runs under high load, chunking guarantees that no individual synthesis request ever hits the 30-second timeout.

---

## 5. Pre-Shared Key Authentication & Host Security

### 5.1 Remote Authentication Flow
1. **Chatbot Gateway Request:** When `SOMYA_TTS_API_KEY` is configured on the Main CPU Server, `tts.py` attaches the header:
   ```http
   X-TTS-Api-Key: <SOMYA_TTS_API_KEY>
   ```
2. **Dedicated Host Verification (`tts-lab/server.py`):**
   ```python
   EXPECTED_API_KEY = os.environ.get("SOMYA_TTS_API_KEY", "").strip()
   if EXPECTED_API_KEY:
       provided_key = request.headers.get("X-TTS-Api-Key", "").strip()
       if not provided_key or provided_key != EXPECTED_API_KEY:
           raise HTTPException(status_code=401, detail="Unauthorized: Invalid or missing X-TTS-Api-Key")
   ```
3. **Local Dev Backward Compatibility:** If `SOMYA_TTS_API_KEY` is empty or unset, authentication is disabled and local requests pass without headers.
4. **Health Check Advertising:** `GET /health` reports `"auth_enabled": True/False` so the main server can verify auth alignment during startup.

---

## 6. Dedicated TTS Host Resource Requirements (Empirical Measurements)

Direct hardware profiling on the authentic Somya models and runtime produced the following resource boundaries:

| Resource | Measured Usage / Requirement | Recommended Allocation |
|---|---|---|
| **Somya GGUF Model Size** | **2,254.3 MB (2.25 GB)** on disk | Minimum 10 GB SSD for model weights & caches |
| **Active GPU VRAM (Weights)** | **~2,250 MB** offloaded to VRAM (`-ngl 99`) | Minimum 4 GB VRAM GPU |
| **Active GPU VRAM (KV Cache)** | **~180 MB** (1,024 context tokens) | Included in 4 GB |
| **SNAC 24kHz Decoder VRAM** | **~150–250 MB** during audio decoding | Included in 4 GB |
| **Total Peak Active VRAM** | **~2.6 GB VRAM** | **8 GB VRAM** (e.g. NVIDIA T4, RTX A2000, L4) to support multi-stream concurrency |
| **System RAM** | **880 MB** (Python process + SNAC) | 16 GB System Memory |
| **CPU Allocation** | Minimal (GPU offloaded) | 4 vCPU to 8 vCPU |

---

## 7. Production Deployment & Configuration Reference

### 7.1 Main CPU Application Server Environment (`.env`)
```bash
# =======================================================
# MSBSVET KAUSHALYA AI — MAIN SERVER CONFIGURATION
# =======================================================

# 1. Google Gemini API (Hosted LLM & Embeddings)
GEMINI_API_KEY=your_production_paid_gemini_api_key

# 2. Remote Somya TTS Routing
# Point to private internal DNS or VPC IP of the dedicated GPU host
SOMYA_TTS_BASE_URL=https://tts.internal.msbsvet.gov.in:8006
SOMYA_TTS_API_KEY=your_strong_32char_preshared_token_here

# 3. Timeouts (Bounded)
TTS_CONNECT_TIMEOUT_SEC=3.5
TTS_READ_TIMEOUT_SEC=30.0

# 4. PaddleOCR Microservice
OCR_SERVICE_URL=http://127.0.0.1:8000
```

### 7.2 Dedicated TTS Host Environment (`/opt/msbsvet-tts/.env`)
```bash
# =======================================================
# DEDICATED SOMYA TTS GPU HOST CONFIGURATION
# =======================================================
TTS_PORT=8006
TTS_HOST=0.0.0.0
SOMYA_TTS_API_KEY=your_strong_32char_preshared_token_here

# Paths
LLAMA_SERVER_PATH=/opt/msbsvet-tts/bin/llama-server
SOMYA_GGUF_PATH=/opt/msbsvet-tts/models/Somya-IndicTTS.Q4_K_M.gguf
SOMYA_PORT=8008

# Hardware Offload (Offloads ~2.25 GB model to GPU VRAM)
LLAMA_NGL=99
LLAMA_THREADS=8
```

---

## 8. Test Commands, Pass Outcomes & Reconciliation of Test Counts

### 8.1 Reconciled Test Breakdown (184 Total Standard Automated Tests)

The discrepancy between 184 and 193 in previous drafts is fully reconciled:
- **Standard Automated Regression Tests:** **184** (155 Unit Tests + 29 Integration Tests). All 184 run via standard test runners (`node`, `pytest`, `unittest`).
- **Ad-Hoc Performance Profiling Checks:** **12** (9 in `benchmark_cpu_ocr.py` + 3 in `benchmark_voice_pipeline.py`). An earlier report had informally added the 9 OCR benchmark assertions to 184 to get 193.
- **Dedicated Language Routing Tests:** **5** (in `test_language_routing_and_auth.py`).

| Category | Test Suite / Command | Total Tests | Pass | Fail | Description |
|---|---|---|---|---|---|
| **Unit** | `node test_registration_loop_and_registry.mjs` | **31** | 31 | 0 | Form Registry, 10-step sequence, gender-to-email progression, loop prevention. |
| **Unit** | `node test_candidate_conversation_flow.mjs` | **27** | 27 | 0 | 6-turn conversational onboarding simulation from ITI inquiry to final submission. |
| **Unit** | `node test_regression_comprehensive.mjs` | **93** | 93 | 0 | Name parsing, filler rejection, audio queue lifecycle, multi-intent routing, screen context. |
| **Unit** | `pytest OCR/backend/tests/test_api.py` | **4** | 4 | 0 | PaddleOCR FastAPI endpoints: health, missing file (422), unsupported file, empty file. |
| **Unit Subtotal** | *All Unit Tests* | **155** | **155** | **0** | **100% Pass Rate** |
| **Integration** | `python test_master_implementation.py` | **5** | 5 | 0 | Cross-service connectivity, RAG dash stripping, multilingual engine selection, screen context, profile RAG. |
| **Integration** | `python test_e2e_full_integration.py` | **24** | 24 | 0 | 8-stage end-to-end integration: FastAPI health, chat reply, Somya 24kHz WAV, .NET Chat Gateway, .NET TTS Gateway, dist bundle hygiene, and .NET PaddleOCR verification. |
| **Integration Subtotal** | *All Integration Tests* | **29** | **29** | **0** | **100% Pass Rate** |
| **GRAND TOTAL (Standard)** | | **184** | **184** | **0** | **100% Pass Rate (0 Failures)** |

### 8.2 Targeted Language Routing & Auth Verification (5 Tests)

Executed via:
```powershell
$env:NO_PROXY="*"; python test_language_routing_and_auth.py
```
- `test_01_marathi_routing_to_somya`: **PASS** (Somya IndicTTS: 24,000Hz, 1ch, 3.35s audio, 160,958 bytes WAV, header `X-TTS-Engine: somya-indictts-gguf`).
- `test_02_english_routing_to_google_indic`: **PASS** (Google Indic English: 41,280 bytes MP3, header `X-TTS-Engine: google-en-indic`).
- `test_03_hindi_routing_to_google_indic_hindi`: **PASS** (Google Indic Hindi: 44,352 bytes MP3, header `X-TTS-Engine: google-hi-indic`).
- `test_04_sentence_chunking_for_long_text`: **PASS** (3 sentence chunks generated; Chunk 0 synthesized in 0.02s).
- `test_05_gateway_proxy_routing`: **PASS** (73,186 bytes audio forwarded through ASP.NET Core Kestrel reverse proxy).

### 8.3 Build Verification
- **Vite Frontend Build (`npm run build`):** Succeeded in 1m 39s (15,184 modules transformed, 0 errors).
- **Bundle Audit:** Verified 100% clean of hardcoded development URLs (`localhost:8005`, `localhost:8006`).
- **ASP.NET Core Release Build (`dotnet build -c Release`):** Succeeded in 4.45s (0 Errors, 38 pre-existing warnings, target framework `net8.0`).

---

## 9. Tests That Could Not Run (Honest Gap Disclosure)

In strict accordance with audit truthfulness, the following tests **could not be run** and are documented as pending external infrastructure:

1. **Remote Cloud Latency Test (WAN):**  
   *Reason:* The dedicated remote GPU server instance has not yet been provisioned in the MSBSVET cloud account. All tests ran against the local GPU-backed service using the new configurable routing layer.
2. **Cross-VPC Firewall / mTLS Ingress Test:**  
   *Reason:* Requires the actual cloud network security group to be created.
3. **Live Production Candidate Application Submission:**  
   *Reason:* Prohibited by safety rules; testing was performed with synthetic candidate records and non-destructive API verification.
4. **Human Perceptual Listening Test:**  
   *Reason:* Audio bytes were verified programmatically (24kHz, mono 16-bit PCM, RIFF/WAV format, correct duration). Human audio verification should be performed during portal UAT.

---

## 10. Pre-Launch Deployment Runbook & Checklist

### Step 1: Provision Cloud GPU Instance
- OS: Ubuntu 22.04 LTS (x86_64)
- GPU: 1x NVIDIA T4 / L4 / RTX A2000 (minimum 4GB VRAM, recommended 8GB VRAM)
- RAM: 16 GB System Memory
- Storage: 30 GB SSD

### Step 2: Deploy Somya Service on GPU Host
1. Copy `tts-lab/` directory to `/opt/msbsvet-tts` on the remote host.
2. Configure `/opt/msbsvet-tts/.env` with strong `SOMYA_TTS_API_KEY`.
3. Install systemd service:
   ```bash
   sudo cp /opt/msbsvet-tts/deploy/msbsvet-tts.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable --now msbsvet-tts.service
   ```
4. Verify health locally on host:
   ```bash
   curl -s http://127.0.0.1:8006/health
   # Expected: {"status":"ok","engine":"Somya-IndicTTS","auth_enabled":true}
   ```

### Step 3: Configure Ingress Rules
- Restrict inbound TCP port 8006 on the GPU host security group strictly to the private IP address of the Main Application Server. Do NOT open port 8006 to the public internet.

### Step 4: Configure Main Application Server
Set environment variables in `Reference/MSBSVET_CHATBOT-main/backend/.env`:
```bash
SOMYA_TTS_BASE_URL=https://<GPU_HOST_PRIVATE_IP>:8006
SOMYA_TTS_API_KEY=<MATCHING_API_KEY>
GEMINI_API_KEY=<PAID_GEMINI_KEY>
```

### Step 5: Execute Sanity Smoke Test
Run on the Main Application Server:
```powershell
python test_language_routing_and_auth.py
```
Confirm all 5 tests return `OK`.
