<#
.SYNOPSIS
Inspects the latest Qingyu-Editor clean smoke session and prints a project / volume / chapter summary.

.DESCRIPTION
This script reads the SQLite database created by launch-clean-smoke.ps1 and outputs a concise evidence
summary for manual desktop smoke results. It defaults to the newest session under .tmp-desktop-smoke.

.EXAMPLE
.\scripts\inspect-clean-smoke.ps1

.EXAMPLE
.\scripts\inspect-clean-smoke.ps1 -SessionRoot .\.tmp-desktop-smoke\20260523-225345

.EXAMPLE
.\scripts\inspect-clean-smoke.ps1 -MinProjects 1 -MinVolumes 1 -MinChapters 1 -FailOnDuplicateSort

.EXAMPLE
.\scripts\inspect-clean-smoke.ps1 -MinProjects 1 -MinVolumes 1 -MinChapters 1 -MinTotalChapterWords 1 -RequireChapterText -FailOnDuplicateSort

.EXAMPLE
.\scripts\inspect-clean-smoke.ps1 -ExpectProjectTitleContains "冒烟" -ExpectChapterTitleContains "回归标题" -ExpectChapterTextContains "回归正文"
#>

param(
    [string]$SessionRoot,
    [string]$ScratchRoot,
    [string]$ReportPath,
    [int]$MinProjects = 0,
    [int]$MinVolumes = 0,
    [int]$MinChapters = 0,
    [int]$MinTotalChapterWords = 0,
    [switch]$RequireChapterText,
    [string]$ExpectProjectTitleContains,
    [string]$ExpectChapterTitleContains,
    [string]$ExpectChapterTextContains,
    [switch]$FailOnDuplicateSort
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
        throw "Refusing to inspect outside repo root: $normalizedPath"
    }
}

function Resolve-ScratchRoot {
    $resolvedScratchRoot = Resolve-SmokePath $ScratchRoot
    if (-not $resolvedScratchRoot) {
        $resolvedScratchRoot = Join-Path $RepoRoot ".tmp-desktop-smoke"
    }
    Assert-PathUnderRepoRoot $resolvedScratchRoot
    if (!(Test-Path $resolvedScratchRoot)) {
        throw "Smoke scratch root not found: $resolvedScratchRoot"
    }
    return $resolvedScratchRoot
}

function Resolve-ReportPath {
    param(
        [string]$Path,
        [string]$ResolvedSessionRoot
    )

    if ([string]::IsNullOrWhiteSpace($Path)) {
        return [System.IO.Path]::GetFullPath((Join-Path $ResolvedSessionRoot "inspection.md"))
    }

    if ([System.IO.Path]::IsPathRooted($Path)) {
        return [System.IO.Path]::GetFullPath($Path)
    }

    return [System.IO.Path]::GetFullPath((Join-Path $RepoRoot $Path))
}

function Resolve-SessionRoot {
    param([string]$ResolvedScratchRoot)

    $resolvedSessionRoot = Resolve-SmokePath $SessionRoot
    if ($resolvedSessionRoot) {
        Assert-PathUnderRepoRoot $resolvedSessionRoot
        if (!(Test-Path $resolvedSessionRoot)) {
            throw "Smoke session root not found: $resolvedSessionRoot"
        }
        return $resolvedSessionRoot
    }

    $latestSession = Get-ChildItem -Path $ResolvedScratchRoot -Directory |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1

    if (-not $latestSession) {
        throw "No smoke session found under $ResolvedScratchRoot"
    }

    return $latestSession.FullName
}

function Test-TextContains {
    param(
        [string]$Text,
        [string]$Needle
    )

    if ([string]::IsNullOrWhiteSpace($Needle)) {
        return $true
    }

    if ($null -eq $Text) {
        return $false
    }

    return $Text.IndexOf($Needle, [System.StringComparison]::OrdinalIgnoreCase) -ge 0
}

