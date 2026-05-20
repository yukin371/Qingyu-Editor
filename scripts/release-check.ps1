<#
.SYNOPSIS
Runs Qingyu-Editor release verification gates.

.DESCRIPTION
Use quick for daily pre-commit/release sanity checks and full for release candidates.
The script cleans generated artifacts first while preserving frontend/dist/.gitkeep,
then runs the selected verification gates and can optionally write JSON or Markdown
reports with git and environment metadata.

.EXAMPLE
.\scripts\release-check.ps1 -Profile quick

.EXAMPLE
.\scripts\release-check.ps1 -Profile full -ReportPath .tmp-release-check.md

.EXAMPLE
.\scripts\release-check.ps1 -Profile full -IncludeDeepChecks -PlanOnly

.EXAMPLE
.\scripts\release-check.ps1 -CleanOnly
#>

param(
    [ValidateSet("quick", "full")]
    [string]$Profile = "quick",
    [switch]$SkipWailsBuild,
    [switch]$SkipExeSmoke,
    [switch]$IncludeDeepChecks,
    [switch]$PlanOnly,
    [switch]$CleanOnly,
    [string]$ReportPath
)

$ErrorActionPreference = "Stop"

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$FrontendRoot = Join-Path $RepoRoot "frontend"
$DistKeep = Join-Path $FrontendRoot "dist\.gitkeep"
$ReleaseCheckTimer = [System.Diagnostics.Stopwatch]::StartNew()
$StepResults = New-Object System.Collections.Generic.List[object]

function Resolve-ReleasePath {
    param([string]$Path)

    if ([System.IO.Path]::IsPathRooted($Path)) {
        return [System.IO.Path]::GetFullPath($Path)
    }

    return [System.IO.Path]::GetFullPath((Join-Path $RepoRoot $Path))
}

function Assert-PathUnderRepoRoot {
    param([string]$Path)

    $normalizedRoot = [System.IO.Path]::GetFullPath($RepoRoot.Path).TrimEnd([System.IO.Path]::DirectorySeparatorChar, [System.IO.Path]::AltDirectorySeparatorChar)
    $normalizedPath = [System.IO.Path]::GetFullPath($Path)
    $rootWithSeparator = "$normalizedRoot$([System.IO.Path]::DirectorySeparatorChar)"
    if ($normalizedPath -ne $normalizedRoot -and !$normalizedPath.StartsWith($rootWithSeparator, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to operate outside repo root: $normalizedPath"
    }
}

function Invoke-Step {
    param(
        [string]$Name,
        [scriptblock]$Body
    )

    Write-Host ""
    Write-Host "==> $Name" -ForegroundColor Cyan
    $stepTimer = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        & $Body
        $stepTimer.Stop()
        $StepResults.Add([pscustomobject]@{
            Name = $Name
            Status = "passed"
            Seconds = $stepTimer.Elapsed.TotalSeconds
        })
        Write-Host ("<== {0} passed in {1:n1}s" -f $Name, $stepTimer.Elapsed.TotalSeconds) -ForegroundColor DarkGray
    }
    catch {
        $stepTimer.Stop()
        $StepResults.Add([pscustomobject]@{
            Name = $Name
            Status = "failed"
            Seconds = $stepTimer.Elapsed.TotalSeconds
        })
        Write-Host ("<== {0} failed in {1:n1}s" -f $Name, $stepTimer.Elapsed.TotalSeconds) -ForegroundColor Red
        throw
    }
}

function Invoke-Native {
    param(
        [string]$WorkingDirectory,
        [string]$Label,
        [scriptblock]$Body
    )

    Push-Location $WorkingDirectory
    try {
        $global:LASTEXITCODE = 0
        & $Body
        if ($LASTEXITCODE -ne 0) {
            throw "$Label failed with exit code $LASTEXITCODE."
        }
    }
    finally {
        Pop-Location
    }
}

function Write-StepSummary {
    if ($StepResults.Count -eq 0) {
        return
    }

    Write-Host ""
    Write-Host "Step summary:" -ForegroundColor Yellow
    foreach ($result in $StepResults) {
        $color = if ($result.Status -eq "passed") { "DarkGray" } else { "Red" }
        Write-Host ("  - {0}: {1} ({2:n1}s)" -f $result.Name, $result.Status, $result.Seconds) -ForegroundColor $color
    }
}

function Get-CommandVersion {
    param(
        [string]$Executable,
        [string[]]$Arguments = @()
    )

    try {
        $output = & $Executable @Arguments 2>$null
        return (($output | Select-Object -First 1) -join "").Trim()
    }
    catch {
        return "unavailable"
    }
}

