# FashionEcom — Architecture Decision Records

> E-commerce thoi trang (Torano/Aristino reference). Next.js 14 + NestJS 10 + MySQL 8 + TypeORM + Redis.

## Index

- [ADR-0001](0001-stack-torano-aristino-reference.md) — Stack + design reference Torano.vn (storefront) + Aristino.com (checkout)
- [ADR-0002](0002-db-changelog-no-typeorm-migrations.md) — DB changelog SQL files (khong dung TypeORM migrations)
- [ADR-0003](0003-misa-naming-snake-case-prefix.md) — MISA DB convention: snake_case + domain prefix (cat_, sal_, prm_...)
- [ADR-0004](0004-rfc-7807-problem-details.md) — RFC 7807 Problem Details cho error format (khac LeQuyDon envelope)
- [ADR-0005](0005-rbac-6-roles-matrix.md) — RBAC 6 roles voi permission matrix (super_admin → warehouse)
- [ADR-0006](0006-product-attributes-color-size.md) — Product attributes: Color (HEX swatch), Size (group), Material
- [ADR-0007](0007-admin-shopee-seller-style.md) — Admin panel Shopee Seller Center style (multi-tab layout, orange theme)
- [ADR-0008](0008-docker-isolated-port-5300.md) — Docker isolated port (FE 5300 host → 3300 container)
- [ADR-0009](0009-local-storage-r2-deferred.md) — Local storage default, R2 migration deferred
- [ADR-0010](0010-5-phase-roadmap.md) — 5-phase roadmap (Storefront → Admin → Analytics → Layout Builder → Advanced)