$resolvedScratchRoot = Resolve-ScratchRoot
$resolvedSessionRoot = Resolve-SessionRoot -ResolvedScratchRoot $resolvedScratchRoot
$sessionManifestPath = Join-Path $resolvedSessionRoot "session.json"
$profileDir = Join-Path (Join-Path $resolvedSessionRoot "appdata") "Qingyu-Editor"
$dbPath = Join-Path $profileDir "qingyu-editor.db"

if (!(Test-Path $dbPath)) {
    throw "Smoke database not found: $dbPath"
}

$goTempPath = Join-Path $env:TEMP "qingyu_clean_smoke_inspect.go"
$queryProgram = @'
package main

import (
  "database/sql"
  "encoding/base64"
  "fmt"
  "os"

  _ "github.com/mattn/go-sqlite3"
)

type projectRow struct {
  id        string
  title     string
  status    string
  wordCount int
  updatedAt string
}

type volumeRow struct {
  id        string
  title     string
  sortOrder int
  createdAt string
}

type chapterRow struct {
  id         string
  volumeID   string
  title      string
  sortOrder  int
  wordCount  int
  plainText  string
  updatedAt  string
}

func main() {
  dbPath := os.Getenv("QINGYU_SMOKE_DB_PATH")
  if dbPath == "" {
    panic("QINGYU_SMOKE_DB_PATH is required")
  }

  db, err := sql.Open("sqlite3", dbPath+"?_loc=auto")
  if err != nil {
    panic(err)
  }
  defer db.Close()

  var projectCount int
  if err := db.QueryRow(`SELECT COUNT(*) FROM projects`).Scan(&projectCount); err != nil {
    panic(err)
  }
  fmt.Printf("summary\tprojects\t%d\n", projectCount)

  projectRows, err := db.Query(`
SELECT id, title, COALESCE(status, 'draft') AS status, COALESCE(word_count, 0) AS word_count, updated_at
FROM projects
ORDER BY updated_at DESC, created_at DESC`)
  if err != nil {
    panic(err)
  }
  defer projectRows.Close()

  for projectRows.Next() {
    var project projectRow
    if err := projectRows.Scan(&project.id, &project.title, &project.status, &project.wordCount, &project.updatedAt); err != nil {
      panic(err)
    }
    fmt.Printf("project\t%s\t%s\t%s\t%d\t%s\n", project.id, project.title, project.status, project.wordCount, project.updatedAt)

    volumeRows, err := db.Query(`
SELECT id, title, COALESCE(sort_order, 0) AS sort_order, created_at
FROM volumes
WHERE project_id = ?
ORDER BY sort_order ASC, created_at ASC`, project.id)
    if err != nil {
      panic(err)
    }

    for volumeRows.Next() {
      var volume volumeRow
      if err := volumeRows.Scan(&volume.id, &volume.title, &volume.sortOrder, &volume.createdAt); err != nil {
        panic(err)
      }
      fmt.Printf("volume\t%s\t%s\t%d\t%s\n", volume.id, volume.title, volume.sortOrder, volume.createdAt)
    }
    volumeRows.Close()

    chapterRows, err := db.Query(`
SELECT id, COALESCE(volume_id, '') AS volume_id, title, COALESCE(sort_order, 0) AS sort_order,
       COALESCE(word_count, 0) AS word_count, COALESCE(plain_text, '') AS plain_text, updated_at
FROM chapters
WHERE project_id = ?
ORDER BY CASE WHEN volume_id IS NULL OR volume_id = '' THEN 0 ELSE 1 END ASC, volume_id ASC, sort_order ASC, created_at ASC`, project.id)
    if err != nil {
      panic(err)
    }

    for chapterRows.Next() {
      var chapter chapterRow
      if err := chapterRows.Scan(&chapter.id, &chapter.volumeID, &chapter.title, &chapter.sortOrder, &chapter.wordCount, &chapter.plainText, &chapter.updatedAt); err != nil {
        panic(err)
      }
      plainPreview := chapter.plainText
      if len(plainPreview) > 48 {
        plainPreview = plainPreview[:48]
      }
      encodedPlainText := base64.StdEncoding.EncodeToString([]byte(chapter.plainText))
      fmt.Printf("chapter\t%s\t%s\t%s\t%d\t%d\t%s\t%s\n", chapter.id, chapter.volumeID, chapter.title, chapter.sortOrder, chapter.wordCount, encodedPlainText, chapter.updatedAt)
    }
    chapterRows.Close()

    duplicateVolumeRows, err := db.Query(`
SELECT sort_order, COUNT(*) AS duplicate_count
FROM volumes
WHERE project_id = ?
GROUP BY sort_order
HAVING COUNT(*) > 1
ORDER BY sort_order ASC`, project.id)
    if err != nil {
      panic(err)
    }
    for duplicateVolumeRows.Next() {
      var sortOrder int
      var duplicateCount int
      if err := duplicateVolumeRows.Scan(&sortOrder, &duplicateCount); err != nil {
        panic(err)
      }
      fmt.Printf("duplicate-volume\t%d\t%d\n", sortOrder, duplicateCount)
    }
    duplicateVolumeRows.Close()

    duplicateChapterRows, err := db.Query(`
SELECT COALESCE(volume_id, '') AS volume_id, sort_order, COUNT(*) AS duplicate_count
FROM chapters
WHERE project_id = ?
GROUP BY COALESCE(volume_id, ''), sort_order
HAVING COUNT(*) > 1
ORDER BY volume_id ASC, sort_order ASC`, project.id)
    if err != nil {
      panic(err)
    }
    for duplicateChapterRows.Next() {
      var volumeID string
      var sortOrder int
      var duplicateCount int
      if err := duplicateChapterRows.Scan(&volumeID, &sortOrder, &duplicateCount); err != nil {
        panic(err)
      }
      fmt.Printf("duplicate-chapter\t%s\t%d\t%d\n", volumeID, sortOrder, duplicateCount)
    }
    duplicateChapterRows.Close()
  }
}
'@

