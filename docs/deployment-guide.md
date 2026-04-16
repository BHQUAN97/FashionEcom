# FashionEcom — Hướng dẫn triển khai chi tiết

> Từ Development đến Production. Cập nhật: 2026-04-16

---

## Mục lục

1. [Yêu cầu hệ thống](#1-yêu-cầu-hệ-thống)
2. [Development — Local](#2-development--local)
3. [Development — Docker](#3-development--docker)
4. [Testing](#4-testing)
5. [Production — Quick Deploy](#5-production--quick-deploy)
6. [Production — Manual Deploy](#6-production--manual-deploy)
7. [Database Management](#7-database-management)
8. [Monitoring & Maintenance](#8-monitoring--maintenance)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Yêu cầu hệ thống

### Development

| Phần mềm | Phiên bản | Ghi chú |
|-----------|-----------|---------|
| Node.js | 20.x LTS | Required cho cả FE + BE |
| npm | 10.x+ | Đi kèm Node.js |
| MySQL | 8.0 | hoặc Docker container |
| Redis | 7.x | hoặc Docker container |
| Git | 2.x+ | |
| Docker | 24.x+ | Optional cho local dev |

### Production (VPS)

| Phần mềm | Phiên bản | Ghi chú |
|-----------|-----------|---------|
| Docker | 24.x+ | Required |
| Docker Compose | 2.x+ | Required |
| Certbot | latest | SSL certificates |
| RAM | >= 2GB | Tối thiểu |
| Disk | >= 20GB | Bao gồm images + DB |

---

## 2. Development — Local

### 2.1 Clone & Install

```bash
git clone https://github.com/BHQUAN97/FashionEcom.git
cd FashionEcom

# Tao .env tu template
cp .env.example .env
# Sua cac gia tri trong .env theo moi truong local
```

### 2.2 Cấu hình .env (Development)

```bash
# .env - Development overrides
DB_HOST=localhost       # hoac 127.0.0.1
DB_PORT=3309            # Tranh xung dot port VPS
DB_USERNAME=fashionecom
DB_PASSWORD=fashionecom_dev
DB_NAME=fashion_ecom

REDIS_HOST=localhost
REDIS_PORT=6382

JWT_SECRET=dev-secret-min-32-chars-long-here
JWT_EXPIRATION=900

NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_SITE_URL=http://localhost:5300
ALLOWED_ORIGINS=http://localhost:3300,http://localhost:5300
```

### 2.3 Khởi chạy MySQL + Redis

**Cách 1 — Docker (khuyến nghị):**
```bash
docker compose up mysql redis -d
```

**Cách 2 — Native install:**
- MySQL: start service, tạo DB `fashion_ecom`
- Redis: start service

### 2.4 Init Database

```bash
# Chay tat ca SQL migrations
bash scripts/db-changelog.sh localhost

# Kiem tra trang thai
bash scripts/db-changelog.sh localhost --status
```

### 2.5 Start Backend

```bash
cd backend
npm install
npm run start:dev
# Backend chay tai http://localhost:5301
```

### 2.6 Start Frontend

```bash
cd frontend
npm install
npm run dev
# Frontend chay tai http://localhost:5300
```

### 2.7 Windows — Quick Start Scripts

```batch
# Start tat ca infrastructure (MySQL + Redis)
scripts\start-infra.bat

# Start backend
scripts\start-backend.bat

# Start frontend
scripts\start-frontend.bat

# Hoac start tat ca cung luc
scripts\start-all.bat
```

### 2.8 Verify

| Service | URL | Expected |
|---------|-----|----------|
| Frontend | http://localhost:5300 | Trang storefront Torano |
| Backend API | http://localhost:5301/api | JSON response |
| Admin | http://localhost:5300/admin | Admin login page |
| MySQL | localhost:3309 | MySQL connection |
| Redis | localhost:6382 | Redis connection |

---

## 3. Development — Docker

Chạy toàn bộ stack bằng Docker:

```bash
# Build + start tat ca (MySQL, Redis, Backend, Frontend)
docker compose up --build

# Chay nen
docker compose up -d --build

# Xem logs
docker compose logs -f backend
docker compose logs -f frontend

# Dung
docker compose down

# Dung + xoa data
docker compose down -v
```

**Ports (Docker dev):**

| Container | Internal | External |
|-----------|----------|----------|
| fashionecom-mysql | 3306 | 3309 |
| fashionecom-redis | 6379 | 6382 |
| fashionecom-backend | 4000 | 5301 |
| fashionecom-frontend | 3000 | 5300 |

---

## 4. Testing

### 4.1 Unit Tests

```bash
# Backend — Jest
cd backend
npm test                  # Chay 1 lan
npm run test:watch        # Watch mode
npm run test:cov          # Voi coverage

# Frontend — Vitest
cd frontend
npm test                  # Chay 1 lan
npm run test:watch        # Watch mode
npm run test:cov          # Voi coverage
```

### 4.2 E2E Tests — Playwright

```bash
cd frontend

# Cai Playwright browsers (lan dau)
npx playwright install

# Chay tat ca E2E tests (tu dong start dev server port 3300)
npm run test:e2e

# Chay voi UI mode (debug)
npm run test:e2e:ui

# Chay 1 file cu the
npx playwright test e2e/customer-flow.spec.ts

# Chay 1 test cu the
npx playwright test -g "guest checkout"
```

**E2E Test config:**
- Dev server: tự động start trên port **3300** (khác dev port 5300)
- Browser: Desktop Chrome
- Timeout: 30s
- Screenshots: on failure
- Trace: on first retry
- Parallel: yes (local), sequential (CI)

### 4.3 TypeScript Check

```bash
# Frontend
cd frontend && npx tsc --noEmit

# Backend
cd backend && npm run typecheck
```

### 4.4 Lint

```bash
# Frontend
cd frontend && npm run lint

# Backend
cd backend && npm run lint
```

---

## 5. Production — Quick Deploy

### 5.1 Yêu cầu trước khi deploy

- VPS đã có **WebPhoto shared infrastructure** chạy:
  - `shared-mysql` (MySQL 8.0)
  - `shared-redis` (Redis 7)
  - `shared-nginx` (Nginx reverse proxy)
- SSH key đã cấu hình
- Domain đã trỏ DNS về VPS IP

### 5.2 Deploy 1 lệnh

```bash
# Tu may local
bash scripts/quick-deploy.sh <vps-ip> [domain]

# Vi du:
bash scripts/quick-deploy.sh 143.198.217.127 shop.bhquan.store
```

### 5.3 Quick Deploy — 8 bước tự động

| Bước | Mô tả | Chi tiết |
|------|--------|----------|
| 0/8 | Pre-flight check | SSH connection, shared-mysql/redis/nginx running |
| 1/8 | Chuẩn bị VPS | Tạo `/opt/fashionecom/` directories |
| 2/8 | Upload files | SCP: docker-compose, backend/src, frontend/src, db/changelog, scripts |
| 3/8 | DB + ENV | Tạo database `fashion_ecom` trong shared-mysql, generate `.env` |
| 4/8 | Docker build + start | Build images, start containers, connect shared-nginx network |
| 5/8 | DB migrations | Chạy tất cả `db/changelog/*.sql` pending |
| 6/8 | Nginx config | Upload nginx conf, chạy certbot SSL, reload nginx |
| 7/8 | Health check | Curl API + HTTPS, hiển thị container status |
| 8/8 | Hoàn tất | In URL truy cập |

### 5.4 Kết quả deploy

```
  https://shop.bhquan.store        (Storefront)
  https://shop.bhquan.store/admin  (Admin panel)
```

---

## 6. Production — Manual Deploy

### 6.1 Chuẩn bị VPS

```bash
# SSH vao VPS
ssh root@<vps-ip>

# Tao directory
mkdir -p /opt/fashionecom
cd /opt/fashionecom
```

### 6.2 Upload source code

```bash
# Tu may local
scp -r backend/ frontend/ docker-compose.prod.yml .env scripts/ db/ \
  root@<vps-ip>:/opt/fashionecom/
```

### 6.3 Tạo .env Production

```bash
# Tren VPS
cat > /opt/fashionecom/.env << 'EOF'
DOMAIN=shop.bhquan.store

# MySQL (shared)
DB_HOST=shared-mysql
DB_PORT=3306
DB_USERNAME=fashionecom
DB_PASSWORD=<generated-password>
DB_NAME=fashion_ecom

# Redis (shared)
REDIS_HOST=shared-redis
REDIS_PORT=6379

# Auth
JWT_SECRET=<random-64-chars>
JWT_EXPIRATION=900
REFRESH_TOKEN_EXPIRATION=604800

# Storage
STORAGE_PATH=./storage

# Frontend
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_SITE_URL=https://shop.bhquan.store
INTERNAL_API_URL=http://fashionecom-api:4000/api

# ISR
REVALIDATE_SECRET=<random-32-chars>
NEXT_REVALIDATE_URL=http://fashionecom-frontend:3000

# CORS
ALLOWED_ORIGINS=https://shop.bhquan.store
EOF
```

### 6.4 Tạo Database

```bash
# Vao shared-mysql
docker exec -it shared-mysql mysql -u root -p

# SQL
CREATE DATABASE IF NOT EXISTS fashion_ecom
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_as_ci;

CREATE USER IF NOT EXISTS 'fashionecom'@'%'
  IDENTIFIED WITH mysql_native_password BY '<password>';

GRANT ALL PRIVILEGES ON fashion_ecom.* TO 'fashionecom'@'%';
FLUSH PRIVILEGES;
EXIT;
```

### 6.5 Chạy DB Migrations

```bash
# Tu VPS (hoac qua docker exec)
bash scripts/db-changelog.sh shared-mysql
```

### 6.6 Docker Network

```bash
# Tao networks
docker network create webphoto_backend 2>/dev/null || true
docker network create fashionecom-net 2>/dev/null || true
```

### 6.7 Build & Start

```bash
cd /opt/fashionecom

# Build images
docker compose build

# Start containers
docker compose up -d

# Ket noi shared-nginx vao network
docker network connect fashionecom-net shared-nginx
```

### 6.8 Nginx Config

Tạo file `/opt/webphoto/nginx/conf.d/shop.bhquan.store.conf`:

```nginx
upstream fashionecom-frontend {
    server fashionecom-frontend:3000;
}

upstream fashionecom-api {
    server fashionecom-api:4000;
}

server {
    listen 80;
    server_name shop.bhquan.store;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name shop.bhquan.store;

    ssl_certificate     /etc/letsencrypt/live/shop.bhquan.store/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/shop.bhquan.store/privkey.pem;

    # API proxy
    location /api/ {
        proxy_pass http://fashionecom-api/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Storage/uploads
    location /storage/ {
        proxy_pass http://fashionecom-api/storage/;
    }

    # Frontend (Next.js)
    location / {
        proxy_pass http://fashionecom-frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# SSL certificate
certbot certonly --standalone -d shop.bhquan.store \
  --non-interactive --agree-tos --email admin@bhquan.site \
  --pre-hook 'docker stop shared-nginx' \
  --post-hook 'docker start shared-nginx'

# Reload nginx
docker exec shared-nginx nginx -t
docker exec shared-nginx nginx -s reload
```

### 6.9 Health Check

```bash
# Container status
docker ps --filter 'name=fashionecom'

# API health
curl -s http://localhost:4000/api/health

# HTTPS check
curl -sf https://shop.bhquan.store/
```

---

## 7. Database Management

### 7.1 Schema Migrations — Changelog

FashionEcom **KHÔNG dùng TypeORM migrations**. Dùng directory-versioned SQL trong `db/changelog/`.

**Convention:**
```
db/changelog/
├── V001__init_tables.sql
├── V002__add_inventory.sql
├── V003__add_promotions.sql
└── ...
```

**Chạy migrations:**
```bash
# Local
bash scripts/db-changelog.sh localhost

# VPS
bash scripts/db-changelog.sh <vps-ip>

# Xem trang thai
bash scripts/db-changelog.sh <vps-ip> --status
```

**Tracking:** Bảng `schema_changelog` ghi nhận file đã chạy + checksum SHA256.

### 7.2 Backup MySQL

```bash
# Manual backup
bash scripts/backup-mysql.sh

# Auto backup — cron daily 2am (setup qua setup-server.sh)
# Output: /opt/backups/fashionecom/fashion_ecom_YYYYMMDD_HHMMSS.sql.gz
```

### 7.3 Restore MySQL

```bash
# Giai nen
gunzip fashion_ecom_20260416_020000.sql.gz

# Restore
docker exec -i shared-mysql mysql -u fashionecom -p'<password>' fashion_ecom < fashion_ecom_20260416_020000.sql
```

---

## 8. Monitoring & Maintenance

### 8.1 Server Setup (1 lần)

```bash
# Tren VPS
bash /opt/fashionecom/scripts/setup-server.sh
```

Cài đặt:
- Cron backup MySQL: daily 2am
- Cron Docker cleanup: weekly Sunday 3am
- Log directory: `/var/log/fashionecom/`

### 8.2 Xem Logs

```bash
# Container logs
docker logs fashionecom-api --tail 100 -f
docker logs fashionecom-frontend --tail 100 -f

# Cron logs
tail -f /var/log/fashionecom/backup.log
tail -f /var/log/fashionecom/docker-cleanup.log
```

### 8.3 Re-deploy (update code)

```bash
# Tu may local — re-deploy nhanh
bash scripts/quick-deploy.sh <vps-ip> shop.bhquan.store

# Hoac manual tren VPS
cd /opt/fashionecom
docker compose build
docker compose up -d
```

### 8.4 Docker Cleanup

```bash
# Manual
bash scripts/docker-cleanup.sh

# Auto: weekly Sunday 3am (da cai qua setup-server.sh)
```

### 8.5 Scale / Restart

```bash
# Restart 1 service
docker compose restart backend
docker compose restart frontend

# Rebuild + restart
docker compose up -d --build backend
docker compose up -d --build frontend
```

---

## 9. Troubleshooting

### 9.1 Frontend build thất bại

```bash
# Kiem tra TypeScript errors
cd frontend && npx tsc --noEmit

# Kiem tra env vars NEXT_PUBLIC_* co duoc truyen vao build args
docker compose config | grep NEXT_PUBLIC
```

### 9.2 Backend không kết nối DB

```bash
# Kiem tra MySQL dang chay
docker ps --filter name=mysql

# Kiem tra network
docker network inspect fashionecom-net

# Test connection
docker exec -it fashionecom-api node -e "
  const mysql = require('mysql2');
  const conn = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  conn.connect((err) => {
    console.log(err ? 'FAIL: ' + err.message : 'OK');
    conn.end();
  });
"
```

### 9.3 Nginx 502 Bad Gateway

```bash
# Kiem tra containers dang chay
docker ps --filter 'name=fashionecom'

# Kiem tra shared-nginx co tren dung network
docker inspect shared-nginx --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}'

# Ket noi lai neu can
docker network connect fashionecom-net shared-nginx

# Test nginx config
docker exec shared-nginx nginx -t

# Reload
docker exec shared-nginx nginx -s reload
```

### 9.4 SSL Certificate hết hạn

```bash
# Renew
certbot renew

# Hoac renew chi 1 domain
certbot certonly --standalone -d shop.bhquan.store \
  --pre-hook 'docker stop shared-nginx' \
  --post-hook 'docker start shared-nginx'

# Reload nginx
docker exec shared-nginx nginx -s reload
```

### 9.5 E2E Tests fail

```bash
# Chay lai voi debug
npx playwright test --debug

# Xem screenshot cua test that bai
ls frontend/test-results/

# Chay voi trace
npx playwright test --trace on
npx playwright show-trace test-results/<test-name>/trace.zip
```

### 9.6 Port xung đột

FashionEcom dùng port riêng tránh xung đột với các project khác trên shared VPS:

| Project | Frontend | Backend | MySQL | Redis |
|---------|----------|---------|-------|-------|
| WebPhoto | 3000 | 4000 | 3306 | 6379 |
| VietNet | 3100 | 4100 | 3307 | 6380 |
| LeQuyDon | 3200 | 4200 | 3308 | 6381 |
| **FashionEcom** | **3300** | **4300** | **3309** | **6382** |

Nếu port bị chiếm, sửa trong `.env` và restart.

---

## Tóm tắt commands

| Mục đích | Command |
|----------|---------|
| **Dev — Start** | `cd frontend && npm run dev` + `cd backend && npm run start:dev` |
| **Dev — Docker** | `docker compose up -d --build` |
| **Test — Unit** | `cd frontend && npm test` / `cd backend && npm test` |
| **Test — E2E** | `cd frontend && npm run test:e2e` |
| **Test — TypeCheck** | `cd frontend && npx tsc --noEmit` |
| **Build** | `cd frontend && npm run build` + `cd backend && npm run build` |
| **Deploy — Quick** | `bash scripts/quick-deploy.sh <vps-ip> <domain>` |
| **DB — Migrate** | `bash scripts/db-changelog.sh <host>` |
| **DB — Status** | `bash scripts/db-changelog.sh <host> --status` |
| **DB — Backup** | `bash scripts/backup-mysql.sh` |
| **Server — Setup** | `bash scripts/setup-server.sh` (1 lần trên VPS) |
| **Logs** | `docker logs fashionecom-api -f` |
| **Restart** | `docker compose restart backend` |
