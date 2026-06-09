[CmdletBinding()]
param(
    [string] $BackupFile,
    [switch] $TestOnly,
    [switch] $Force,
    [switch] $KeepTestDatabase,
    [switch] $Quiet
)

$ErrorActionPreference = 'Stop'
. "$PSScriptRoot\BackupCommon.ps1"

function Select-BackupFile {
    param([string] $RepoRoot)

    $mysqlDir = Join-Path (Get-BackupRoot $RepoRoot) 'mysql'
    $backups = @(Get-ChildItem -LiteralPath $mysqlDir -Filter 'yazoo_backup_*.sql.gz' -File |
        Sort-Object LastWriteTimeUtc -Descending)

    if ($backups.Count -eq 0) {
        throw 'No MySQL backups are available.'
    }

    Write-Host 'Available backups:'
    for ($i = 0; $i -lt $backups.Count; $i++) {
        Write-Host ("[{0}] {1} ({2} bytes, {3})" -f ($i + 1), $backups[$i].Name, $backups[$i].Length, $backups[$i].LastWriteTime)
    }

    $selection = Read-Host 'Choose backup number'
    $index = [int] $selection - 1
    if ($index -lt 0 -or $index -ge $backups.Count) {
        throw 'Invalid backup selection.'
    }

    return $backups[$index].FullName
}

