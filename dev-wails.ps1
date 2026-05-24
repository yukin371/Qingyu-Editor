param(
    [switch]$SkipInstall,
    [switch]$SkipLocalAIService
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSCommandPath
$frontendDir = Join-Path $projectRoot "frontend"
$repoRoot = Split-Path -Parent $projectRoot
$localAIServiceRoot = Join-Path $repoRoot "Qingyu-Ai-Service"
$localAIServiceScript = Join-Path $localAIServiceRoot "scripts\start_local_service.ps1"
$localAIServiceHealthUrl = "http://127.0.0.1:8000/api/v1/health"

function Test-LocalPortListening {
    param(
        [Parameter(Mandatory = $true)]
        [int]$Port
    )

    return [bool](Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
}

function Test-LocalAIServiceHealthy {
    param(
        [Parameter(Mandatory = $true)]
        [string]$HealthUrl
    )

    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $HealthUrl -TimeoutSec 3
        return $response.StatusCode -ge 200 -and $response.StatusCode -lt 300
    }
    catch {
        return $false
    }
}

function Wait-LocalAIServiceReady {
    param(
        [Parameter(Mandatory = $true)]
        [string]$HealthUrl,
        [int]$MaxAttempts = 10,
        [int]$SleepSeconds = 2
    )

    for ($attempt = 1; $attempt -le $MaxAttempts; $attempt++) {
        if (Test-LocalAIServiceHealthy -HealthUrl $HealthUrl) {
            return $true
        }

        Start-Sleep -Seconds $SleepSeconds
    }

    return $false
}

function Require-Command {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name
    )

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Missing command: ${Name}. Please install it and add it to PATH."
    }
}

Push-Location $projectRoot
try {
    Require-Command -Name "wails"
    Require-Command -Name "npm"

    if (-not $SkipInstall -and -not (Test-Path (Join-Path $frontendDir "node_modules"))) {
        Write-Host "frontend/node_modules is missing. Running npm install --legacy-peer-deps ..." -ForegroundColor Yellow
        Push-Location $frontendDir
        try {
            npm install --legacy-peer-deps
        }
        finally {
            Pop-Location
        }
    }

    if (-not $SkipLocalAIService) {
        if (Test-Path $localAIServiceScript) {
            if (Test-LocalAIServiceHealthy -HealthUrl $localAIServiceHealthUrl) {
                Write-Host "Local AI service is already healthy at $localAIServiceHealthUrl." -ForegroundColor DarkGray
            } elseif (Test-LocalPortListening -Port 8000) {
                Write-Warning "Port 8000 is already in use, but the local AI health endpoint is not ready: $localAIServiceHealthUrl"
            } else {
                Write-Host "Starting local Qingyu AI service on port 8000..." -ForegroundColor Yellow
                Start-Process powershell -WindowStyle Hidden -WorkingDirectory $localAIServiceRoot -ArgumentList @(
                    '-NoProfile',
                    '-ExecutionPolicy', 'Bypass',
                    '-File', $localAIServiceScript
                )
                if (Wait-LocalAIServiceReady -HealthUrl $localAIServiceHealthUrl) {
                    Write-Host "Local AI service is ready at $localAIServiceHealthUrl." -ForegroundColor Green
                } else {
                    Write-Warning "Local AI service start command was sent, but the health endpoint is still unavailable: $localAIServiceHealthUrl"
                }
            }
        } else {
            Write-Warning "Local AI service script not found: $localAIServiceScript"
        }
    }

    Write-Host "Starting Qingyu-Editor Wails dev host..." -ForegroundColor Green
    wails dev
}
finally {
    Pop-Location
}