function Write-ReleaseReport {
    param(
        [ValidateSet("passed", "failed", "planned", "cleaned")]
        [string]$Status,
        [string]$FailureMessage = ""
    )

    if (!$ReportPath) {
        return
    }

    $gitBranch = ""
    $gitCommit = ""
    $gitStatusLines = @()
    $pushedRepoLocation = $false
    try {
        Push-Location $RepoRoot
        $pushedRepoLocation = $true
        $gitBranch = (git branch --show-current).Trim()
        $gitCommit = (git rev-parse HEAD).Trim()
        $gitStatusLines = @(git status --short)
    }
    catch {
        $gitStatusLines = @("git metadata unavailable: $($_.Exception.Message)")
    }
    finally {
        if ($pushedRepoLocation) {
            Pop-Location
        }
    }

    $resolvedReportPath = Resolve-ReleasePath $ReportPath
    Assert-PathUnderRepoRoot $resolvedReportPath

    $reportDir = Split-Path -Parent $resolvedReportPath
    if ($reportDir -and !(Test-Path $reportDir)) {
        New-Item -ItemType Directory -Path $reportDir | Out-Null
    }

    $reportSteps = @(
        foreach ($step in $StepResults) {
            [ordered]@{
                name = $step.Name
                status = $step.Status
                seconds = [math]::Round([double]$step.Seconds, 3)
            }
        }
    )

    $report = [ordered]@{
        profile = $Profile
        status = $Status
        plannedSteps = @(Get-ReleaseCheckPlan)
        git = [ordered]@{
            branch = $gitBranch
            commit = $gitCommit
            dirty = $gitStatusLines.Count -gt 0
            changeCount = $gitStatusLines.Count
            changes = @($gitStatusLines)
        }
        tools = [ordered]@{
            node = Get-CommandVersion -Executable "node" -Arguments @("--version")
            npm = Get-CommandVersion -Executable "npm" -Arguments @("--version")
            go = Get-CommandVersion -Executable "go" -Arguments @("version")
            wails = Get-CommandVersion -Executable "wails" -Arguments @("version")
        }
        environment = [ordered]@{
            os = [System.Runtime.InteropServices.RuntimeInformation]::OSDescription
            architecture = [System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture.ToString()
            powerShell = $PSVersionTable.PSVersion.ToString()
            repoRoot = $RepoRoot.Path
            frontendRoot = $FrontendRoot
        }
        cleanOnly = $CleanOnly.IsPresent
        includeDeepChecks = $IncludeDeepChecks.IsPresent
        skipWailsBuild = $SkipWailsBuild.IsPresent
        skipExeSmoke = $SkipExeSmoke.IsPresent
        seconds = [math]::Round([double]$ReleaseCheckTimer.Elapsed.TotalSeconds, 3)
        failure = $FailureMessage
        steps = $reportSteps
        generatedAt = (Get-Date).ToString("o")
    }

    if ([System.IO.Path]::GetExtension($resolvedReportPath).ToLowerInvariant() -eq ".md") {
        $markdownLines = @(
            "# Qingyu-Editor Release Check",
            "",
            "- Profile: $Profile",
            "- Status: $Status",
            "- Duration: $([math]::Round([double]$ReleaseCheckTimer.Elapsed.TotalSeconds, 1))s",
            "- Branch: $gitBranch",
            "- Commit: $gitCommit",
            "- Dirty: $($gitStatusLines.Count -gt 0) ($($gitStatusLines.Count) changes)",
            "- Generated: $((Get-Date).ToString("o"))",
            "",
            "## Planned Steps"
        )
        $plannedSteps = @(Get-ReleaseCheckPlan)
        for ($i = 0; $i -lt $plannedSteps.Count; $i += 1) {
            $markdownLines += ("{0}. {1}" -f ($i + 1), $plannedSteps[$i])
        }
        if ($gitStatusLines.Count -gt 0) {
            $markdownLines += @("", "## Git Changes")
            $maxChangesToShow = [Math]::Min(20, $gitStatusLines.Count)
            for ($i = 0; $i -lt $maxChangesToShow; $i += 1) {
                $markdownLines += ('- `{0}`' -f $gitStatusLines[$i])
            }
            if ($gitStatusLines.Count -gt $maxChangesToShow) {
                $markdownLines += ('- ... {0} more changes omitted' -f ($gitStatusLines.Count - $maxChangesToShow))
            }
        }
        if ($reportSteps.Count -gt 0) {
            $markdownLines += @("", "## Executed Steps")
            foreach ($step in $reportSteps) {
                $markdownLines += ('- {0}: {1} ({2:n1}s)' -f $step.name, $step.status, $step.seconds)
            }
        }
        if ($FailureMessage) {
            $markdownLines += @("", "## Failure", $FailureMessage)
        }
        $markdownLines | Set-Content -Path $resolvedReportPath -Encoding UTF8
    }
    else {
        $report | ConvertTo-Json -Depth 5 | Set-Content -Path $resolvedReportPath -Encoding UTF8
    }
    Write-Host ("Report written: {0}" -f $resolvedReportPath) -ForegroundColor DarkGray
}

trap {
    if ($ReleaseCheckTimer.IsRunning) {
        $ReleaseCheckTimer.Stop()
    }
    Write-StepSummary
    Write-Host ""
    Write-Host ("Release check ({0}) failed in {1:n1}s." -f $Profile, $ReleaseCheckTimer.Elapsed.TotalSeconds) -ForegroundColor Red
    Write-Host ("Failure: {0}" -f $_.Exception.Message) -ForegroundColor Red
    $originalFailureMessage = $_.Exception.Message
    try {
        Write-ReleaseReport -Status "failed" -FailureMessage $originalFailureMessage
    }
    catch {
        Write-Host ("Report write failed: {0}" -f $_.Exception.Message) -ForegroundColor Red
    }
    exit 1
}

function Get-ReleaseCheckPlan {
    $steps = @("Clean test reports, build cache, and temporary files")

    if ($CleanOnly) {
        return $steps
    }

    $steps += @(
        "Go package tests: go test ./...",
        "Frontend type-check: npm run type-check",
        "Frontend targeted unit tests: npm run test:ci"
    )

    if ($Profile -eq "quick") {
        $steps += "Core Playwright smoke: npm run test:e2e:core"
    }
    else {
        $steps += @(
            "Full type-check: npm run type-check:full",
            "Style lint: npm run lint:styles",
            "Production frontend build: npm run build",
            "Dependency audit: npm audit --audit-level=high",
            "Full Playwright regression: npm run test:e2e"
        )

        if ($SkipWailsBuild) {
            $steps += "Skip Wails build and executable startup smoke"
        }
        else {
            $steps += "Wails build: wails build"
            if ($SkipExeSmoke) {
                $steps += "Skip Wails executable startup smoke"
            }
            else {
                $steps += "Wails executable startup smoke: keep process alive for 8 seconds"
            }
        }
    }

    if ($IncludeDeepChecks) {
        $steps += @(
            "Go vet: go vet ./...",
            "Go race tests: go test -race ./...",
            "Wails doctor: wails doctor"
        )
    }

    $steps += "Git whitespace check: git diff --check"
    return $steps
}

function Write-ReleaseCheckPlan {
    Write-Host "Qingyu-Editor release check profile: $Profile" -ForegroundColor Yellow
    if ($Profile -eq "full" -and !$PlanOnly) {
        Write-Host "Full profile will run long checks including full Playwright and Wails build unless skipped." -ForegroundColor Yellow
    }
    if ($IncludeDeepChecks) {
        Write-Host "Deep checks enabled: go vet, go test -race, and wails doctor." -ForegroundColor Yellow
    }
    if ($SkipWailsBuild) {
        Write-Host "Wails build is skipped for this run." -ForegroundColor Yellow
    }
    elseif ($SkipExeSmoke) {
        Write-Host "Wails executable startup smoke is skipped for this run." -ForegroundColor Yellow
    }
    $steps = @(Get-ReleaseCheckPlan)
    for ($i = 0; $i -lt $steps.Count; $i += 1) {
        Write-Host ("  {0}. {1}" -f ($i + 1), $steps[$i])
    }
}

function Clear-ReleaseArtifacts {
    $artifactDirs = @(
        "frontend\test-results",
        "frontend\playwright-report",
        "frontend\html",
        "frontend\coverage",
        "build\bin"
    )

    foreach ($relativePath in $artifactDirs) {
        $target = Resolve-ReleasePath $relativePath
        Assert-PathUnderRepoRoot $target
        if (Test-Path $target) {
            Remove-Item -LiteralPath $target -Recurse -Force
        }
    }

    Get-ChildItem -LiteralPath $FrontendRoot -Force -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -like ".tmp-*" } |
        Remove-Item -Force -Recurse

    Get-ChildItem -LiteralPath $RepoRoot -Force -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -like ".tmp-*" } |
        Remove-Item -Force -Recurse

    $distDir = Join-Path $FrontendRoot "dist"
    if (!(Test-Path $distDir)) {
        New-Item -ItemType Directory -Path $distDir | Out-Null
    }

    Get-ChildItem -LiteralPath $distDir -Force -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -ne ".gitkeep" } |
        Remove-Item -Force -Recurse

    if (!(Test-Path $DistKeep)) {
        New-Item -ItemType File -Path $DistKeep | Out-Null
    }
}

