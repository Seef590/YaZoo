Set-StrictMode -Version Latest

function Get-YazooRepoRoot {
    return (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
}

function Get-BackupRoot {
    param([string] $RepoRoot = (Get-YazooRepoRoot))

    return Join-Path $RepoRoot 'infra\backups'
}

function Ensure-BackupLayout {
    param([string] $RepoRoot = (Get-YazooRepoRoot))

    $backupRoot = Get-BackupRoot $RepoRoot
    foreach ($path in @(
        $backupRoot,
        (Join-Path $backupRoot 'mysql'),
        (Join-Path $backupRoot 'redis'),
        (Join-Path $backupRoot 'snapshots'),
        (Join-Path $backupRoot 'logs')
    )) {
        if (-not (Test-Path -LiteralPath $path)) {
            New-Item -ItemType Directory -Path $path | Out-Null
        }
    }

    return $backupRoot
}

function Write-BackupLog {
    param(
        [string] $Message,
        [ValidateSet('INFO', 'WARN', 'ERROR')]
        [string] $Level = 'INFO',
        [string] $LogName = 'backup.log',
        [switch] $Quiet
    )

    $repoRoot = Get-YazooRepoRoot
    $backupRoot = Ensure-BackupLayout $repoRoot
    $logPath = Join-Path (Join-Path $backupRoot 'logs') $LogName
    $line = '{0} [{1}] {2}' -f (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssK'), $Level, $Message
    Add-Content -LiteralPath $logPath -Value $line -Encoding UTF8

    if (-not $Quiet) {
        Write-Host $line
    }
}

function Assert-DockerAvailable {
    docker version *> $null
    if ($LASTEXITCODE -ne 0) {
        throw 'Docker is not reachable. Start Docker Desktop and retry.'
    }
}

function Get-DockerContainer {
    param(
        [Parameter(Mandatory)]
        [string] $Service,
        [Parameter(Mandatory)]
        [string] $FallbackName,
        [string] $RepoRoot = (Get-YazooRepoRoot)
    )

    Assert-DockerAvailable

    $containerId = $null
    Push-Location $RepoRoot
    try {
        $containerId = @(& docker compose ps -q $Service 2>$null) | Select-Object -First 1
    } catch {
        $containerId = $null
    } finally {
        Pop-Location
    }

    if ($containerId) {
        return $containerId.Trim()
    }

    $containerId = @(& docker ps --filter "name=$FallbackName" --format '{{.ID}}' 2>$null) | Select-Object -First 1
    if ($containerId) {
        return $containerId.Trim()
    }

    throw "Could not find a running Docker container for service '$Service'."
}

function Assert-ContainerRunning {
    param([Parameter(Mandatory)][string] $Container)

    $running = @(& docker inspect -f '{{.State.Running}}' $Container 2>$null) | Select-Object -First 1
    if ($LASTEXITCODE -ne 0 -or $running -ne 'true') {
        throw "Docker container '$Container' is not running."
    }
}

function Get-LatestMySqlBackup {
    param([string] $RepoRoot = (Get-YazooRepoRoot))

    $backupDir = Join-Path (Get-BackupRoot $RepoRoot) 'mysql'
    if (-not (Test-Path -LiteralPath $backupDir)) {
        return $null
    }

    return Get-ChildItem -LiteralPath $backupDir -Filter 'yazoo_backup_*.sql.gz' -File |
        Sort-Object LastWriteTimeUtc -Descending |
        Select-Object -First 1
}

function Test-GzipFile {
    param([Parameter(Mandatory)][string] $Path)

    $buffer = New-Object byte[] 65536
    $file = [System.IO.File]::OpenRead($Path)
    try {
        $gzip = [System.IO.Compression.GzipStream]::new($file, [System.IO.Compression.CompressionMode]::Decompress)
        try {
            while ($gzip.Read($buffer, 0, $buffer.Length) -gt 0) {}
        } finally {
            $gzip.Dispose()
        }
    } finally {
        $file.Dispose()
    }

    return $true
}

function Read-GzipTextPrefix {
    param(
        [Parameter(Mandatory)][string] $Path,
        [int] $Bytes = 131072
    )

    $buffer = New-Object byte[] $Bytes
    $file = [System.IO.File]::OpenRead($Path)
    try {
        $gzip = [System.IO.Compression.GzipStream]::new($file, [System.IO.Compression.CompressionMode]::Decompress)
        try {
            $read = $gzip.Read($buffer, 0, $buffer.Length)
            return [System.Text.Encoding]::UTF8.GetString($buffer, 0, $read)
        } finally {
            $gzip.Dispose()
        }
    } finally {
        $file.Dispose()
    }
}

function Assert-PathInside {
    param(
        [Parameter(Mandatory)][string] $Root,
        [Parameter(Mandatory)][string] $Path
    )

    $rootFull = [System.IO.Path]::GetFullPath($Root).TrimEnd('\') + '\'
    $pathFull = [System.IO.Path]::GetFullPath($Path)

    if (-not $pathFull.StartsWith($rootFull, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to operate outside backup root: $pathFull"
    }
}