Set-Content -LiteralPath $goTempPath -Value $queryProgram -Encoding UTF8

try {
    $env:QINGYU_SMOKE_DB_PATH = $dbPath
    $rawOutput = go run $goTempPath
}
finally {
    Remove-Item -LiteralPath $goTempPath -Force -ErrorAction SilentlyContinue
    Remove-Item Env:\QINGYU_SMOKE_DB_PATH -ErrorAction SilentlyContinue
}

$manifest = $null
if (Test-Path $sessionManifestPath) {
    $manifest = Get-Content -LiteralPath $sessionManifestPath -Raw | ConvertFrom-Json
}

$reportMarkdownPath = Resolve-ReportPath -Path $ReportPath -ResolvedSessionRoot $resolvedSessionRoot
Assert-PathUnderRepoRoot $reportMarkdownPath
$reportDirectory = Split-Path -Parent $reportMarkdownPath
if ($reportDirectory -and !(Test-Path $reportDirectory)) {
    New-Item -ItemType Directory -Path $reportDirectory -Force | Out-Null
}
$reportJsonPath = [System.IO.Path]::ChangeExtension($reportMarkdownPath, ".json")

$projects = New-Object System.Collections.Generic.List[object]
$currentProject = $null
$summaryProjectCount = 0

$lines = @($rawOutput | Where-Object { $_ -and $_.Trim() -ne "" })
foreach ($line in $lines) {
    $parts = $line -split "`t"
    switch ($parts[0]) {
        "summary" {
            if ($parts.Length -ge 3 -and $parts[1] -eq "projects") {
                $summaryProjectCount = [int]$parts[2]
            }
        }
        "project" {
            $currentProject = [ordered]@{
                id = $parts[1]
                title = $parts[2]
                status = $parts[3]
                wordCount = [int]$parts[4]
                updatedAt = $parts[5]
                volumes = New-Object System.Collections.Generic.List[object]
                chapters = New-Object System.Collections.Generic.List[object]
                duplicateVolumeSortOrders = New-Object System.Collections.Generic.List[object]
                duplicateChapterSortOrders = New-Object System.Collections.Generic.List[object]
            }
            $projects.Add($currentProject) | Out-Null
        }
        "volume" {
            if ($null -ne $currentProject) {
                $currentProject.volumes.Add([ordered]@{
                    id = $parts[1]
                    title = $parts[2]
                    sortOrder = [int]$parts[3]
                    createdAt = $parts[4]
                }) | Out-Null
            }
        }
        "chapter" {
            if ($null -ne $currentProject) {
                $plainText = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($parts[6]))
                $plainPreview = $plainText
                if ($plainPreview.Length -gt 48) {
                    $plainPreview = $plainPreview.Substring(0, 48)
                }
                $plainPreview = $plainPreview -replace "`r", " " -replace "`n", " " -replace "`t", " "
                $currentProject.chapters.Add([ordered]@{
                    id = $parts[1]
                    volumeId = $parts[2]
                    title = $parts[3]
                    sortOrder = [int]$parts[4]
                    wordCount = [int]$parts[5]
                    plainText = $plainText
                    preview = $plainPreview
                    plainTextLength = $plainText.Length
                    updatedAt = $parts[7]
                }) | Out-Null
            }
        }
        "duplicate-volume" {
            if ($null -ne $currentProject) {
                $currentProject.duplicateVolumeSortOrders.Add([ordered]@{
                    sortOrder = [int]$parts[1]
                    duplicateCount = [int]$parts[2]
                }) | Out-Null
            }
        }
        "duplicate-chapter" {
            if ($null -ne $currentProject) {
                $currentProject.duplicateChapterSortOrders.Add([ordered]@{
                    volumeId = $parts[1]
                    sortOrder = [int]$parts[2]
                    duplicateCount = [int]$parts[3]
                }) | Out-Null
            }
        }
    }
}

