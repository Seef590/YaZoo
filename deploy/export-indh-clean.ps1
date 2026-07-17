#!/usr/bin/env pwsh
[CmdletBinding()]
param(
    [string] $OutputDirectory = "",
    [switch] $KeepTemp
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$dateStamp = Get-Date -Format "yyyy-MM-dd"
$zipName = "YaZoo_INDH_CLEAN_$dateStamp.zip"
$outputRoot = if ($OutputDirectory) {
    (Resolve-Path -LiteralPath $OutputDirectory).Path
} else {
    $repoRoot
}
$zipPath = Join-Path $outputRoot $zipName
$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("YaZoo_INDH_CLEAN_" + [Guid]::NewGuid().ToString("N"))
$tempProject = Join-Path $tempRoot "YaZoo"

$blockedDirectoryNames = @(
    ".git",
    "node_modules",
    "vendor",
    "dist",
    "coverage",
    ".scannerwork",
    "backups",
    "test-results",
    "playwright-report"
)

$blockedRelativeDirectories = @(
    "frontend/dist",
    "backend/storage/logs",
    "storage/logs",
    "storage/framework/cache",
    "storage/framework/sessions"
)

$blockedExtensions = @(
    ".sql",
    ".dump",
    ".bak",
    ".backup",
    ".log",
    ".zip",
    ".tar",
    ".gz",
    ".7z",
    ".pem",
    ".key",
    ".tmp",
    ".temp",
    ".swp",
    ".swo",
    ".cookie",
    ".cookies",
    ".har"
)

$blockedExactNames = @(
    ".env",
    ".DS_Store",
    "Thumbs.db",
    "desktop.ini",
    "sonar-issues.json",
    "sonar-hotspots.json"
)

$excluded = New-Object System.Collections.Generic.List[string]
$copiedCount = 0
$exclusionCategories = [ordered]@{
    secrets = 0
    dependencies = 0
    buildArtifacts = 0
    logsBackupsDumps = 0
    archives = 0
    temp = 0
    scanner = 0
}

function Convert-ToZipPath {
    param([Parameter(Mandatory)][string] $Path)

    return ($Path -replace "\\", "/").TrimStart("/")
}

function Test-IsBlockedPath {
    param(
        [Parameter(Mandatory)][System.IO.FileInfo] $File,
        [Parameter(Mandatory)][string] $RelativePath
    )

    $zipPathStyle = Convert-ToZipPath $RelativePath
    $parts = $zipPathStyle -split "/"
    $lowerName = $File.Name.ToLowerInvariant()
    $extension = $File.Extension.ToLowerInvariant()

    if ($blockedExactNames -contains $File.Name) {
        Add-ExclusionCategory -File $File -RelativePath $RelativePath
        return $true
    }

    if ($lowerName -eq ".env" -or $lowerName.StartsWith(".env.")) {
        Add-ExclusionCategory -File $File -RelativePath $RelativePath
        return $true
    }

    if ($lowerName.StartsWith("~") -or $lowerName.EndsWith("~")) {
        $script:exclusionCategories.temp++
        return $true
    }

    if ($blockedExtensions -contains $extension) {
        Add-ExclusionCategory -File $File -RelativePath $RelativePath
        return $true
    }

    foreach ($part in $parts) {
        if ($blockedDirectoryNames -contains $part) {
            Add-ExclusionCategory -File $File -RelativePath $RelativePath
            return $true
        }
    }

    foreach ($blockedRelativeDirectory in $blockedRelativeDirectories) {
        $blocked = (Convert-ToZipPath $blockedRelativeDirectory).TrimEnd("/")
        if ($zipPathStyle.Equals($blocked, [System.StringComparison]::OrdinalIgnoreCase) -or
            $zipPathStyle.StartsWith($blocked + "/", [System.StringComparison]::OrdinalIgnoreCase)) {
            Add-ExclusionCategory -File $File -RelativePath $RelativePath
            return $true
        }
    }

    return $false
}

function Add-ExclusionCategory {
    param(
        [Parameter(Mandatory)][System.IO.FileInfo] $File,
        [Parameter(Mandatory)][string] $RelativePath
    )

    $path = (Convert-ToZipPath $RelativePath).ToLowerInvariant()
    $name = $File.Name.ToLowerInvariant()
    $extension = $File.Extension.ToLowerInvariant()

    if ($name -eq ".env" -or $name.StartsWith(".env.") -or $extension -in @(".pem", ".key", ".cookie", ".cookies")) {
        $script:exclusionCategories.secrets++
    } elseif ($path -match "(^|/)(node_modules|vendor)(/|$)") {
        $script:exclusionCategories.dependencies++
    } elseif ($path -match "(^|/)(dist|coverage|test-results|playwright-report)(/|$)") {
        $script:exclusionCategories.buildArtifacts++
    } elseif ($path -match "(^|/)(backups|logs)(/|$)" -or $extension -in @(".sql", ".dump", ".bak", ".backup", ".log", ".gz")) {
        $script:exclusionCategories.logsBackupsDumps++
    } elseif ($path -match "(^|/)(.scannerwork)(/|$)" -or $name -in @("sonar-issues.json", "sonar-hotspots.json")) {
        $script:exclusionCategories.scanner++
    } elseif ($extension -in @(".zip", ".tar", ".7z")) {
        $script:exclusionCategories.archives++
    } else {
        $script:exclusionCategories.temp++
    }
}

function Test-SecretLikeContent {
    param([Parameter(Mandatory)][string] $Path)

    $name = [System.IO.Path]::GetFileName($Path).ToLowerInvariant()
    if ($name.EndsWith(".env.example")) {
        return $false
    }

    $extension = [System.IO.Path]::GetExtension($Path).ToLowerInvariant()
    if ($extension -notin @(".php", ".js", ".jsx", ".ts", ".tsx", ".json", ".yml", ".yaml", ".md", ".ps1", ".sh", ".conf", ".example")) {
        return $false
    }

    $content = Get-Content -LiteralPath $Path -Raw -ErrorAction SilentlyContinue
    if (-not $content) {
        return $false
    }

    $sanitized = $content -replace "(?im)^\s*(param|function)\b.*$", ""
    $sanitized = $sanitized -replace "(?im)^\s*[A-Za-z0-9_.-]*password[A-Za-z0-9_.-]*\s*:\s*['""][^'""]+['""],?\s*$", ""
    $sanitized = $sanitized -replace "(?im)^\s*[A-Za-z0-9_.-]*token[A-Za-z0-9_.-]*\s*:\s*['""][^'""]+['""],?\s*$", ""

    return ($sanitized -match "(?i)(api[_-]?key|secret|client[_-]?secret|access[_-]?token|refresh[_-]?token|bearer)\s*[:=]\s*['""](?!\$)[^'""]{12,}['""]")
}

function Test-IsForbiddenZipEntry {
    param([Parameter(Mandatory)][string] $EntryName)

    $entryPath = Convert-ToZipPath $EntryName
    $name = [System.IO.Path]::GetFileName($entryPath)
    $extension = [System.IO.Path]::GetExtension($entryPath).ToLowerInvariant()
    $parts = $entryPath -split "/"
    $lowerName = $name.ToLowerInvariant()

    if ($blockedExactNames -contains $name) {
        return $true
    }

    if ($lowerName -eq ".env" -or $lowerName.StartsWith(".env.")) {
        return $true
    }

    if ($lowerName.StartsWith("~") -or $lowerName.EndsWith("~")) {
        return $true
    }

    if ($blockedExtensions -contains $extension) {
        return $true
    }

    foreach ($part in $parts) {
        if ($blockedDirectoryNames -contains $part) {
            return $true
        }
    }

    foreach ($blockedRelativeDirectory in $blockedRelativeDirectories) {
        $blocked = (Convert-ToZipPath $blockedRelativeDirectory).TrimEnd("/")
        if ($entryPath.Equals($blocked, [System.StringComparison]::OrdinalIgnoreCase) -or
            $entryPath.StartsWith($blocked + "/", [System.StringComparison]::OrdinalIgnoreCase) -or
            $entryPath.StartsWith("YaZoo/" + $blocked + "/", [System.StringComparison]::OrdinalIgnoreCase)) {
            return $true
        }
    }

    return $false
}

try {
    New-Item -ItemType Directory -Path $tempProject -Force | Out-Null

    Get-ChildItem -LiteralPath $repoRoot -Recurse -Force -File | ForEach-Object {
        $relative = $_.FullName.Substring($repoRoot.Length + 1)

        if (Test-IsBlockedPath -File $_ -RelativePath $relative) {
            $excluded.Add($relative) | Out-Null
            return
        }

        $destination = Join-Path $tempProject $relative
        $destinationDirectory = Split-Path -Parent $destination
        New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
        Copy-Item -LiteralPath $_.FullName -Destination $destination -Force
        $script:copiedCount++
    }

    if (Test-Path -LiteralPath $zipPath) {
        Remove-Item -LiteralPath $zipPath -Force
    }

    Compress-Archive -LiteralPath $tempProject -DestinationPath $zipPath -CompressionLevel Optimal

    $secretHits = @(Get-ChildItem -LiteralPath $tempProject -Recurse -Force -File | Where-Object {
        Test-SecretLikeContent -Path $_.FullName
    })

    if ($secretHits.Count -gt 0) {
        $relativeSecretHits = @($secretHits | ForEach-Object { $_.FullName.Substring($tempProject.Length + 1) })
        Write-Host "Fichiers suspects: $($relativeSecretHits -join ', ')"
        Write-Error "Export refuse: scan de secrets positif dans $($secretHits.Count) fichier(s)."
        exit 1
    }

    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
    try {
        $entries = @($zip.Entries | Where-Object { -not $_.FullName.EndsWith("/") })
        $forbiddenEntries = @($entries | Where-Object { Test-IsForbiddenZipEntry -EntryName $_.FullName })
    } finally {
        $zip.Dispose()
    }

    if ($forbiddenEntries.Count -gt 0) {
        Write-Error "Export refuse: le ZIP contient des elements interdits: $($forbiddenEntries.FullName -join ', ')"
        exit 1
    }

    $zipItem = Get-Item -LiteralPath $zipPath
    Write-Host "Export INDH YaZoo termine."
    Write-Host "Fichier: $($zipItem.Name)"
    Write-Host "Fichiers inclus: $($entries.Count)"
    Write-Host "Taille octets: $($zipItem.Length)"
    $categorySummary = ($exclusionCategories.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ', '
    Write-Host "Categories exclues: $categorySummary"
    Write-Host "Statut: OK - aucun element interdit detecte dans le ZIP."
} finally {
    if (-not $KeepTemp -and (Test-Path -LiteralPath $tempRoot)) {
        Remove-Item -LiteralPath $tempRoot -Recurse -Force
    } elseif ($KeepTemp) {
        Write-Host "Dossier temporaire conserve: $tempRoot"
    }
}
