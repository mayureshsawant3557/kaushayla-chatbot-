# =====================================================================
# MSBSVET KAUSHALYA AI — STOP ALL MICROSERVICES
# Dynamic Workspace Root
# =====================================================================

Write-Host "Stopping MSBSVET Kaushalya AI Microservices..." -ForegroundColor Yellow

# Ports: 8000 (OCR), 8005 (Chatbot), 8006 (TTS), 8008 (Somya llama-server), 5279 (Gateway)
$ports = @(8000, 8005, 8006, 8008, 5279)

foreach ($port in $ports) {
    $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conns) {
        $pids = $conns.OwningProcess | Select-Object -Unique
        foreach ($p in $pids) {
            try {
                Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
                Write-Host "  Terminated process $p listening on port $port" -ForegroundColor Green
            } catch {
                Write-Host "  Could not stop process $p on port $port" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "  Port $port is clear" -ForegroundColor Gray
    }
}

Write-Host "All MSBSVET microservices stopped." -ForegroundColor Cyan
