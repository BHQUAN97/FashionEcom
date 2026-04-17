#!/bin/bash
# ============================================================
# FashionEcom — QUICK DEPLOY TO VPS
# ============================================================
# Chay TU MAY LOCAL — deploy len VPS da co WebPhoto shared infra
# Dung chung MySQL (shared-mysql), Redis (shared-redis), Nginx (shared-nginx)
#
# Yeu cau:
#   - VPS da deploy WebPhoto (shared-mysql, shared-redis, shared-nginx dang chay)
#   - SSH key da cau hinh
#
# Usage:
#   bash scripts/quick-deploy.sh <vps-ip> [domain]
#   bash scripts/quick-deploy.sh 143.198.217.127 shop.bhquan.store
# ============================================================

set -e

VPS_IP="${1:?Usage: bash scripts/quick-deploy.sh <vps-ip> [domain]}"
DOMAIN="${2:-shop.bhquan.store}"
VPS_USER="${VPS_USER:-root}"
VPS_HOST="${VPS_USER}@${VPS_IP}"
APP_DIR="/opt/fashionecom"
WEBPHOTO_DIR="/opt/webphoto"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[!!]${NC} $1"; }
err()  { echo -e "${RED}[ERR]${NC} $1"; exit 1; }
step() { echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; echo -e "${CYAN}  $1${NC}"; echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; }

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

echo ""
echo "============================================================"
echo "  FashionEcom — Quick Deploy"
echo "  VPS:    ${VPS_HOST}"
echo "  Domain: ${DOMAIN}"
echo "  Mode:   Shared infra with WebPhoto"
echo "============================================================"

# ─── STEP 0: PRE-FLIGHT ──────────────────────────────────
step "0/8 — Kiem tra truoc khi deploy"

ssh -o ConnectTimeout=5 -o BatchMode=yes "${VPS_HOST}" "echo SSH_OK" 2>/dev/null || err "Khong the SSH vao ${VPS_HOST}"
log "SSH connection OK"

ssh "${VPS_HOST}" "docker ps --filter name=shared-mysql --format '{{.Status}}'" | grep -q "Up" || err "shared-mysql khong chay. Deploy WebPhoto truoc."
ssh "${VPS_HOST}" "docker ps --filter name=shared-redis --format '{{.Status}}'" | grep -q "Up" || err "shared-redis khong chay. Deploy WebPhoto truoc."
ssh "${VPS_HOST}" "docker ps --filter name=shared-nginx --format '{{.Status}}'" | grep -q "Up" || err "shared-nginx khong chay. Deploy WebPhoto truoc."
log "Shared MySQL + Redis + Nginx running"

# ─── STEP 1: PREPARE VPS ─────────────────────────────────
step "1/8 — Chuan bi VPS"

ssh "${VPS_HOST}" "
  mkdir -p ${APP_DIR}/backend
  mkdir -p ${APP_DIR}/frontend
  mkdir -p ${APP_DIR}/db/changelog
  mkdir -p ${APP_DIR}/scripts
  echo 'VPS ready'
"
log "VPS prepared"

# ─── STEP 2: UPLOAD FILES ────────────────────────────────
step "2/8 — Upload files len VPS"

echo "  Uploading docker-compose..."
scp "$ROOT_DIR/docker-compose.prod.yml" "${VPS_HOST}:${APP_DIR}/docker-compose.yml"

echo "  Uploading backend..."
scp "$ROOT_DIR/backend/Dockerfile" "${VPS_HOST}:${APP_DIR}/backend/"
scp "$ROOT_DIR/backend/package.json" "${VPS_HOST}:${APP_DIR}/backend/"
scp "$ROOT_DIR/backend/package-lock.json" "${VPS_HOST}:${APP_DIR}/backend/"
scp "$ROOT_DIR/backend/tsconfig.json" "${VPS_HOST}:${APP_DIR}/backend/"
scp "$ROOT_DIR/backend/nest-cli.json" "${VPS_HOST}:${APP_DIR}/backend/"
scp -r "$ROOT_DIR/backend/src" "${VPS_HOST}:${APP_DIR}/backend/"

