#!/bin/bash
# ──────────────────────────────────────────
# FashionEcom — MySQL Backup Script
# Run via cron: 0 2 * * * /opt/fashionecom/scripts/backup-mysql.sh (daily 2am)
# ──────────────────────────────────────────

set -euo pipefail

APP_DIR="/opt/fashionecom"
BACKUP_DIR="/opt/backups/fashionecom"
RETENTION_DAYS=14
DB_NAME="fashion_ecom"
DB_USER="fashionecom"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
LOG_FILE="/var/log/fashionecom/backup.log"

mkdir -p "${BACKUP_DIR}" "$(dirname "${LOG_FILE}")"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_FILE}"
}

# Lay password tu .env
DB_PASS=$(grep '^DB_PASSWORD=' "${APP_DIR}/.env" | cut -d= -f2-)
[ -n "$DB_PASS" ] || { log "ERROR: DB_PASSWORD not found in .env"; exit 1; }

BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"

log "Starting backup: ${DB_NAME} -> ${BACKUP_FILE}"

# Dump + compress
docker exec shared-mysql mysqldump \
  -u "${DB_USER}" -p"${DB_PASS}" \
  --single-transaction --routines --triggers \
  "${DB_NAME}" 2>/dev/null | gzip > "${BACKUP_FILE}"

# Verify file size
FILE_SIZE=$(stat -c%s "${BACKUP_FILE}" 2>/dev/null || stat -f%z "${BACKUP_FILE}")
if [ "${FILE_SIZE}" -lt 1000 ]; then
    log "ERROR: Backup file too small (${FILE_SIZE} bytes) — likely failed"
    rm -f "${BACKUP_FILE}"
    exit 1
fi

log "Backup OK: $(du -h "${BACKUP_FILE}" | cut -f1)"

# Cleanup old backups
DELETED=$(find "${BACKUP_DIR}" -name "*.sql.gz" -mtime +${RETENTION_DAYS} -delete -print | wc -l)
log "Cleaned up ${DELETED} old backups (>${RETENTION_DAYS} days)"

log "Backup completed"
