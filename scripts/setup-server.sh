#!/bin/bash
# ============================================================
# FashionEcom — Server Setup (one-time)
# ============================================================
# Chay TREN VPS — cai dat cron jobs cho backup + cleanup
#
# Usage (on VPS):
#   bash /opt/fashionecom/scripts/setup-server.sh
# ============================================================

set -e

APP_DIR="/opt/fashionecom"
GREEN='\033[0;32m'
NC='\033[0m'
log() { echo -e "${GREEN}[OK]${NC} $1"; }

echo "=== FashionEcom — Server Setup ==="

# Tao log directory
mkdir -p /var/log/fashionecom
mkdir -p /opt/backups/fashionecom
log "Directories created"

# Chmod scripts
chmod +x ${APP_DIR}/scripts/*.sh
log "Scripts executable"

# Setup cron jobs
CRON_TMP=$(mktemp)
crontab -l 2>/dev/null > "${CRON_TMP}" || true

# Backup MySQL — daily 2am
if ! grep -q "fashionecom/scripts/backup-mysql.sh" "${CRON_TMP}"; then
    echo "0 2 * * * ${APP_DIR}/scripts/backup-mysql.sh >> /var/log/fashionecom/backup.log 2>&1" >> "${CRON_TMP}"
    log "Cron: backup-mysql (daily 2am)"
else
    log "Cron: backup-mysql already exists"
fi

# Docker cleanup — weekly Sunday 3am
if ! grep -q "fashionecom/scripts/docker-cleanup.sh" "${CRON_TMP}"; then
    echo "0 3 * * 0 ${APP_DIR}/scripts/docker-cleanup.sh >> /var/log/fashionecom/docker-cleanup.log 2>&1" >> "${CRON_TMP}"
    log "Cron: docker-cleanup (weekly Sunday 3am)"
else
    log "Cron: docker-cleanup already exists"
fi

# DB changelog check — nho chay manual: bash scripts/db-changelog.sh
crontab "${CRON_TMP}"
rm -f "${CRON_TMP}"
log "Crontab updated"

echo ""
echo "=== Setup complete ==="
echo "  Backup:  daily 2am -> /opt/backups/fashionecom/"
echo "  Cleanup: weekly Sunday 3am"
echo "  Logs:    /var/log/fashionecom/"
echo ""
echo "  Verify: crontab -l"
echo "==================================="
