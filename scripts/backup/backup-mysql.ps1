[CmdletBinding()]
param(
    [string] $OutputDirectory,
    [switch] $NoCleanup,
    [switch] $SkipVerify,
    [switch] $Quiet
)

$ErrorActionPreference = 'Stop'
. "$PSScriptRoot\BackupCommon.ps1"

$repoRoot = Get-YazooRepoRoot
$backupRoot = Ensure-BackupLayout $repoRoot
$mysqlDir = if ($OutputDirectory) { $OutputDirectory } else { Join-Path $backupRoot 'mysql' }

if (-not (Test-Path -LiteralPath $mysqlDir)) {
    New-Item -ItemType Directory -Path $mysqlDir | Out-Null
}

$container = Get-DockerContainer -Service 'mysql' -FallbackName 'yazoo_v2-mysql-1' -RepoRoot $repoRoot
Assert-ContainerRunning $container

$timestamp = Get-Date -Format 'yyyy-MM-dd_HH-mm'
$backupFile = Join-Path $mysqlDir "yazoo_backup_$timestamp.sql.gz"
if (Test-Path -LiteralPath $backupFile) {
    throw "Refusing to overwrite existing backup file: $backupFile"
}

$dumpCommand = 'set -e; MYSQL_PWD="$MYSQL_PASSWORD" mysqldump --single-transaction --quick --routines --triggers --events --hex-blob --default-character-set=utf8mb4 -u"$MYSQL_USER" "$MYSQL_DATABASE" | gzip -c'

Write-BackupLog -Message "Starting MySQL backup to $backupFile" -Quiet:$Quiet

try {
    function Join-ProcessArguments {
        param([string[]] $Arguments)

        return ($Arguments | ForEach-Object {
            '"' + ($_ -replace '\\', '\\' -replace '"', '\"') + '"'
        }) -join ' '
    }

    $processInfo = [System.Diagnostics.ProcessStartInfo]::new()
    $processInfo.FileName = 'docker'
    $processInfo.Arguments = Join-ProcessArguments @('exec', $container, 'sh', '-lc', $dumpCommand)
    $processInfo.UseShellExecute = $false
    $processInfo.RedirectStandardOutput = $true
    $processInfo.RedirectStandardError = $true

    $process = [System.Diagnostics.Process]::new()
    $process.StartInfo = $processInfo
    $fileStream = [System.IO.File]::Create($backupFile)

    try {
        [void] $process.Start()
        $stderrTask = $process.StandardError.ReadToEndAsync()
        $process.StandardOutput.BaseStream.CopyTo($fileStream)
        $process.WaitForExit()
        $stderr = $stderrTask.Result

        if ($process.ExitCode -ne 0) {
            throw "mysqldump failed inside Docker container. $stderr"
        }
    } finally {
        $fileStream.Dispose()
        $process.Dispose()
    }

    $backupItem = Get-Item -LiteralPath $backupFile
    if ($backupItem.Length -lt 1024) {
        throw "Backup file is unexpectedly small ($($backupItem.Length) bytes)."
    }

    if (-not $SkipVerify) {
        Test-GzipFile -Path $backupFile | Out-Null
    }

    Write-BackupLog -Message "MySQL backup completed: $($backupItem.Name), size=$($backupItem.Length) bytes" -Quiet:$Quiet

    if (-not $NoCleanup) {
        & "$PSScriptRoot\cleanup-old-backups.ps1" -Quiet:$Quiet
    }

    Write-Output $backupFile
} catch {
    if (Test-Path -LiteralPath $backupFile) {
        Remove-Item -LiteralPath $backupFile -Force
    }
    Write-BackupLog -Message "MySQL backup failed: $($_.Exception.Message)" -Level ERROR -Quiet:$Quiet
    throw
}
