#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPO_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)
BACKUP_ROOT="$REPO_ROOT/infra/backups"
MYSQL_DIR="$BACKUP_ROOT/mysql"
LOG_DIR="$BACKUP_ROOT/logs"

mkdir -p "$MYSQL_DIR" "$LOG_DIR"

log() {
  printf '%s [INFO] %s\n' "$(date '+%Y-%m-%dT%H:%M:%S%z')" "$1" | tee -a "$LOG_DIR/backup.log"
}

container=$(cd "$REPO_ROOT" && docker compose ps -q mysql 2>/dev/null || true)
if [ -z "$container" ]; then
  container=$(docker ps --filter name=yazoo-mysql-1 --format '{{.ID}}' | head -n 1)
fi
if [ -z "$container" ]; then
  container=$(docker ps --filter name=yazoo_v2-mysql-1 --format '{{.ID}}' | head -n 1)
fi
if [ -z "$container" ]; then
  echo "MySQL container is not running." >&2
  exit 1
fi

timestamp=$(date '+%Y-%m-%d_%H-%M')
backup_file="$MYSQL_DIR/yazoo_backup_$timestamp.sql.gz"
if [ -e "$backup_file" ]; then
  echo "Refusing to overwrite existing backup file: $backup_file" >&2
  exit 1
fi

log "Starting MySQL backup to $backup_file"
docker exec "$container" sh -lc 'set -e; MYSQL_PWD="$MYSQL_PASSWORD" mysqldump --single-transaction --quick --routines --triggers --events --hex-blob --default-character-set=utf8mb4 -u"$MYSQL_USER" "$MYSQL_DATABASE" | gzip -c' > "$backup_file"
gzip -t "$backup_file"
log "MySQL backup completed: $(basename "$backup_file")"
printf '%s\n' "$backup_file"
