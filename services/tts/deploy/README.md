# MSBSVET Somya IndicTTS Dedicated GPU Host Deployment Guide

This package contains the deployment configuration for hosting the **Somya IndicTTS** voice inference engine on a dedicated GPU compute instance, decoupling heavy neural speech synthesis from the CPU-only main application server.

---

## 1. Hardware & System Requirements

| Resource | Minimum Specification | Recommended Production |
|---|---|---|
| **CPU** | 4 vCPU (x86_64) | 8 vCPU |
| **RAM** | 8 GB System Memory | 16 GB System Memory |
| **GPU / Accelerator** | 1x NVIDIA GPU (4 GB VRAM) | 1x NVIDIA T4 / RTX A2000 / L4 (8–16 GB VRAM) |
| **Disk Space** | 20 GB SSD | 50 GB NVMe SSD |
| **Operating System** | Ubuntu 22.04 LTS / Debian 12 / Windows Server 2022 | Ubuntu 22.04 LTS (Headless) |
| **Driver / Runtime** | NVIDIA Driver >= 535, CUDA 12.x or Vulkan SDK | NVIDIA Driver 550+, CUDA 12.4 |

### Measured Empirical VRAM Requirements
- **Somya-IndicTTS.Q4_K_M.gguf Weights:** 2,254 MB (2.25 GB)
- **KV Cache (1024 context window):** ~180 MB
- **SNAC 24kHz Decoder VRAM:** ~150–250 MB
- **Total Peak Active VRAM:** **~2.6 GB VRAM**
- A 4GB VRAM GPU is sufficient in headless mode; an 8GB+ GPU allows sustained concurrency without VRAM paging.

---

## 2. Deployment Steps (Ubuntu 22.04 LTS with GPU)

### Step 1: Install System Dependencies & NVIDIA Drivers
```bash
sudo apt-get update && sudo apt-get install -y \
    curl git build-essential python3-dev python3-venv libsndfile1 ffmpeg

# Verify NVIDIA Driver
nvidia-smi
```

### Step 2: Download `llama-server` with CUDA Support
```bash
mkdir -p /opt/msbsvet-tts/bin /opt/msbsvet-tts/models
cd /opt/msbsvet-tts/bin

# Download pre-built llama.cpp release with CUDA
# (e.g. from https://github.com/ggerganov/llama.cpp/releases)
curl -L -o llama-server.tar.gz https://github.com/ggerganov/llama.cpp/releases/download/b3900/llama-b3900-bin-ubuntu-x64.tar.gz
tar -xzf llama-server.tar.gz
chmod +x llama-server
```

### Step 3: Copy Somya-IndicTTS Model & Code
```bash
# Copy files from repository tts-lab/ to /opt/msbsvet-tts/
cp /path/to/tts-lab/*.py /opt/msbsvet-tts/
cp /path/to/models/Somya-IndicTTS.Q4_K_M.gguf /opt/msbsvet-tts/models/
```

### Step 4: Create Python Virtual Environment
```bash
cd /opt/msbsvet-tts
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r deploy/requirements-tts-host.txt
```

### Step 5: Configure Environment & Pre-Shared Secret
```bash
cp deploy/.env.example /opt/msbsvet-tts/.env
# Edit .env and configure SOMYA_TTS_API_KEY with a strong 32+ character random string
chmod 600 /opt/msbsvet-tts/.env
```

### Step 6: Install and Start Systemd Service
```bash
sudo cp deploy/msbsvet-tts.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable msbsvet-tts
sudo systemctl start msbsvet-tts
sudo systemctl status msbsvet-tts
```

---

## 3. Connecting Main Application Server to the Remote TTS Host

On the **Main CPU Application Server**, configure the environment variables in the FastAPI chatbot `.env` (or systemd / container environment):

```bash
# Internal address of the dedicated TTS host (VPC IP or internal DNS)
SOMYA_TTS_BASE_URL=https://tts.internal.msbsvet.gov.in:8006
# Or private VPC IP:
# SOMYA_TTS_BASE_URL=http://10.0.1.25:8006

# The exact matching pre-shared API key configured on the TTS host
SOMYA_TTS_API_KEY=your_configured_strong_internal_token_32chars

# Timeouts
TTS_CONNECT_TIMEOUT_SEC=3.5
TTS_READ_TIMEOUT_SEC=30.0
```

---

## 4. Security & Ingress Rules
1. **Never expose port 8006 or 8008 to the public internet.**
2. Set security group / firewall rules on the TTS host to **allow ingress on port 8006 ONLY from the IP address of the Main Application Server**.
3. All requests must carry the `X-TTS-Api-Key` header matching `SOMYA_TTS_API_KEY`.
4. If traversing external networks, put an Nginx / Caddy reverse proxy with valid TLS in front of port 8006 for HTTPS transport encryption.

