<#
.SYNOPSIS
Launches the Qingyu-Editor desktop bundle with a clean APPDATA profile for manual smoke testing.

.DESCRIPTION
The script extracts the latest Windows release zip (or a caller-provided zip) into a repo-local
temporary workspace, starts the GUI app with an isolated APPDATA root, and prints the paths that
manual smoke testers need. This keeps the user's existing desktop profile untouched so regressions
can be checked against a clean baseline.

.EXAMPLE
.\scripts\launch-clean-smoke.ps1

.EXAMPLE
.\scripts\launch-clean-smoke.ps1 -ReleaseZipPath .\build\release\v0.1.0-beta\Qingyu-Editor-v0.1.0-beta-windows-amd64.zip
#>

param(
    [string]$ReleaseZipPath,
    [string]$ScratchRoot,
    [switch]$KeepProcessRunningHint
)

$ErrorActionPreference = "Stop"

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")

function Resolve-SmokePath {
    param([string]$Path)

    if ([string]::IsNullOrWhiteSpace($Path)) {
        return $null
    }

    if ([System.IO.Path]::IsPathRooted($Path)) {
        return [System.IO.Path]::GetFullPath($Path)
    }

    return [System.IO.Path]::GetFullPath((Join-Path $RepoRoot $Path))
}

function Assert-PathUnderRepoRoot {
    param([string]$Path)

    $normalizedRoot = [System.IO.Path]::GetFullPath($RepoRoot.Path).TrimEnd(
        [System.IO.Path]::DirectorySeparatorChar,
        [System.IO.Path]::AltDirectorySeparatorChar
    )
    $normalizedPath = [System.IO.Path]::GetFullPath($Path)
    $rootWithSeparator = "$normalizedRoot$([System.IO.Path]::DirectorySeparatorChar)"

    if ($normalizedPath -ne $normalizedRoot -and
        !$normalizedPath.StartsWith($rootWithSeparator, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to operate outside repo root: $normalizedPath"
    }
}

function Find-LatestReleaseZip {
    $releaseRoot = Join-Path $RepoRoot "build\\release"
    if (!(Test-Path $releaseRoot)) {
        throw "Release directory not found: $releaseRoot"
    }

    $candidate = Get-ChildItem -Path $releaseRoot -Recurse -File -Filter "Qingyu-Editor-*-windows-amd64.zip" |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1

    if (-not $candidate) {
        throw "No Windows release zip found under $releaseRoot"
    }

    return $candidate.FullName
}

function Wait-ForMainWindow {
    param(
        [System.Diagnostics.Process]$Process,
        [int]$TimeoutSeconds = 20
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        $Process.Refresh()
        if ($Process.HasExited) {
            throw "Qingyu-Editor exited before the main window appeared."
        }

        if ($Process.MainWindowHandle -and $Process.MainWindowHandle -ne 0) {
            return $Process.MainWindowHandle
        }

        Start-Sleep -Milliseconds 250
    }

    throw "Timed out waiting for Qingyu-Editor main window."
}

$resolvedZipPath = Resolve-SmokePath $ReleaseZipPath
if (-not $resolvedZipPath) {
    $resolvedZipPath = Find-LatestReleaseZip
}

if (!(Test-Path $resolvedZipPath)) {
    throw "Release zip not found: $resolvedZipPath"
}

$resolvedScratchRoot = Resolve-SmokePath $ScratchRoot
if (-not $resolvedScratchRoot) {
    $resolvedScratchRoot = Join-Path $RepoRoot ".tmp-desktop-smoke"
}
Assert-PathUnderRepoRoot $resolvedScratchRoot

$runId = Get-Date -Format "yyyyMMdd-HHmmss"
$runRoot = Join-Path $resolvedScratchRoot $runId
$bundleRoot = Join-Path $runRoot "bundle"
$appDataRoot = Join-Path $runRoot "appdata"

New-Item -ItemType Directory -Path $bundleRoot -Force | Out-Null
New-Item -ItemType Directory -Path $appDataRoot -Force | Out-Null

Expand-Archive -LiteralPath $resolvedZipPath -DestinationPath $bundleRoot -Force

$exe = Get-ChildItem -Path $bundleRoot -Recurse -File -Filter "Qingyu-Editor.exe" | Select-Object -First 1
if (-not $exe) {
    throw "Qingyu-Editor.exe not found after extracting $resolvedZipPath"
}

$previousAppData = $env:APPDATA
$previousWebViewArgs = $env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS
try {
    $env:APPDATA = $appDataRoot
    $env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS = "--disable-features=CalculateNativeWinOcclusion"
    $process = Start-Process -FilePath $exe.FullName -WorkingDirectory $exe.DirectoryName -PassThru
}
finally {
    $env:APPDATA = $previousAppData
    if ($null -eq $previousWebViewArgs) {
        Remove-Item Env:\WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS -ErrorAction SilentlyContinue
    } else {
        $env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS = $previousWebViewArgs
    }
}

if (-not $process) {
    throw "Failed to start Qingyu-Editor."
}

$windowHandle = Wait-ForMainWindow -Process $process

$profileDir = Join-Path $appDataRoot "Qingyu-Editor"
$dbPath = Join-Path $profileDir "qingyu-editor.db"
$sessionManifestPath = Join-Path $runRoot "session.json"

$sessionManifest = [ordered]@{
    releaseZipPath = $resolvedZipPath
    sessionRoot = $runRoot
    appDataRoot = $appDataRoot
    profileDir = $profileDir
    dbPath = $dbPath
    pid = $process.Id
    windowHandle = ("0x{0:X}" -f $windowHandle.ToInt64())
    startedAt = (Get-Date).ToString("o")
}
$sessionManifest | ConvertTo-Json | Set-Content -LiteralPath $sessionManifestPath -Encoding UTF8

Write-Host ""
Write-Host "Qingyu-Editor clean smoke session is ready." -ForegroundColor Cyan
Write-Host ""
Write-Host ("  Release zip : {0}" -f $resolvedZipPath)
Write-Host ("  Session root: {0}" -f $runRoot)
Write-Host ("  APPDATA root: {0}" -f $appDataRoot)
Write-Host ("  Profile dir : {0}" -f $profileDir)
Write-Host ("  DB path     : {0}" -f $dbPath)
Write-Host ("  Session meta: {0}" -f $sessionManifestPath)
Write-Host ("  PID         : {0}" -f $process.Id)
Write-Host ("  Window      : 0x{0:X}" -f $windowHandle.ToInt64())
Write-Host ""
Write-Host "Suggested manual smoke order:" -ForegroundColor Yellow
Write-Host "  1. Verify the workbench empty state or create a blank project."
Write-Host "  2. Walk SMOKE-02 to SMOKE-05 in docs/regression-v0.1.0-beta.md."
Write-Host "  3. Run .\scripts\inspect-clean-smoke.ps1 after the smoke to capture DB evidence."
Write-Host "  4. Keep the session root until the smoke result is recorded."
if ($KeepProcessRunningHint) {
    Write-Host "  5. Stop the app manually after recording the result."
}
