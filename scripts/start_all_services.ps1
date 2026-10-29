# =====================================================================
# MSBSVET KAUSHALYA AI — START ALL CONSOLIDATED MICROSERVICES
# Dynamic Workspace Root
# =====================================================================

$ws = Split-Path -Parent $PSScriptRoot
Write-Host "Starting MSBSVET Kaushalya AI Microservices..." -ForegroundColor Cyan

# 1. OCR Microservice (Port 8000)
Write-Host "Starting OCR Microservice on port 8000..." -ForegroundColor Yellow
Start-Process -FilePath "$ws\services\ocr\venv\Scripts\python.exe" `
    -ArgumentList "ocr_backend.py" `
    -WorkingDirectory "$ws\services\ocr" `
    -WindowStyle Hidden

# 2. Somya IndicTTS Neural Service (Port 8006)
Write-Host "Starting Somya IndicTTS Service on port 8006..." -ForegroundColor Yellow
Start-Process -FilePath "$ws\services\tts\.venv\Scripts\python.exe" `
    -ArgumentList "server.py" `
    -WorkingDirectory "$ws\services\tts" `
    -WindowStyle Hidden

# 3. FastAPI Chatbot & RAG Microservice (Port 8005)
Write-Host "Starting FastAPI Chatbot on port 8005..." -ForegroundColor Yellow
Start-Process -FilePath "$ws\services\chatbot\venv\Scripts\python.exe" `
    -ArgumentList "-m uvicorn app.main:app --host 127.0.0.1 --port 8005" `
    -WorkingDirectory "$ws\services\chatbot" `
    -WindowStyle Hidden

# 4. ASP.NET Core Gateway (Port 5279)
Write-Host "Starting ASP.NET Core Gateway on port 5279..." -ForegroundColor Yellow
Start-Process -FilePath "dotnet" `
    -ArgumentList "run --project `"$ws\apps\portal-backend\Portal.Server\Portal.Server.csproj`" --launch-profile http --no-build" `
    -WorkingDirectory "$ws\apps\portal-backend\Portal.Server" `
    -WindowStyle Hidden

Write-Host "All 4 microservices launched successfully!" -ForegroundColor Green
Write-Host "  - OCR:      http://127.0.0.1:8000/health"
Write-Host "  - TTS:      http://127.0.0.1:8006/health"
Write-Host "  - Chatbot:  http://127.0.0.1:8005/api/health"
Write-Host "  - Gateway:  http://127.0.0.1:5279/api/chat"
