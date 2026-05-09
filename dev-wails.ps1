param(
    [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSCommandPath
$frontendDir = Join-Path $projectRoot "frontend"

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

    Write-Host "Starting Qingyu-Editor Wails dev host..." -ForegroundColor Green
    wails dev
}
finally {
    Pop-Location
}
