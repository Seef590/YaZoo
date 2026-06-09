[CmdletBinding()]
param(
    [int] $DailyDays = 7,
    [int] $WeeklyWeeks = 4,
    [int] $MonthlyMonths = 3,
    [switch] $DryRun,
    [switch] $Quiet
)

$ErrorActionPreference = 'Stop'
. "$PSScriptRoot\BackupCommon.ps1"

$repoRoot = Get-YazooRepoRoot
$backupRoot = Ensure-BackupLayout $repoRoot
$mysqlDir = Join-Path $backupRoot 'mysql'
$now = Get-Date
$keep = New-Object 'System.Collections.Generic.HashSet[string]'

$backups = Get-ChildItem -LiteralPath $mysqlDir -Filter 'yazoo_backup_*.sql.gz' -File |
    Sort-Object LastWriteTimeUtc -Descending

foreach ($backup in $backups) {
    $age = $now - $backup.LastWriteTime

    if ($age.TotalDays -le $DailyDays) {
        [void] $keep.Add($backup.FullName)
    }
}

$weeklyLimit = $now.AddDays(-7 * $WeeklyWeeks)
$weeklyGroups = $backups |
    Where-Object { $_.LastWriteTime -lt $now.AddDays(-$DailyDays) -and $_.LastWriteTime -ge $weeklyLimit } |
    Group-Object { '{0:yyyy}-{1:00}' -f $_.LastWriteTime.Year, [System.Globalization.ISOWeek]::GetWeekOfYear($_.LastWriteTime) }

foreach ($group in $weeklyGroups) {
    $candidate = $group.Group | Sort-Object LastWriteTimeUtc -Descending | Select-Object -First 1
    if ($candidate) {
        [void] $keep.Add($candidate.FullName)
    }
}

$monthlyLimit = $now.AddMonths(-$MonthlyMonths)
$monthlyGroups = $backups |
    Where-Object { $_.LastWriteTime -lt $weeklyLimit -and $_.LastWriteTime -ge $monthlyLimit } |
    Group-Object { $_.LastWriteTime.ToString('yyyy-MM') }

foreach ($group in $monthlyGroups) {
    $candidate = $group.Group | Sort-Object LastWriteTimeUtc -Descending | Select-Object -First 1
    if ($candidate) {
        [void] $keep.Add($candidate.FullName)
    }
}

$deleteCandidates = $backups | Where-Object { -not $keep.Contains($_.FullName) }

if (-not $deleteCandidates) {
    Write-BackupLog -Message 'Retention cleanup completed: no backups eligible for deletion.' -Quiet:$Quiet
    return
}

foreach ($candidate in $deleteCandidates) {
    Assert-PathInside -Root $mysqlDir -Path $candidate.FullName
    if ($DryRun) {
        Write-BackupLog -Message "Retention dry-run would delete $($candidate.Name)" -Quiet:$Quiet
        continue
    }

    Remove-Item -LiteralPath $candidate.FullName -Force
    Write-BackupLog -Message "Retention deleted old backup $($candidate.Name)" -Quiet:$Quiet
}