$totalVolumes = 0
$totalChapters = 0
$totalChapterWords = 0
$chaptersWithText = 0
$matchingProjectTitles = 0
$matchingChapterTitles = 0
$matchingChapterTexts = 0
$duplicateVolumeSortCount = 0
$duplicateChapterSortCount = 0
foreach ($project in $projects) {
    if (Test-TextContains -Text $project.title -Needle $ExpectProjectTitleContains) {
        $matchingProjectTitles += 1
    }
    $totalVolumes += $project.volumes.Count
    $totalChapters += $project.chapters.Count
    foreach ($chapter in $project.chapters) {
        $totalChapterWords += $chapter.wordCount
        if (![string]::IsNullOrWhiteSpace($chapter.plainText)) {
            $chaptersWithText += 1
        }
        if (Test-TextContains -Text $chapter.title -Needle $ExpectChapterTitleContains) {
            $matchingChapterTitles += 1
        }
        if (Test-TextContains -Text $chapter.plainText -Needle $ExpectChapterTextContains) {
            $matchingChapterTexts += 1
        }
    }
    $duplicateVolumeSortCount += $project.duplicateVolumeSortOrders.Count
    $duplicateChapterSortCount += $project.duplicateChapterSortOrders.Count
}

$inspectionFailures = New-Object System.Collections.Generic.List[string]
if ($summaryProjectCount -lt $MinProjects) {
    $inspectionFailures.Add(("Expected at least {0} project(s), got {1}." -f $MinProjects, $summaryProjectCount)) | Out-Null
}
if ($totalVolumes -lt $MinVolumes) {
    $inspectionFailures.Add(("Expected at least {0} volume(s), got {1}." -f $MinVolumes, $totalVolumes)) | Out-Null
}
if ($totalChapters -lt $MinChapters) {
    $inspectionFailures.Add(("Expected at least {0} chapter(s), got {1}." -f $MinChapters, $totalChapters)) | Out-Null
}
if ($totalChapterWords -lt $MinTotalChapterWords) {
    $inspectionFailures.Add(("Expected at least {0} total chapter word(s), got {1}." -f $MinTotalChapterWords, $totalChapterWords)) | Out-Null
}
if ($RequireChapterText -and $chaptersWithText -lt 1) {
    $inspectionFailures.Add("Expected at least one chapter with non-empty plain text.") | Out-Null
}
if (![string]::IsNullOrWhiteSpace($ExpectProjectTitleContains) -and $matchingProjectTitles -lt 1) {
    $inspectionFailures.Add(("Expected at least one project title containing '{0}'." -f $ExpectProjectTitleContains)) | Out-Null
}
if (![string]::IsNullOrWhiteSpace($ExpectChapterTitleContains) -and $matchingChapterTitles -lt 1) {
    $inspectionFailures.Add(("Expected at least one chapter title containing '{0}'." -f $ExpectChapterTitleContains)) | Out-Null
}
if (![string]::IsNullOrWhiteSpace($ExpectChapterTextContains) -and $matchingChapterTexts -lt 1) {
    $inspectionFailures.Add(("Expected at least one chapter plain text containing '{0}'." -f $ExpectChapterTextContains)) | Out-Null
}
if ($FailOnDuplicateSort -and ($duplicateVolumeSortCount -gt 0 -or $duplicateChapterSortCount -gt 0)) {
    $inspectionFailures.Add(("Duplicate sort warnings detected: volumes={0}, chapters={1}." -f $duplicateVolumeSortCount, $duplicateChapterSortCount)) | Out-Null
}

