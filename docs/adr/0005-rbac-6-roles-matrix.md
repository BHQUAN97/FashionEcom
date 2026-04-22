# ADR-0005: RBAC 6 roles voi permission matrix

- **Status**: accepted
- **Date**: 2026-04-10
- **Tags**: security, auth

## Context

E-commerce admin co nhieu role thuc te:
- Chu shop: full access
- Manager: quan ly orders + inventory
- Staff: chi fulfill order
- Content: chi CMS (product description, banner)
- Warehouse: chi inventory (nhap xuat, ton kho)

Neu 2 role (admin + user) nhu LeQuyDon → khong du.

## Decision

**6 roles** voi permission matrix:

| Role | Orders | Products | Inventory | CMS | Users | Analytics | Settings |
|---|---|---|---|---|---|---|---|
| super_admin | CRUD | CRUD | CRUD | CRUD | CRUD | R | CRUD |
| admin | CRUD | CRUD | CRUD | CRUD | R | R | R |
| manager | CRUD | R | CRUD | R | - | R | - |
| staff | RU (process) | R | R | - | - | - | - |
| content_editor | - | CRU | - | CRUD | - | - | - |
| warehouse | - | R | CRUD | - | - | - | - |

### Enforcement
- `@Roles(UserRole.ADMIN, UserRole.MANAGER)` decorator
- `RolesGuard` giong LeQuyDon ADR-0005 (default-deny)
- Permission matrix constant `sys_permission_matrix` — single source of truth

### Future
- Fine-grained permission (per-action) se co khi scale

## Rationale

- 6 role cover thuc te shop thoi trang
- Matrix-driven > if/else scattered
- Super_admin/admin tach biet cho emergency access

## Consequences

### Tich cuc
- Onboard nhan vien de (gan role theo job)
- Audit trail ro rang
- Khong cho staff lo du lieu manager

### Tieu cuc
- 6 role vs 2 role = test coverage phuc tap hon
- User assignment UI phai clear

## References

- `backend/src/common/guards/roles.guard.ts`
- `backend/src/modules/users/permission-matrix.ts`
- Related: LeQuyDon ADR-0005 (pattern, khac ve role count)