function Invoke-MySqlRestore {
    param(
        [string] $Container,
        [string] $BackupPath,
        [string] $Database,
        [switch] $Admin
    )

    $containerBackup = '/tmp/yazoo_restore.sql.gz'
    & docker cp $BackupPath "${Container}:$containerBackup"
    if ($LASTEXITCODE -ne 0) {
        throw 'Failed to copy backup into MySQL container.'
    }

    try {
        if ($Database -notmatch '^[A-Za-z0-9_]+$') {
            throw "Unsafe database name: $Database"
        }

        $mysqlClient = if ($Admin) { 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -uroot' } else { 'MYSQL_PWD="$MYSQL_PASSWORD" mysql -u"$MYSQL_USER"' }
        $restoreCommand = 'set -e; gzip -dc /tmp/yazoo_restore.sql.gz | ' + $mysqlClient + ' ' + $Database
        & docker exec $Container sh -lc $restoreCommand
        if ($LASTEXITCODE -ne 0) {
            throw "Restore into database '$Database' failed."
        }
    } finally {
        & docker exec $Container sh -lc 'rm -f /tmp/yazoo_restore.sql.gz' *> $null
    }
}

function Invoke-MySqlSql {
    param(
        [string] $Container,
        [string] $Sql,
        [switch] $Admin
    )

    try {
        $Sql | & docker exec -i $Container sh -lc 'cat > /tmp/yazoo_cmd.sql'
        if ($LASTEXITCODE -ne 0) {
            throw 'Failed to copy SQL command into MySQL container.'
        }

        $mysqlClient = if ($Admin) { 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -uroot' } else { 'MYSQL_PWD="$MYSQL_PASSWORD" mysql -u"$MYSQL_USER"' }
        & docker exec $Container sh -lc "$mysqlClient < /tmp/yazoo_cmd.sql"
        if ($LASTEXITCODE -ne 0) {
            throw 'MySQL SQL command failed.'
        }
    } finally {
        & docker exec $Container sh -lc 'rm -f /tmp/yazoo_cmd.sql' *> $null
    }
}

function Invoke-MySqlScalar {
    param(
        [string] $Container,
        [string] $Sql,
        [switch] $Admin
    )

    try {
        $Sql | & docker exec -i $Container sh -lc 'cat > /tmp/yazoo_cmd.sql'
        if ($LASTEXITCODE -ne 0) {
            throw 'Failed to copy SQL command into MySQL container.'
        }

        $mysqlClient = if ($Admin) { 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysql -N -uroot' } else { 'MYSQL_PWD="$MYSQL_PASSWORD" mysql -N -u"$MYSQL_USER"' }
        $value = @(& docker exec $Container sh -lc "$mysqlClient < /tmp/yazoo_cmd.sql") | Select-Object -Last 1
        if ($LASTEXITCODE -ne 0) {
            throw 'MySQL scalar command failed.'
        }

        return $value
    } finally {
        & docker exec $Container sh -lc 'rm -f /tmp/yazoo_cmd.sql' *> $null
    }
}

function Test-MySqlAdminAccess {
    param([string] $Container)

    & docker exec $Container sh -lc 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysqladmin ping -h127.0.0.1 -uroot >/dev/null 2>&1'
    return ($LASTEXITCODE -eq 0)
}

function Wait-MySqlContainerReady {
    param([string] $Container)

    for ($attempt = 0; $attempt -lt 90; $attempt++) {
        & docker exec $Container sh -lc 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" mysqladmin ping -h127.0.0.1 -uroot >/dev/null 2>&1'
        if ($LASTEXITCODE -eq 0) {
            return
        }

        Start-Sleep -Seconds 1
    }

    throw "Timed out waiting for temporary MySQL container '$Container' to become ready."
}

function Invoke-TestRestore {
    param(
        [string] $Container,
        [string] $BackupPath,
        [switch] $KeepDatabase
    )

    $testDb = 'yazoo_restore_test_' + (Get-Date -Format 'yyyyMMddHHmmss')
    $testContainer = 'yazoo-restore-test-' + (Get-Date -Format 'yyyyMMddHHmmss')
    $started = Get-Date
    $sourceImage = @(& docker inspect --format '{{.Config.Image}}' $Container) | Select-Object -First 1
    if (-not $sourceImage) {
        throw 'Could not determine MySQL image for isolated restore validation.'
    }

    $temporaryRootPassword = [Guid]::NewGuid().ToString('N')
    Write-BackupLog -Message "Starting isolated restore validation container $testContainer from $sourceImage" -LogName 'restore-test.log' -Quiet:$Quiet

    & docker run --rm -d --name $testContainer -e "MYSQL_ROOT_PASSWORD=$temporaryRootPassword" -e "MYSQL_DATABASE=$testDb" $sourceImage *> $null
    if ($LASTEXITCODE -ne 0) {
        throw 'Failed to start isolated MySQL restore validation container.'
    }

    try {
        Wait-MySqlContainerReady -Container $testContainer
        Invoke-MySqlRestore -Container $testContainer -BackupPath $BackupPath -Database $testDb -Admin

        $tableCount = Invoke-MySqlScalar -Container $testContainer -Sql "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$testDb';" -Admin
        $migrationsTable = Invoke-MySqlScalar -Container $testContainer -Sql "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$testDb' AND table_name = 'migrations';" -Admin
        $dbSize = Invoke-MySqlScalar -Container $testContainer -Sql "SELECT COALESCE(SUM(data_length + index_length), 0) FROM information_schema.tables WHERE table_schema = '$testDb';" -Admin
        $duration = [math]::Round(((Get-Date) - $started).TotalSeconds, 2)

        if ([int] $tableCount -le 0 -or [int] $migrationsTable -ne 1) {
            throw "Restore validation failed: tables=$tableCount migrationsTable=$migrationsTable"
        }

        $message = "Restore validation PASS: database=$testDb duration=${duration}s sizeBytes=$dbSize tables=$tableCount migrationsTable=$migrationsTable"
        Write-BackupLog -Message $message -LogName 'restore-test.log' -Quiet:$Quiet
        Write-Output $message
    } finally {
        if (-not $KeepDatabase) {
            & docker rm -f $testContainer *> $null
            Write-BackupLog -Message "Removed isolated restore validation container $testContainer" -LogName 'restore-test.log' -Quiet:$Quiet
        } else {
            Write-BackupLog -Message "Kept isolated restore validation container $testContainer for inspection" -Level WARN -LogName 'restore-test.log' -Quiet:$Quiet
        }
    }
}

$repoRoot = Get-YazooRepoRoot
Ensure-BackupLayout $repoRoot | Out-Null

if (-not $BackupFile) {
    $BackupFile = Select-BackupFile -RepoRoot $repoRoot
}

if (-not (Test-Path -LiteralPath $BackupFile)) {
    throw "Backup file not found: $BackupFile"
}

Test-GzipFile -Path $BackupFile | Out-Null
$container = Get-DockerContainer -Service 'mysql' -FallbackName 'yazoo_v2-mysql-1' -RepoRoot $repoRoot
Assert-ContainerRunning $container

Invoke-TestRestore -Container $container -BackupPath $BackupFile -KeepDatabase:$KeepTestDatabase

if ($TestOnly) {
    return
}

if (-not $Force) {
    $confirmation = Read-Host 'Type RESTORE to restore this backup into the current application database'
    if ($confirmation -ne 'RESTORE') {
        Write-BackupLog -Message 'Production restore cancelled by operator.' -LogName 'restore.log' -Quiet:$Quiet
        return
    }
}

Write-BackupLog -Message "Starting production restore from $(Split-Path $BackupFile -Leaf)" -LogName 'restore.log' -Quiet:$Quiet
$currentDatabase = @(& docker exec $container printenv MYSQL_DATABASE) | Select-Object -First 1
if (-not $currentDatabase -or $currentDatabase -notmatch '^[A-Za-z0-9_]+$') {
    throw 'Could not resolve a safe current application database name from the MySQL container.'
}

$useAdmin = Test-MySqlAdminAccess -Container $container
if ($useAdmin) {
    Invoke-MySqlSql -Container $container -Sql "CREATE DATABASE IF NOT EXISTS $currentDatabase CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" -Admin
    Invoke-MySqlRestore -Container $container -BackupPath $BackupFile -Database $currentDatabase -Admin
} else {
    Write-BackupLog -Message 'MySQL admin access is unavailable; restoring with the application DB user.' -Level WARN -LogName 'restore.log' -Quiet:$Quiet
    Invoke-MySqlRestore -Container $container -BackupPath $BackupFile -Database $currentDatabase
}
Write-BackupLog -Message 'Production restore completed.' -LogName 'restore.log' -Quiet:$Quiet