function Invoke-Frontend {
    param([string]$Command)

    Invoke-Native $FrontendRoot "npm run $Command" {
        npm run $Command
    }
}

function Test-WailsExecutableStarts {
    $exePath = Join-Path $RepoRoot "build\bin\Qingyu-Editor.exe"
    if (!(Test-Path $exePath)) {
        throw "Wails executable not found: $exePath"
    }

    $process = Start-Process -FilePath $exePath -PassThru -WindowStyle Hidden
    try {
        Start-Sleep -Seconds 8
        if ($process.HasExited) {
            throw "Wails executable exited early with code $($process.ExitCode)."
        }
    }
    finally {
        if (!$process.HasExited) {
            Stop-Process -Id $process.Id -Force
            $process.WaitForExit()
        }
    }
}

function Invoke-DeepChecks {
    Invoke-Step "Go vet" {
        Invoke-Native $RepoRoot "go vet ./..." {
            go vet ./...
        }
    }

    Invoke-Step "Go race tests" {
        Invoke-Native $RepoRoot "go test -race ./..." {
            go test -race ./...
        }
    }

    Invoke-Step "Wails doctor" {
        Invoke-Native $RepoRoot "wails doctor" {
            wails doctor
        }
    }
}

Write-ReleaseCheckPlan

if ($PlanOnly) {
    if ($ReleaseCheckTimer.IsRunning) {
        $ReleaseCheckTimer.Stop()
    }
    Write-Host ""
    Write-Host "Plan only. No commands were executed." -ForegroundColor Green
    Write-ReleaseReport -Status "planned"
    exit 0
}