$report = [pscustomobject]@{
    sessionRoot = $resolvedSessionRoot
    dbPath = $dbPath
    inspectedAt = (Get-Date).ToString("o")
    summary = [pscustomobject]@{
        projects = $summaryProjectCount
        volumes = $totalVolumes
        chapters = $totalChapters
        totalChapterWords = $totalChapterWords
        chaptersWithText = $chaptersWithText
        matchingProjectTitles = $matchingProjectTitles
        matchingChapterTitles = $matchingChapterTitles
        matchingChapterTexts = $matchingChapterTexts
        duplicateVolumeSortWarnings = $duplicateVolumeSortCount
        duplicateChapterSortWarnings = $duplicateChapterSortCount
        passed = $inspectionFailures.Count -eq 0
        failures = @($inspectionFailures.ToArray())
    }
    manifest = $manifest
    projects = @($projects.ToArray())
}

$report | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $reportJsonPath -Encoding UTF8

$markdownLines = New-Object System.Collections.Generic.List[string]
$markdownLines.Add("# Qingyu-Editor Clean Smoke Inspection") | Out-Null
$markdownLines.Add("") | Out-Null
$markdownLines.Add(('- Session root: `{0}`' -f $resolvedSessionRoot)) | Out-Null
$markdownLines.Add(('- DB path: `{0}`' -f $dbPath)) | Out-Null
$markdownLines.Add(('- Inspected at: `{0}`' -f $report.inspectedAt)) | Out-Null
if ($manifest) {
    $markdownLines.Add(('- Started at: `{0}`' -f $manifest.startedAt)) | Out-Null
    $markdownLines.Add(('- PID: `{0}`' -f $manifest.pid)) | Out-Null
}
$markdownLines.Add(('- Projects: `{0}`' -f $summaryProjectCount)) | Out-Null
$markdownLines.Add(('- Volumes: `{0}`' -f $totalVolumes)) | Out-Null
$markdownLines.Add(('- Chapters: `{0}`' -f $totalChapters)) | Out-Null
$markdownLines.Add(('- Total chapter words: `{0}`' -f $totalChapterWords)) | Out-Null
$markdownLines.Add(('- Chapters with text: `{0}`' -f $chaptersWithText)) | Out-Null
$markdownLines.Add(('- Matching project titles: `{0}`' -f $matchingProjectTitles)) | Out-Null
$markdownLines.Add(('- Matching chapter titles: `{0}`' -f $matchingChapterTitles)) | Out-Null
$markdownLines.Add(('- Matching chapter texts: `{0}`' -f $matchingChapterTexts)) | Out-Null
$markdownLines.Add(('- Duplicate volume sort warnings: `{0}`' -f $duplicateVolumeSortCount)) | Out-Null
$markdownLines.Add(('- Duplicate chapter sort warnings: `{0}`' -f $duplicateChapterSortCount)) | Out-Null
$markdownLines.Add(('- Inspection passed: `{0}`' -f ($inspectionFailures.Count -eq 0))) | Out-Null

