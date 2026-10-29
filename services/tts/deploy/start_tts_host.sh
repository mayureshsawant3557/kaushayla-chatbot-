#!/usr/bin/env bash
set -euo pipefail

echo "=========================================================="
echo "Starting MSBSVET Somya IndicTTS GPU Inference Service"
echo "=========================================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

if [ -f "deploy/.env" ]; then
    echo "Loading configuration from deploy/.env..."
    set -a
    source "deploy/.env"
    set +a
elif [ -f ".env" ]; then
    echo "Loading configuration from .env..."
    set -a
    source ".env"
    set +a
fi

PORT="${TTS_PORT:-8006}"
HOST="${TTS_HOST:-0.0.0.0}"

# Check GPU availability
if command -v nvidia-smi &> /dev/null; then
    echo "NVIDIA GPU Detected:"
    nvidia-smi --query-gpu=name,memory.total,memory.free --format=csv,noheader
else
    echo "WARNING: nvidia-smi not found. Checking Vulkan/OpenCL..."
fi

VENV_PYTHON="${VENV_PYTHON:-python3}"
if [ -d ".venv" ]; then
    VENV_PYTHON=".venv/bin/python"
elif [ -d "venv" ]; then
    VENV_PYTHON="venv/bin/python"
fi

echo "Running Somya TTS Server on ${HOST}:${PORT}..."
exec "$VENV_PYTHON" server.py

