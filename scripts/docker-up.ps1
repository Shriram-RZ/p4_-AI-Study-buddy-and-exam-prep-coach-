# One-command Docker setup: build and start postgres, backend, and frontend.
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "==> Building and starting all services (postgres, backend, frontend) ..."
docker compose up --build -d

Write-Host "==> Waiting for containers to become healthy ..."
docker compose ps

& "$PSScriptRoot\test-stack.ps1"