if ($inspectionFailures.Count -gt 0) {
    $markdownLines.Add("") | Out-Null
    $markdownLines.Add("## Inspection Failures") | Out-Null
    foreach ($failure in $inspectionFailures) {
        $markdownLines.Add(("- {0}" -f $failure)) | Out-Null
    }
}

foreach ($project in $projects) {
    $markdownLines.Add("") | Out-Null
    $markdownLines.Add(("## {0}" -f $project.title)) | Out-Null
    $markdownLines.Add(('- Status: `{0}`' -f $project.status)) | Out-Null
    $markdownLines.Add(('- Word count: `{0}`' -f $project.wordCount)) | Out-Null
    $markdownLines.Add(('- Updated at: `{0}`' -f $project.updatedAt)) | Out-Null

    if ($project.volumes.Count -gt 0) {
        $markdownLines.Add("") | Out-Null
        $markdownLines.Add("### Volumes") | Out-Null
        foreach ($volume in $project.volumes) {
            $markdownLines.Add(('- `{0}` order={1} id=`{2}`' -f $volume.title, $volume.sortOrder, $volume.id)) | Out-Null
        }
    }

    if ($project.chapters.Count -gt 0) {
        $markdownLines.Add("") | Out-Null
        $markdownLines.Add("### Chapters") | Out-Null
        foreach ($chapter in $project.chapters) {
            $chapterVolume = if ([string]::IsNullOrWhiteSpace($chapter.volumeId)) { "(root)" } else { $chapter.volumeId }
            $markdownLines.Add(('- `{0}` volume=`{1}` order={2} words={3} preview=`{4}`' -f $chapter.title, $chapterVolume, $chapter.sortOrder, $chapter.wordCount, $chapter.preview)) | Out-Null
        }
    }

    if ($project.duplicateVolumeSortOrders.Count -gt 0 -or $project.duplicateChapterSortOrders.Count -gt 0) {
        $markdownLines.Add("") | Out-Null
        $markdownLines.Add("### Duplicate Sort Warnings") | Out-Null
        foreach ($duplicateVolume in $project.duplicateVolumeSortOrders) {
            $markdownLines.Add(('- Volume sort `{0}` duplicated `{1}` times' -f $duplicateVolume.sortOrder, $duplicateVolume.duplicateCount)) | Out-Null
        }
        foreach ($duplicateChapter in $project.duplicateChapterSortOrders) {
            $chapterVolume = if ([string]::IsNullOrWhiteSpace($duplicateChapter.volumeId)) { "(root)" } else { $duplicateChapter.volumeId }
            $markdownLines.Add(('- Chapter volume=`{0}` sort `{1}` duplicated `{2}` times' -f $chapterVolume, $duplicateChapter.sortOrder, $duplicateChapter.duplicateCount)) | Out-Null
        }
    }
}

$markdownLines | Set-Content -LiteralPath $reportMarkdownPath -Encoding UTF8

