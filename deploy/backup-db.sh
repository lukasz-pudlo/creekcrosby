#!/usr/bin/env bash
# Nightly Postgres dump for the creekcrosby stack (same pattern as racehere's
# deploy/backup-db.sh on the CPX32 box).
#
# APP_ROOT is derived from this script's own location (repo/deploy/ ->
# /srv/creekcrosby/), so backups land in /srv/backups/creekcrosby/, gzipped,
# retained for $RETENTION_DAYS. Installed via /etc/cron.d — see
# deploy/creekcrosby-backup.cron.
set -euo pipefail

APP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKUP_DIR="/srv/backups/$(basename "${APP_ROOT}")"
RETENTION_DAYS=14

mkdir -p "${BACKUP_DIR}"
chmod 700 "${BACKUP_DIR}"

STAMP=$(date -u +%Y-%m-%dT%H%M%SZ)
OUT="${BACKUP_DIR}/${STAMP}.sql.gz"

cd "${APP_ROOT}"

# pg_dump runs inside the db container where $POSTGRES_USER / $POSTGRES_DB are
# set by the postgres image. Single quotes stop the host shell expanding them.
# --clean / --if-exists make the dump idempotent on restore. -Fp = plain SQL.
docker compose exec -T db sh -c \
    'pg_dump --clean --if-exists -Fp -U "$POSTGRES_USER" "$POSTGRES_DB"' \
    | gzip -9 > "${OUT}"

chmod 600 "${OUT}"

find "${BACKUP_DIR}" -name '*.sql.gz' -type f -mtime "+${RETENTION_DAYS}" -delete

SIZE=$(du -h "${OUT}" | cut -f1)
echo "[$(date -u +%FT%TZ)] backup ok: ${OUT} (${SIZE})"
