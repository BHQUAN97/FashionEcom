# ADR-0002: DB changelog SQL files (khong dung TypeORM migrations)

- **Status**: accepted
- **Date**: 2026-04-12
- **Tags**: database, pattern

## Context

TypeORM migrations gap van de:
- `migration:generate` sinh SQL phu thuoc entity diff → neu schema drift manually thi migration sai
- Migration file la TypeScript → can build truoc khi chay prod
- Khong flexible cho complex migration (data migration, conditional)

Muon kiem soat SQL **truc tiep**, audit de, rollback de.

## Decision

**Khong dung TypeORM migrations**. Thay bang **db-changelog** pattern:

### Cau truc
```
db/changelog/
├── 1.0.0/
│   ├── 001__init_schema.sql
│   ├── 002__seed_roles.sql
│   └── 003__create_indexes.sql
├── 1.1.0/
│   └── 001__add_product_attributes.sql
└── 1.2.0/
    └── 001__add_flash_sale.sql
```

### Tracker table
```sql
CREATE TABLE schema_changelog (
  id INT AUTO_INCREMENT PRIMARY KEY,
  version VARCHAR(50) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  applied_at DATETIME NOT NULL,
  applied_by VARCHAR(100),
  execution_ms INT,
  UNIQUE KEY (version, filename)
);
```

### Runner
```bash
bash scripts/db-changelog.sh <vps-ip> [--status|--version 1.1.0]
```

Logic:
1. Doc tat ca `.sql` file theo thu tu version + filename
2. Check `schema_changelog` — skip file da applied
3. Chay file moi → record vao `schema_changelog`
4. Idempotent: chay lan 2 = no-op

### TypeORM config
- `synchronize: false`
- KHONG generate migration
- Entity TypeORM chi de query, khong cho schema

## Rationale

- SQL direct: developer thay ro nhat, khong magic
- Version-aware: `1.1.0/` = release note
- Idempotent: ke ca dev chay nhieu lan OK
- Easy review: PR change `.sql` file de review hon migration TS

## Consequences

### Tich cuc
- Audit trail = git log `.sql` files
- Rollback: tao `NNN__rollback_...sql` kem
- Deploy chi can chay `bash scripts/db-changelog.sh`

### Tieu cuc
- Phai maintain SQL tay (khong auto-gen)
- Entity drift: quen sua `.entity.ts` sau khi add column → runtime error
- No auto-rollback

### Rui ro
- **Developer forget to add SQL** → mitigation: CI check entity vs schema

## Alternatives Considered

### TypeORM migrations
- **Nhuoc**: auto-gen co the sai, build dependency

### Prisma migrate
- **Uu**: tot
- **Nhuoc**: stack da chon TypeORM

### Flyway / Liquibase
- **Uu**: enterprise
- **Nhuoc**: over-engineer, them Java tool

## References

- `scripts/db-changelog.sh`
- `db/changelog/` folder