Write-Host ""
Write-Host "Qingyu-Editor clean smoke inspection" -ForegroundColor Cyan
Write-Host ""
Write-Host ("  Session root: {0}" -f $resolvedSessionRoot)
Write-Host ("  DB path     : {0}" -f $dbPath)
if ($manifest) {
    Write-Host ("  Started at  : {0}" -f $manifest.startedAt)
    Write-Host ("  PID         : {0}" -f $manifest.pid)
}
Write-Host ""
if ($lines.Count -eq 0) {
    Write-Host "No smoke evidence found in the database yet." -ForegroundColor Yellow
    if ($inspectionFailures.Count -gt 0) {
        Write-Host "Inspection failed:" -ForegroundColor Red
        foreach ($failure in $inspectionFailures) {
            Write-Host ("  - {0}" -f $failure) -ForegroundColor Red
        }
        exit 1
    }
    return
}

Write-Host ("  Projects: {0}" -f $summaryProjectCount) -ForegroundColor Yellow
Write-Host ("  Volumes : {0}" -f $totalVolumes) -ForegroundColor Yellow
Write-Host ("  Chapters: {0}" -f $totalChapters) -ForegroundColor Yellow
Write-Host ("  Words   : {0}" -f $totalChapterWords) -ForegroundColor Yellow
Write-Host ("  Text ch.: {0}" -f $chaptersWithText) -ForegroundColor Yellow
if (![string]::IsNullOrWhiteSpace($ExpectProjectTitleContains)) {
    Write-Host ("  Project title matches: {0}" -f $matchingProjectTitles) -ForegroundColor Yellow
}
if (![string]::IsNullOrWhiteSpace($ExpectChapterTitleContains)) {
    Write-Host ("  Chapter title matches: {0}" -f $matchingChapterTitles) -ForegroundColor Yellow
}
if (![string]::IsNullOrWhiteSpace($ExpectChapterTextContains)) {
    Write-Host ("  Chapter text matches : {0}" -f $matchingChapterTexts) -ForegroundColor Yellow
}
Write-Host ("  Report md  : {0}" -f $reportMarkdownPath)
Write-Host ("  Report json: {0}" -f $reportJsonPath)
Write-Host ""

foreach ($project in $projects) {
    Write-Host ("[Project] {0} | status={1} | words={2} | updated={3}" -f $project.title, $project.status, $project.wordCount, $project.updatedAt) -ForegroundColor Yellow
    foreach ($volume in $project.volumes) {
        Write-Host ("  - Volume  {0} | order={1} | id={2}" -f $volume.title, $volume.sortOrder, $volume.id)
    }
    foreach ($chapter in $project.chapters) {
        $chapterVolume = if ([string]::IsNullOrWhiteSpace($chapter.volumeId)) { "(root)" } else { $chapter.volumeId }
        Write-Host ("    * Chapter {0} | volume={1} | order={2} | words={3} | preview={4}" -f $chapter.title, $chapterVolume, $chapter.sortOrder, $chapter.wordCount, $chapter.preview)
    }
    foreach ($duplicateVolume in $project.duplicateVolumeSortOrders) {
        Write-Host ("    ! Duplicate volume sort order={0} count={1}" -f $duplicateVolume.sortOrder, $duplicateVolume.duplicateCount) -ForegroundColor Red
    }
    foreach ($duplicateChapter in $project.duplicateChapterSortOrders) {
        $chapterVolume = if ([string]::IsNullOrWhiteSpace($duplicateChapter.volumeId)) { "(root)" } else { $duplicateChapter.volumeId }
        Write-Host ("    ! Duplicate chapter volume={0} sort order={1} count={2}" -f $chapterVolume, $duplicateChapter.sortOrder, $duplicateChapter.duplicateCount) -ForegroundColor Red
    }
    if ($project.duplicateVolumeSortOrders.Count -eq 0 -and $project.duplicateChapterSortOrders.Count -eq 0) {
        Write-Host "    ! No duplicate sort warnings detected." -ForegroundColor DarkGray
    }
    Write-Host ""
}

if ($inspectionFailures.Count -gt 0) {
    Write-Host "Inspection failed:" -ForegroundColor Red
    foreach ($failure in $inspectionFailures) {
        Write-Host ("  - {0}" -f $failure) -ForegroundColor Red
    }
    exit 1
}

Write-Host "Inspection passed." -ForegroundColor Green
