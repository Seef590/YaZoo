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
    "backups"
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
    ".swo"
)

$blockedExactNames = @(
    ".env",
    ".DS_Store",
    "Thumbs.db",
    "desktop.ini"
)

$excluded = New-Object System.Collections.Generic.List[string]
$copiedCount = 0

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
        if ($zipPathStyle.Equals($blocked, [System.StringComparison]::OrdinalIgnoreCase) -or
            $zipPathStyle.StartsWith($blocked + "/", [System.StringComparison]::OrdinalIgnoreCase)) {
            return $true
        }
    }

    return $false
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

    Write-Host "Export INDH YaZoo termine."
    Write-Host "ZIP: $zipPath"
    Write-Host "Fichiers inclus: $($entries.Count)"
    Write-Host "Fichiers copies: $copiedCount"
    Write-Host "Elements exclus: $($excluded.Count)"
    Write-Host "Statut: OK - aucun element interdit detecte dans le ZIP."
} finally {
    if (-not $KeepTemp -and (Test-Path -LiteralPath $tempRoot)) {
        Remove-Item -LiteralPath $tempRoot -Recurse -Force
    } elseif ($KeepTemp) {
        Write-Host "Dossier temporaire conserve: $tempRoot"
    }
}
