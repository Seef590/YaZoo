#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPO_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)
BACKUP_ROOT="$REPO_ROOT/infra/backups"
MYSQL_DIR="$BACKUP_ROOT/mysql"
LOG_DIR="$BACKUP_ROOT/logs"

mkdir -p "$LOG_DIR"

backup_file="${1:-}"
if [ -z "$backup_file" ]; then
  latest=$(find "$MYSQL_DIR" -maxdepth 1 -type f -name 'yazoo_backup_*.sql.gz' | sort | tail -n 1)
  if [ -z "$latest" ]; then
    echo "No backups found." >&2
    exit 1
  fi
  backup_file="$latest"
fi

if [ ! -f "$backup_file" ]; then
  echo "Backup not found: $backup_file" >&2
  exit 1
fi

gzip -t "$backup_file"

container=$(cd "$REPO_ROOT" && docker compose ps -q mysql 2>/dev/null || true)
if [ -z "$container" ]; then
  container=$(docker ps --filter name=yazoo_v2-mysql-1 --format '{{.ID}}' | head -n 1)
fi
if [ -z "$container" ]; then
  echo "MySQL container is not running." >&2
  exit 1
fi

test_db="yazoo_restore_test_$(date '+%Y%m%d%H%M%S')"
docker exec -e RESTORE_DATABASE="$test_db" "$container" sh -lc 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "CREATE DATABASE $RESTORE_DATABASE CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"'
docker cp "$backup_file" "$container:/tmp/yazoo_restore.sql.gz"
docker exec -e RESTORE_DATABASE="$test_db" "$container" sh -lc 'gzip -dc /tmp/yazoo_restore.sql.gz | mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$RESTORE_DATABASE"'
tables=$(docker exec -e RESTORE_DATABASE="$test_db" "$container" sh -lc 'mysql -N -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = \"$RESTORE_DATABASE\";"')
docker exec -e RESTORE_DATABASE="$test_db" "$container" sh -lc 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "DROP DATABASE IF EXISTS $RESTORE_DATABASE;"' >/dev/null

if [ "${TEST_ONLY:-0}" = "1" ]; then
  echo "Restore test passed with $tables tables."
  exit 0
fi

printf 'Type RESTORE to restore into the current application database: '
read confirmation
if [ "$confirmation" != "RESTORE" ]; then
  echo "Restore cancelled."
  exit 0
fi

docker exec "$container" sh -lc 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $MYSQL_DATABASE CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"'
docker exec "$container" sh -lc 'gzip -dc /tmp/yazoo_restore.sql.gz | mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"'
docker exec "$container" sh -lc 'rm -f /tmp/yazoo_restore.sql.gz'
printf '%s [INFO] Production restore completed from %s\n' "$(date '+%Y-%m-%dT%H:%M:%S%z')" "$(basename "$backup_file")" >> "$LOG_DIR/restore.log"

