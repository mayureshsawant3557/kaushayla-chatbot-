# =====================================================================
# MSBSVET KAUSHALYA AI — MASTER AUTOMATED TEST RUNNER
# Dynamic Workspace Root
# =====================================================================

$ErrorActionPreference = "Continue"
$ws = Split-Path -Parent $PSScriptRoot
Set-Location $ws

$env:NO_PROXY = "*"
$env:HTTP_PROXY = ""
$env:HTTPS_PROXY = ""

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "   MSBSVET KAUSHALYA AI — CONSOLIDATED REGRESSION TEST SUITE    " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

$totalPassed = 0
$totalFailed = 0

function Run-Step($name, $command) {
    Write-Host ">>> Running: $name" -ForegroundColor Yellow
    Invoke-Expression $command
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [SUITE PASS] $name`n" -ForegroundColor Green
    } else {
        Write-Host "  [SUITE FAIL] $name (exit code: $LASTEXITCODE)`n" -ForegroundColor Red
        $script:totalFailed++
    }
}

# --- 1. UNIT & STATE MACHINE TESTS ---
Write-Host "--- 1. UNIT & STATE MACHINE SUITES (155 TESTS) ---" -ForegroundColor Magenta
Run-Step "Registration Loop & Form Registry (31 Tests)" "node tests/unit/test_registration_loop_and_registry.mjs"
Run-Step "Conversational Candidate Flow (27 Tests)" "node tests/unit/test_candidate_conversation_flow.mjs"
Run-Step "Candidate Name Parsing Suite" "node tests/unit/test_name_parser.mjs"
Run-Step "Comprehensive Audio & State Machine Regression (93 Tests)" "node tests/unit/test_regression_comprehensive.mjs"
Run-Step "PaddleOCR Microservice Unit Suite (4 Tests)" "& 'services/ocr/venv/Scripts/python.exe' -m pytest tests/unit/test_api.py -v"

# --- 2. INTEGRATION SUITES ---
Write-Host "--- 2. INTEGRATION & LANGUAGE ROUTING SUITES ---" -ForegroundColor Magenta
Run-Step "TTS Language Routing & Remote Auth (5 Tests)" "& 'services/chatbot/venv/Scripts/python.exe' tests/integration/test_language_routing_and_auth.py"
Run-Step "Master Multi-Service Integration Suite (5 Tests)" "& 'services/chatbot/venv/Scripts/python.exe' tests/integration/test_master_implementation.py"
Run-Step "Speech Input Coordinator Suite (11 Tests)" "node tests/integration/test_integration_speech_input.mjs"
Run-Step "Direct Chatbot Core Regression Suite (8 Tests)" "& 'services/chatbot/venv/Scripts/python.exe' tests/integration/test_integration_chatbot_core.py"

# --- 3. END-TO-END SUITES ---
Write-Host "--- 3. END-TO-END GATEWAY INTEGRATION SUITES ---" -ForegroundColor Magenta
Run-Step "Full E2E 8-Stage Architecture Suite (24 Tests)" "python tests/e2e/test_e2e_full_integration.py"

Write-Host "=================================================================" -ForegroundColor Cyan
if ($totalFailed -eq 0) {
    Write-Host "  ALL TEST SUITES PASSED SUCCESSFULLY (100% PASS RATE)!" -ForegroundColor Green
} else {
    Write-Host "  COMPLETED WITH $totalFailed FAILED SUITE(S)." -ForegroundColor Red
}
Write-Host "=================================================================" -ForegroundColor Cyan
