# ADR-0009: Local storage default, R2 migration deferred

- **Status**: accepted
- **Date**: 2026-04-12
- **Tags**: storage, roadmap

## Context

E-commerce media: product photos (multiple per product), banner, review images. LeQuyDon da dung R2 prod (ADR-0007).

Nhung FashionEcom dang o phase 1 (MVP), chua muon R2 setup complexity. Cho den khi co traffic ro, deferred.

## Decision

### Phase 1-4 (current): Local storage
- `/storage/products/<ulid>.webp`
- `/storage/reviews/...`
- `/storage/categories/...`
- `/storage/system/...`
- Multer upload, Sharp auto-resize (400/800/1200px) — **planned phase 2**

### Phase 5: R2 migration
- `StorageProvider` interface giong LeQuyDon
- Deploy `StorageService` swap local → R2 qua env
- Migration script: upload tat ca file `/storage/*` len R2 bucket, update DB URL

## Rationale

- Phase 1 focus checkout flow > scale storage
- Local storage simple: dev = `/storage/`, prod volume mount
- Defer R2 tranh premature optimization

## Consequences

### Tich cuc
- MVP ship nhanh
- Backup don gian: rsync folder
- Khong cost Cloudflare API

### Tieu cuc
- Khong scale horizontal (load balance 2 API server = conflict file)
- Khong CDN → anh cham load globally
- Backup manually

### Rui ro
- **Disk full** khi upload nhieu → mitigation: monitor `df -h`, alert 80%
- **Re-migration phuc tap** khi Phase 5 → mitigation: dung interface sans phai refactor nhieu

## References

- `.sdd/constitution.md` "Storage Strategy"
- Related: LeQuyDon ADR-0007 (R2 production), WebPhoto ADR cua R2
