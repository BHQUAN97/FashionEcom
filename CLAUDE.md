# FashionEcom — E-commerce thoi trang online

## Quick Start
```bash
# Frontend
cd frontend && npm install && npm run dev  # http://localhost:3300

# Backend
cd backend && npm install && npm run start:dev  # http://localhost:4300

# Docker (production)
docker compose -f docker-compose.prod.yml up -d
```

## Key Files
- `.sdd/constitution.md` — Nguyen tac bat bien, doc TRUOC KHI lam viec
- `.sdd/features/` — Spec tung feature
- `fashion_ecom_spec_v2.docx.md` — Tai lieu dac ta day du (14 muc, 5 phases)
- `fashion_ecom_distribution.sql` — Schema MySQL goc (12 tables core)
- `Design/torano/` — 53 mockup Torano (uu tien layout)
- `Design/aristino.com/` — 75 mockup Aristino (tham khao checkout/nav)
- `frontend/` — Next.js 14 App Router + Tailwind + shadcn/ui
- `backend/` — NestJS 10 + TypeORM + MySQL

## Reference
- LeQuyDon (`E:\DEVELOP\LeQuyDon`) — cung stack, tham khao architecture + deploy + changelog
- Spec: Torano.vn + Aristino.com (design patterns)

## Build & Deploy
```bash
# Build
cd frontend && npm run build
cd backend && npm run build

# Deploy (Docker — shared VPS)
docker compose -f docker-compose.prod.yml up -d

# DB changelog
bash scripts/db-changelog.sh <vps-ip>           # chay tat ca pending
bash scripts/db-changelog.sh <vps-ip> --status  # xem trang thai
```

## Database
- MySQL 8.0 — schema managed by directory-versioned SQL (db/changelog/)
- KHONG dung TypeORM migrations — dung `scripts/db-changelog.sh`
- Convention: MISA (snake_case, prefix phan he, UUID PK, DECIMAL cho tien/so luong)

## Ports (dev)
- Frontend: 3300
- Backend: 4300
- MySQL: 3309
- Redis: 6382