echo "  Uploading frontend..."
scp "$ROOT_DIR/frontend/Dockerfile" "${VPS_HOST}:${APP_DIR}/frontend/"
scp "$ROOT_DIR/frontend/package.json" "${VPS_HOST}:${APP_DIR}/frontend/"
scp "$ROOT_DIR/frontend/package-lock.json" "${VPS_HOST}:${APP_DIR}/frontend/"
scp "$ROOT_DIR/frontend/tsconfig.json" "${VPS_HOST}:${APP_DIR}/frontend/"
scp "$ROOT_DIR/frontend/next.config.mjs" "${VPS_HOST}:${APP_DIR}/frontend/"
scp "$ROOT_DIR/frontend/tailwind.config.ts" "${VPS_HOST}:${APP_DIR}/frontend/"
scp "$ROOT_DIR/frontend/postcss.config.mjs" "${VPS_HOST}:${APP_DIR}/frontend/" 2>/dev/null || true
scp "$ROOT_DIR/frontend/components.json" "${VPS_HOST}:${APP_DIR}/frontend/" 2>/dev/null || true
scp -r "$ROOT_DIR/frontend/src" "${VPS_HOST}:${APP_DIR}/frontend/"
scp -r "$ROOT_DIR/frontend/public" "${VPS_HOST}:${APP_DIR}/frontend/" 2>/dev/null || true

echo "  Uploading DB changelog..."
scp -r "$ROOT_DIR/db" "${VPS_HOST}:${APP_DIR}/" 2>/dev/null || true

echo "  Uploading scripts..."
scp -r "$ROOT_DIR/scripts" "${VPS_HOST}:${APP_DIR}/"

log "All files uploaded"

# ─── STEP 3: CREATE DB + ENV ─────────────────────────────
step "3/8 — Tao database fashion_ecom trong shared-mysql + .env"

MYSQL_ROOT_PASS=$(ssh "${VPS_HOST}" "grep '^MYSQL_ROOT_PASSWORD=' ${WEBPHOTO_DIR}/.env | cut -d= -f2-")
[ -n "$MYSQL_ROOT_PASS" ] || err "Khong lay duoc MYSQL_ROOT_PASSWORD tu ${WEBPHOTO_DIR}/.env"

SHOP_DB_PASS=$(openssl rand -hex 16)
ssh "${VPS_HOST}" "
  docker exec shared-mysql mysql -u root -p'${MYSQL_ROOT_PASS}' -e \"
    CREATE DATABASE IF NOT EXISTS fashion_ecom CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_ci;
    CREATE USER IF NOT EXISTS 'fashionecom'@'%' IDENTIFIED WITH mysql_native_password BY '${SHOP_DB_PASS}';
    GRANT ALL PRIVILEGES ON fashion_ecom.* TO 'fashionecom'@'%';
    FLUSH PRIVILEGES;
  \" 2>&1
"
log "Database fashion_ecom ready"

JWT_SEC=$(openssl rand -hex 32)
REVAL_SEC=$(openssl rand -hex 16)

ssh "${VPS_HOST}" "
  cd ${APP_DIR}
  if [ ! -f '.env' ]; then
    cat > .env << EOF
# ── FashionEcom Production ──
DOMAIN=${DOMAIN}

# ── MySQL (shared) ──
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASS}
DB_HOST=shared-mysql
DB_PORT=3306
DB_USERNAME=fashionecom
DB_PASSWORD=${SHOP_DB_PASS}
DB_NAME=fashion_ecom

# ── Redis (shared) ──
REDIS_HOST=shared-redis
REDIS_PORT=6379

# ── Auth ──
JWT_SECRET=${JWT_SEC}
JWT_EXPIRATION=900
REFRESH_TOKEN_EXPIRATION=604800

# ── Storage ──
STORAGE_PATH=./storage

# ── Frontend ──
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_SITE_URL=https://${DOMAIN}
INTERNAL_API_URL=http://fashionecom-api:4000/api

