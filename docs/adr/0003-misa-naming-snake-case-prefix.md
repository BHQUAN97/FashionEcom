# ADR-0003: MISA DB convention — snake_case + domain prefix

- **Status**: accepted
- **Date**: 2026-04-10
- **Tags**: database, naming

## Context

18+ table e-commerce. Neu naming flat (product, order, coupon...) → kho group, kho search (product vs product_variant vs product_review trong data grid).

MISA convention (tham khao tu MISA SpecKit): prefix theo domain → grouping tu nhien.

## Decision

### Rules
- **snake_case** (khong camelCase, khong PascalCase)
- **Prefix theo domain**:
  - `sys_` — system (users, roles, settings, sessions)
  - `cat_` — catalog (products, categories, attributes)
  - `inv_` — inventory (stock, warehouse, transfer)
  - `sal_` — sales (orders, payments, shipments, returns)
  - `prm_` — promotion (coupons, flash_sale, loyalty)
  - `cms_` — content (pages, banners, navigation)
  - `log_` — analytics/audit (api_log, page_view, user_action)
- **Primary key**: UUID v4 `CHAR(36)` (khac LeQuyDon ULID — FashionEcom theo MISA convention)
- **Timestamps**: `created_date`, `updated_date`, `deleted_date` (khac `created_at`)
- **Audit**: `created_by`, `updated_by`, `deleted_by`
- **Money/Qty**: DECIMAL (khong FLOAT)
- **Boolean**: TINYINT (khong BOOLEAN — MySQL inconsistent)
- **Soft delete**: `deleted_date IS NULL` cho data dang xai

### Example
```sql
CREATE TABLE cat_product (
  product_id CHAR(36) NOT NULL PRIMARY KEY,
  product_code VARCHAR(50) NOT NULL UNIQUE,
  product_name VARCHAR(255) NOT NULL,
  category_id CHAR(36) NOT NULL,
  price DECIMAL(15, 2) NOT NULL DEFAULT 0,
  is_active TINYINT NOT NULL DEFAULT 1,
  created_date DATETIME NOT NULL,
  created_by CHAR(36),
  updated_date DATETIME,
  updated_by CHAR(36),
  deleted_date DATETIME,
  INDEX idx_category (category_id),
  INDEX idx_code (product_code)
);
```

## Rationale

- Prefix grouping = search DB tool de (ORDER BY table_name = catalog trong 1 cluster)
- MISA convention la standard Vietnamese industry → onboard dev VN nhanh
- DECIMAL money = no floating error ($10.10 - $9.90 = $0.2 dung)

## Consequences

### Tich cuc
- Data grid admin grouping tu nhien
- Khi scale big data, partition theo prefix de
- Consistent voi MISA SpecKit projects

### Tieu cuc
- KHAC voi LeQuyDon (ULID + camelCase TypeORM entity) → phai nho 2 convention
- TypeORM entity se kieu `@Column({ name: 'product_code' })` explicit

### Rui ro
- **Dev drift**: tao table khong prefix → mitigation: DB changelog review (xem ADR-0002)

## Alternatives Considered

### camelCase giong JS convention
- **Nhuoc**: MySQL case-insensitive tren Windows, conflict

### Flat no prefix
- **Nhuoc**: search te voi 50+ table

### Schema rieng per domain
- **Nhuoc**: MySQL "schema" = DB, phai nhieu DB = cross-DB query complex

## References

- MISA DB Convention guide
- `.sdd/constitution.md` "Database Convention"
- Related: LeQuyDon ADR-0003 (khac — ULID)
