#!/bin/bash
# ============================================================
# FashionEcom — UPDATE DEPLOY
# ============================================================
# Chay tu may local — chi upload source + rebuild Docker + restart
# Dung khi da deploy lan dau (deploy.sh) va chi can cap nhat code
#
# Usage:
#   bash scripts/update-deploy.sh <vps-ip> [domain]
#   bash scripts/update-deploy.sh 143.198.217.127
# ============================================================

set -e

VPS_IP="${1:?Usage: bash scripts/update-deploy.sh <vps-ip> [domain]}"
DOMAIN="${2:-shop.bhquan.store}"
VPS_USER="${VPS_USER:-root}"
VPS_HOST="${VPS_USER}@${VPS_IP}"
APP_DIR="/opt/fashionecom"
WEBPHOTO_DIR="/opt/webphoto"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[!!]${NC} $1"; }
step() { echo -e "\n${CYAN}━━━ $1${NC}"; }

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

echo ""
echo "=== FashionEcom — Update Deploy ==="
echo "  VPS: ${VPS_HOST}"
echo "  Domain: ${DOMAIN}"
echo ""

# 1. Build local
step "1/6 — Build local"
cd "$ROOT_DIR/backend" && npm run build
cd "$ROOT_DIR/frontend" && npm run build
cd "$ROOT_DIR"
log "Build OK"

# 2. Upload source
step "2/6 — Upload to VPS"
ssh "${VPS_HOST}" "rm -rf ${APP_DIR}/backend/src ${APP_DIR}/frontend/src"

echo "  Uploading backend..."
scp -r "$ROOT_DIR/backend/src" "${VPS_HOST}:${APP_DIR}/backend/"
scp "$ROOT_DIR/backend/package.json" "${VPS_HOST}:${APP_DIR}/backend/"
scp "$ROOT_DIR/backend/package-lock.json" "${VPS_HOST}:${APP_DIR}/backend/"
scp "$ROOT_DIR/backend/Dockerfile" "${VPS_HOST}:${APP_DIR}/backend/"

echo "  Uploading frontend..."
scp -r "$ROOT_DIR/frontend/src" "${VPS_HOST}:${APP_DIR}/frontend/"
scp "$ROOT_DIR/frontend/package.json" "${VPS_HOST}:${APP_DIR}/frontend/"
scp "$ROOT_DIR/frontend/package-lock.json" "${VPS_HOST}:${APP_DIR}/frontend/"
scp "$ROOT_DIR/frontend/Dockerfile" "${VPS_HOST}:${APP_DIR}/frontend/"
scp "$ROOT_DIR/frontend/next.config.mjs" "${VPS_HOST}:${APP_DIR}/frontend/"
scp "$ROOT_DIR/frontend/tailwind.config.ts" "${VPS_HOST}:${APP_DIR}/frontend/"
scp "$ROOT_DIR/frontend/postcss.config.mjs" "${VPS_HOST}:${APP_DIR}/frontend/" 2>/dev/null || true
scp "$ROOT_DIR/frontend/components.json" "${VPS_HOST}:${APP_DIR}/frontend/" 2>/dev/null || true
scp -r "$ROOT_DIR/frontend/public" "${VPS_HOST}:${APP_DIR}/frontend/" 2>/dev/null || true

echo "  Uploading docker-compose..."
scp "$ROOT_DIR/docker-compose.prod.yml" "${VPS_HOST}:${APP_DIR}/docker-compose.yml"

log "Upload OK"

# 3. DB Changelog
step "3/6 — DB Changelog"
CHANGELOG_DIR="$ROOT_DIR/db/changelog"
if [ -d "$CHANGELOG_DIR" ] && ls "$CHANGELOG_DIR"/*.sql 1>/dev/null 2>&1; then
  scp -r "$ROOT_DIR/db" "${VPS_HOST}:${APP_DIR}/"
  SHOP_DB_PASS=$(ssh "${VPS_HOST}" "grep '^DB_PASSWORD=' ${APP_DIR}/.env | cut -d= -f2-")
  for f in $(find "$CHANGELOG_DIR" -name '*.sql' -type f | sort); do
    FNAME=$(basename "$f")
    echo -n "  $FNAME ... "
    ssh "${VPS_HOST}" "docker exec -i shared-mysql mysql -u fashionecom -p'${SHOP_DB_PASS}' fashion_ecom" < "$f" 2>&1 && echo "OK" || echo "SKIP"
  done
  log "DB Changelog done"
else
  log "No changelog files (skip)"
fi

# 4. Update Nginx config
step "4/6 — Update Nginx config"
if [ -f "$ROOT_DIR/nginx/conf.d/${DOMAIN}.conf" ]; then
  scp "$ROOT_DIR/nginx/conf.d/${DOMAIN}.conf" "${VPS_HOST}:${WEBPHOTO_DIR}/nginx/conf.d/${DOMAIN}.conf"
elif [ -f "$ROOT_DIR/nginx/conf.d/shop.bhquan.store.conf" ]; then
  scp "$ROOT_DIR/nginx/conf.d/shop.bhquan.store.conf" "${VPS_HOST}:${WEBPHOTO_DIR}/nginx/conf.d/${DOMAIN}.conf"
fi

ssh "${VPS_HOST}" "
  docker exec shared-nginx nginx -t 2>&1 | tail -1 && docker exec shared-nginx nginx -s reload 2>&1
"
log "Nginx config updated"

# 5. Rebuild + Restart
step "5/6 — Rebuild Docker + Restart"
ssh "${VPS_HOST}" "
  docker network create webphoto_backend 2>/dev/null || true
  docker network create fashionecom-net 2>/dev/null || true

  cd ${APP_DIR}
  docker compose build backend frontend 2>&1 | tail -5
  docker compose up -d backend frontend

  # Dam bao shared-nginx tren fashionecom-net
  if ! docker inspect shared-nginx --format '{{range \$k,\$v := .NetworkSettings.Networks}}{{\$k}} {{end}}' | grep -q fashionecom; then
    docker network connect fashionecom-net shared-nginx
    echo 'shared-nginx reconnected to fashionecom-net'
  fi
"
log "Containers restarted"

# 6. Health check
step "6/6 — Health check"
sleep 8
ssh "${VPS_HOST}" "
  curl -sf http://localhost:4000/api/health && echo '' || echo 'API not ready yet'
  curl -sf -o /dev/null -w 'HTTPS: %{http_code}\n' https://${DOMAIN}/ || true
  echo ''
  docker ps --filter 'name=fashionecom' --format 'table {{.Names}}\t{{.Status}}'
"
log "Update deploy done!"

echo ""
echo "=== Update complete — https://${DOMAIN} ==="
echo ""
