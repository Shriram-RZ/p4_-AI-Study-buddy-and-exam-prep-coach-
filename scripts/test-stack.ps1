# Verify Docker stack: backend health, frontend home, auth signup smoke test.
$ErrorActionPreference = "Stop"

function Wait-Url {
    param([string]$Url, [int]$MaxSeconds = 120)
    $deadline = (Get-Date).AddSeconds($MaxSeconds)
    while ((Get-Date) -lt $deadline) {
        try {
            $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
            if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500) { return $r }
        } catch { Start-Sleep -Seconds 3 }
    }
    throw "Timed out waiting for $Url"
}

Write-Host "==> Waiting for backend /health ..."
$health = Wait-Url "http://localhost:8000/health"
Write-Host "    OK: $($health.Content)"

Write-Host "==> Waiting for frontend / ..."
$home = Wait-Url "http://localhost:3000/"
Write-Host "    OK: HTTP $($home.StatusCode)"

Write-Host "==> Auth signup smoke test ..."
$email = "docker-test-{0}@example.com" -f ([guid]::NewGuid().ToString("N").Substring(0, 8))
$body = @{
    email    = $email
    password = "TestPass123!"
    name     = "Docker Test"
} | ConvertTo-Json
try {
    $signup = Invoke-WebRequest `
        -Uri "http://localhost:8000/api/auth/signup" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -UseBasicParsing `
        -TimeoutSec 30
    Write-Host "    OK: signup HTTP $($signup.StatusCode) for $email"
} catch {
    $detail = $_.Exception.Message
    if ($_.ErrorDetails.Message) { $detail = $_.ErrorDetails.Message }
    throw "Signup failed: $detail"
}

Write-Host ""
Write-Host "All stack checks passed."
Write-Host "  Frontend: http://localhost:3000"
Write-Host "  Backend:  http://localhost:8000  (docs: /docs)"