Invoke-Step "Clean generated release artifacts" {
    Clear-ReleaseArtifacts
}

if ($CleanOnly) {
    if ($ReleaseCheckTimer.IsRunning) {
        $ReleaseCheckTimer.Stop()
    }
    Write-Host ""
    Write-Host "Clean complete." -ForegroundColor Green
    Write-ReleaseReport -Status "cleaned"
    exit 0
}

Invoke-Step "Go package tests" {
    Invoke-Native $RepoRoot "go test ./..." {
        go test ./...
    }
}

Invoke-Step "Frontend type-check" {
    Invoke-Frontend "type-check"
}

Invoke-Step "Frontend targeted unit tests" {
    Invoke-Frontend "test:ci"
}

if ($Profile -eq "quick") {
    Invoke-Step "Core Playwright smoke" {
        Invoke-Frontend "test:e2e:core"
    }
}
else {
    Invoke-Step "Full type-check" {
        Invoke-Frontend "type-check:full"
    }

    Invoke-Step "Style lint" {
        Invoke-Frontend "lint:styles"
    }

    Invoke-Step "Production frontend build" {
        Invoke-Frontend "build"
    }

    Invoke-Step "Dependency audit" {
        Invoke-Native $FrontendRoot "npm audit --audit-level=high" {
            npm audit --audit-level=high
        }
    }

    Invoke-Step "Full Playwright regression" {
        Invoke-Frontend "test:e2e"
    }

    if (!$SkipWailsBuild) {
        Invoke-Step "Wails build" {
            Invoke-Native $RepoRoot "wails build" {
                wails build
            }
        }

        if (!$SkipExeSmoke) {
            Invoke-Step "Wails executable startup smoke" {
                Test-WailsExecutableStarts
            }
        }
    }
}

if ($IncludeDeepChecks) {
    Invoke-DeepChecks
}

Invoke-Step "Git whitespace check" {
    Invoke-Native $RepoRoot "git diff --check" {
        git diff --check
    }
}

Write-Host ""
$ReleaseCheckTimer.Stop()
Write-StepSummary
Write-Host ""
Write-Host ("Release check ({0}) passed in {1:n1}s." -f $Profile, $ReleaseCheckTimer.Elapsed.TotalSeconds) -ForegroundColor Green
Write-ReleaseReport -Status "passed"
