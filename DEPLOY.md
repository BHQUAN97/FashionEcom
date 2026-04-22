# FASHION ECOM — DEPLOYMENT GUIDE

> Domain: shop.bhquan.store | VPS: 134.122.21.251 | Stack: NestJS + Next.js + MySQL + Redis

---

## Kiến trúc Production

```
  VPS Ubuntu (134.122.21.251)
  ┌──────────────────────────────────────────────┐
  │  shared-nginx (Docker) :80/:443               │
  │  └─ shop.bhquan.store → fashionecom-api + fe │
  │                                               │
  │  FashionEcom (/opt/fashionecom)               │
  │  ├─ fashionecom-api      :4000 (NestJS)       │
  │  └─ fashionecom-frontend :3000 (Next.js)      │
  │                                               │
  │  Shared infra (/opt/infra)                    │
  │  ├─ shared-mysql  :3306                        │
  │  │   └─ DB: fashionecom                       │
  │  └─ shared-redis  :6379                        │
  │                                               │
  │  Docker Networks                              │
  │  ├─ webphoto_backend  (mysql, redis)          │
  │  └─ fashionecom-net    (nginx, fashionecom)   │
  └──────────────────────────────────────────────┘
```

### Nginx routing

Config: `/opt/webphoto/nginx/conf.d/shop.bhquan.store.conf`
- `/api/*` → `http://fashionecom-api:4000`
- `/*` → `http://fashionecom-frontend:3000`

---

## GitHub Actions Secrets

Secrets được lưu trong **repo settings** — không commit lên git.

| Secret | Mô tả |
|--------|-------|
| `VPS_HOST` | IP VPS: `134.122.21.251` |
| `VPS_PORT` | SSH port: `22` |
| `VPS_USER` | SSH user: `root` |
| `VPS_PASSWORD` | Mật khẩu SSH VPS |
| `MYSQL_ROOT_PASSWORD` | Root password shared-mysql |
| `FE_DB_PASSWORD` | Password user `fashionecom` trong MySQL |
| `JWT_SECRET` | JWT signing secret |
| `REVALIDATE_SECRET` | Next.js revalidate secret |
| `CRON_SECRET` | Secret header cho cron endpoints |

### Thêm/cập nhật secret nhanh qua CLI

```bash
# Không cần vào GitHub UI — dùng gh CLI
gh secret set VPS_PASSWORD --body "mat_khau_moi" --repo BHQUAN97/FashionEcom

# Thêm secret mới
gh secret set FE_DB_PASSWORD --body "db_pass_moi" --repo BHQUAN97/FashionEcom

# Xem danh sách secrets (chỉ thấy tên, không thấy giá trị)
gh secret list --repo BHQUAN97/FashionEcom
```

---

## Checklist trước khi deploy

- [ ] `gh secret list --repo BHQUAN97/FashionEcom` hiện đủ 9 secrets
- [ ] Push code lên `master` → Actions chạy tự động
- [ ] Xem progress: `gh run watch --repo BHQUAN97/FashionEcom`

> Đổi VPS password: `bash /e/DEVELOP/.claude-shared/secrets-infra/scripts/set-all-secrets.sh --shared`

---

## Deploy

### Tự động (Khuyên dùng)

Push lên nhánh `main` hoặc `master` → GitHub Actions tự động chạy:
1. Typecheck FE + BE (song song)
2. Detect changes (init vs update)
3. Upload + build + start trên VPS
4. DB changelog
5. Health check

### Lần đầu deploy (INIT mode)

Khi `/opt/fashionecom/docker-compose.prod.yml` chưa tồn tại trên VPS:
- Upload toàn bộ source code
- Start shared-mysql + shared-redis (nếu chưa chạy)
- Tạo DB `fashionecom` và user
- Lấy SSL cert cho `shop.bhquan.store`
- Build và start containers
- Chạy DB migrations + seed dev data

### Cập nhật code (UPDATE mode)

Chỉ upload và rebuild phần thay đổi.

---

## Config không nhạy cảm (config/env)

File `config/env` được commit lên git, chứa các giá trị **không nhạy cảm**:

```
DOMAIN=shop.bhquan.store
API_URL=https://shop.bhquan.store/api
DB_HOST=shared-mysql
DB_PORT=3306
DB_USERNAME=fashionecom
DB_NAME=fashionecom
REDIS_HOST=shared-redis
REDIS_PORT=6379
JWT_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=7d
NEXT_REVALIDATE_URL=https://shop.bhquan.store/api/revalidate
```

Các giá trị nhạy cảm (passwords, API keys) chỉ lưu trong GitHub Secrets.

---

## Quản lý trên VPS

```bash
ssh root@134.122.21.251
cd /opt/fashionecom

# Xem logs
docker logs fashionecom-api --tail 50 -f
docker logs fashionecom-frontend --tail 50 -f

# Restart
docker compose -f docker-compose.prod.yml restart backend frontend

# DB access
docker exec -it shared-mysql mysql -u fashionecom -p fashionecom

# Nginx reload
docker exec shared-nginx nginx -t && docker exec shared-nginx nginx -s reload
```

---

## Troubleshooting

```bash
# Backend không start
docker logs fashionecom-api --tail 30
docker inspect fashionecom-api --format '{{.State.Status}} ExitCode:{{.State.ExitCode}}'

# 502 Bad Gateway
docker inspect shared-nginx --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}'
# Phải có: fashionecom-net
docker network connect fashionecom-net shared-nginx
docker exec shared-nginx nginx -s reload
```
