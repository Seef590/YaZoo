[CmdletBinding()]
param(
    [string] $BackupFile,
    [int] $MaxAgeHours = 26,
    [long] $MinBytes = 1024,
    [switch] $Quiet
)

$ErrorActionPreference = 'Stop'
. "$PSScriptRoot\BackupCommon.ps1"

$repoRoot = Get-YazooRepoRoot
$backupRoot = Ensure-BackupLayout $repoRoot
$mysqlDir = Join-Path $backupRoot 'mysql'
$reportPath = Join-Path (Join-Path $backupRoot 'logs') 'health-report.txt'
$issues = New-Object 'System.Collections.Generic.List[string]'

if (-not $BackupFile) {
    $latest = Get-LatestMySqlBackup $repoRoot
    if (-not $latest) {
        throw 'No MySQL backup files found.'
    }
    $BackupFile = $latest.FullName
}

if (-not (Test-Path -LiteralPath $BackupFile)) {
    throw "Backup file not found: $BackupFile"
}

$backup = Get-Item -LiteralPath $BackupFile
if ($backup.Length -lt $MinBytes) {
    $issues.Add("Backup size is below minimum threshold: $($backup.Length) bytes")
}

if (((Get-Date) - $backup.LastWriteTime).TotalHours -gt $MaxAgeHours) {
    $issues.Add("Latest backup is older than $MaxAgeHours hours")
}

try {
    Test-GzipFile -Path $backup.FullName | Out-Null
} catch {
    $issues.Add("Gzip integrity failed: $($_.Exception.Message)")
}

try {
    $prefix = Read-GzipTextPrefix -Path $backup.FullName
    if ($prefix -notmatch 'CREATE TABLE|INSERT INTO|Table structure for table') {
        $issues.Add('SQL validity check did not find expected dump markers')
    }
} catch {
    $issues.Add("SQL preview failed: $($_.Exception.Message)")
}

$previous = @(Get-ChildItem -LiteralPath $mysqlDir -Filter 'yazoo_backup_*.sql.gz' -File |
    Where-Object { $_.FullName -ne $backup.FullName } |
    Sort-Object LastWriteTimeUtc -Descending |
    Select-Object -First 5)

if ($previous.Count -gt 0) {
    $avg = ($previous | Measure-Object -Property Length -Average).Average
    if ($avg -gt 0 -and $backup.Length -lt ($avg * 0.25)) {
        $issues.Add("Backup size anomaly: latest is less than 25 percent of recent average")
    }
}

$status = if ($issues.Count -eq 0) { 'PASS' } else { 'WARN' }
$lines = @(
    "Backup health report generated at $(Get-Date -Format 'yyyy-MM-ddTHH:mm:ssK')",
    "Status: $status",
    "Backup: $($backup.Name)",
    "SizeBytes: $($backup.Length)",
    "AgeHours: $([math]::Round(((Get-Date) - $backup.LastWriteTime).TotalHours, 2))",
    "Issues:"
)

if ($issues.Count -eq 0) {
    $lines += '  none'
} else {
    foreach ($issue in $issues) {
        $lines += "  - $issue"
    }
}

Set-Content -LiteralPath $reportPath -Value $lines -Encoding UTF8
Write-BackupLog -Message "Backup health verification $status for $($backup.Name)" -LogName 'health.log' -Quiet:$Quiet

if (-not $Quiet) {
    $lines | ForEach-Object { Write-Host $_ }
}

if ($issues.Count -gt 0) {
    exit 2
}
