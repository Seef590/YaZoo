# YaZoo Backup and Recovery Runbook

This runbook covers the local Docker Desktop disaster recovery workflow for YaZoo. The scripts are intentionally isolated under `scripts/backup` and do not modify application business logic.

## Backup Locations

- MySQL backups: `infra/backups/mysql/yazoo_backup_YYYY-MM-DD_HH-mm.sql.gz`
- Redis exports: included in snapshots under `redis/dump.rdb`
- Snapshot archives: `infra/backups/snapshots/yazoo_snapshot_YYYY-MM-DD_HH-mm.zip`
- Logs and reports: `infra/backups/logs`

Generated backup artifacts are excluded from git and Docker build context.

## Safety Model

- Scripts read credentials from the running Docker containers and their environment.
- Passwords are not printed to logs.
- Backups are written outside Docker volumes, so they survive container recreation.
- Restore tests use a disposable MySQL validation container from the same image, restore into a temporary database there, and remove that container after validation.
- Production restore requires explicit operator confirmation unless `-Force` is supplied.
- The real application database is not touched during restore validation.

## Daily MySQL Backup

Run from the repository root:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\backup\backup-mysql.ps1
```

Linux/Git Bash equivalent:

```sh
sh ./scripts/backup/backup-mysql.sh
```

The backup script creates a compressed logical MySQL dump using `mysqldump`, verifies gzip integrity, logs the result, and applies the retention policy unless `-NoCleanup` is passed.

## Verify Backup Health

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\backup\verify-backup.ps1
```

Checks include:

- Backup exists and is recent.
- Backup size is above the minimum threshold.
- Gzip stream is readable.
- SQL dump contains expected SQL markers.
- Latest backup is not an extreme size anomaly compared with recent backups.

The report is written to `infra/backups/logs/health-report.txt`.

## Restore Test

Validate the latest backup without touching production data:

```powershell
$latest = Get-ChildItem .\infra\backups\mysql\yazoo_backup_*.sql.gz | Sort-Object LastWriteTime -Descending | Select-Object -First 1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\backup\restore-mysql.ps1 -BackupFile $latest.FullName -TestOnly
```

The script starts an isolated disposable MySQL container from the same image as the application database, creates a temporary validation database there, restores the backup, validates that tables and the Laravel `migrations` table exist, reports duration and DB size, then removes only that disposable container.

## Production Restore

Only run after a successful restore test and business approval:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\backup\restore-mysql.ps1 -BackupFile .\infra\backups\mysql\yazoo_backup_YYYY-MM-DD_HH-mm.sql.gz
```

The script asks you to type `RESTORE` before applying the dump to the current application database.

## Snapshot

Create a full DR snapshot:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\backup\create-snapshot.ps1
```

Snapshots include:

- A fresh MySQL `.sql.gz` backup.
- Redis `dump.rdb` after `SAVE`.
- Uploaded public storage from the app container.
- Docker Compose and Nginx configuration.
- `backend/.env.production.example`.

Actual secret `.env` files are intentionally excluded.

## Retention Policy

`cleanup-old-backups.ps1` keeps:

- Daily backups for 7 days.
- Weekly backups for 4 weeks.
- Monthly backups for 3 months.

Run manually:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\backup\cleanup-old-backups.ps1
```

Dry run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\backup\cleanup-old-backups.ps1 -DryRun
```

## Docker Volume Safety

Current persistent volumes:

- `yazoo_v2_mysql-data` mounted at `/var/lib/mysql`
- `yazoo_v2_redis-data` mounted at `/data`
- `yazoo_v2_backend-storage` mounted at `/var/www/html/storage`

Do not remove these named volumes during routine `docker compose down/up` operations.

## Docker Compose Environment Preflight

`docker-compose.yml` requires a root-level `.env` file for Compose interpolation. Do not commit this file.

Create it from `.env.example` and populate real production values before running `docker compose up`, `docker compose ps`, or `docker compose down`:

```powershell
Copy-Item .env.example .env
notepad .env
```

The values must match the existing MySQL and Redis credentials for a recreated stack to reconnect to the preserved named volumes.

## RPO and RTO

With the recommended scheduler:

- RPO: up to 24 hours for MySQL data, unless manual backups are run before risky changes.
- RTO: 15 to 45 minutes for a practiced restore on the same Docker host.

For production SaaS, use managed MySQL backups, off-host encrypted storage, and periodic restore drills.