# ── ISR ──
REVALIDATE_SECRET=${REVAL_SEC}
NEXT_REVALIDATE_URL=http://fashionecom-frontend:3000

# ── CORS ──
ALLOWED_ORIGINS=https://${DOMAIN}
EOF
    echo '.env created'
  else
    echo '.env already exists — skip'
  fi
"
log "Environment configured"

# ─── STEP 4: BUILD + START DOCKER ────────────────────────
step "4/8 — Build Docker images + Start"

ssh "${VPS_HOST}" "
  cd ${APP_DIR}

  docker network create webphoto_backend 2>/dev/null || true
  docker network create fashionecom-net 2>/dev/null || true

  echo '  Building Docker images...'
  docker compose build 2>&1 | tail -5

  echo '  Starting FashionEcom containers...'
  docker compose up -d

  # Ket noi shared-nginx vao fashionecom-net
  if ! docker inspect shared-nginx --format '{{range \$k,\$v := .NetworkSettings.Networks}}{{\$k}} {{end}}' | grep -q fashionecom; then
    docker network connect fashionecom-net shared-nginx
    echo '  shared-nginx connected to fashionecom-net'
  else
    echo '  shared-nginx already on fashionecom-net'
  fi
"
log "Containers started"

# ─── STEP 5: DB MIGRATIONS ──────────────────────────────
step "5/8 — Database migrations"

ssh "${VPS_HOST}" "
  cd ${APP_DIR}
  if [ -d '${APP_DIR}/db/changelog' ]; then
    for f in \$(find ${APP_DIR}/db/changelog -name '*.sql' -type f 2>/dev/null | sort); do
      echo \"  Applying: \$(basename \$f)\"
      docker exec -i shared-mysql mysql -u fashionecom -p'${SHOP_DB_PASS}' fashion_ecom < \"\$f\" 2>&1 || true
    done
  fi
  docker compose restart backend
  sleep 5
"
log "Database ready"

# ─── STEP 6: NGINX CONFIG ───────────────────────────────
step "6/8 — Cau hinh Nginx trong shared-nginx"

scp "$ROOT_DIR/nginx/conf.d/shop.bhquan.store.conf" "${VPS_HOST}:${WEBPHOTO_DIR}/nginx/conf.d/${DOMAIN}.conf"

ssh "${VPS_HOST}" "
  # SSL cert
  if ! [ -d /etc/letsencrypt/live/${DOMAIN} ]; then
    certbot certonly --standalone -d ${DOMAIN} \
      --non-interactive --agree-tos --email admin@bhquan.site \
      --pre-hook 'docker stop shared-nginx' \
      --post-hook 'docker start shared-nginx' 2>&1 || true
  fi

  # Reload nginx
  docker exec shared-nginx nginx -t 2>&1 | tail -2
  docker exec shared-nginx nginx -s reload 2>&1
  echo 'Nginx reloaded'
"
log "Nginx configured"

# ─── STEP 7: HEALTH CHECK ───────────────────────────────
step "7/8 — Health check"

ssh "${VPS_HOST}" "
  sleep 5

  echo 'Health check:'
  curl -sf http://fashionecom-api:4000/api/health 2>/dev/null && echo '' || echo 'API: checking via localhost...'
  curl -sf -o /dev/null -w 'HTTPS ${DOMAIN}: %{http_code}\n' https://${DOMAIN}/ || true

  echo ''
  echo 'Container status:'
  docker ps --filter 'name=fashionecom' --filter 'name=shared-' --format 'table {{.Names}}\t{{.Status}}'
"

# ─── STEP 8: DONE ───────────────────────────────────────
step "8/8 — Hoan tat"

echo ""
echo "============================================================"
echo -e "  ${GREEN}DEPLOY HOAN TAT!${NC}"
echo "============================================================"
echo ""
echo "  https://${DOMAIN}        (FashionEcom)"
echo "  https://${DOMAIN}/admin  (Admin)"
echo ""
echo "  Re-deploy:  bash scripts/quick-deploy.sh ${VPS_IP} ${DOMAIN}"
echo "============================================================"
