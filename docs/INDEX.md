# FashionEcom — Index tài liệu

> Danh mục tất cả tài liệu dự án. Cập nhật: 2026-04-16

---

## Tài liệu gốc (Root)

| File | Mô tả |
|------|--------|
| [`CLAUDE.md`](../CLAUDE.md) | Hướng dẫn AI agent — quick start, key files, build & deploy, ports |
| [`fashion_ecom_spec_v2.docx.md`](../fashion_ecom_spec_v2.docx.md) | Đặc tả nghiệp vụ đầy đủ (14 mục, 5 phases) |
| [`fashionecom-snap.md`](../fashionecom-snap.md) | Snapshot cấu trúc project |
| [`torano-snapshot.md`](../torano-snapshot.md) | Snapshot thiết kế Torano (tham khảo layout) |
| [`torano-cards-snapshot.md`](../torano-cards-snapshot.md) | Snapshot product card Torano |

---

## Tài liệu nghiệp vụ & kỹ thuật (`docs/`)

| File | Mô tả |
|------|--------|
| [`business-flows.md`](business-flows.md) | Luồng nghiệp vụ chi tiết — Storefront (Filter → Cart → Checkout) + Admin (18 trang), giải pháp kỹ thuật, E2E test coverage |
| [`deployment-guide.md`](deployment-guide.md) | Hướng dẫn triển khai — Dev local, Docker, Testing, Production (Quick Deploy 1 lệnh + Manual), DB management, Monitoring, Troubleshooting |

---

## Constitution & SDD (`.sdd/`)

| File | Mô tả |
|------|--------|
| [`.sdd/constitution.md`](../.sdd/constitution.md) | Nguyên tắc bất biến — KHÔNG được vi phạm |
| [`.sdd/check-report.md`](../.sdd/check-report.md) | Báo cáo kiểm tra chất lượng |

---

## Feature Specs & Plans (`.sdd/features/`)

### Phase 1 — Storefront
| File | Mô tả |
|------|--------|
| [`spec.md`](../.sdd/features/phase-1-storefront/spec.md) | Đặc tả: Homepage, Collection, Product Detail, Cart, Checkout, Search |
| [`plan.md`](../.sdd/features/phase-1-storefront/plan.md) | Kế hoạch triển khai Phase 1 |
| [`tasks.md`](../.sdd/features/phase-1-storefront/tasks.md) | Task list Phase 1 |

### Phase 2 — Admin Core
| File | Mô tả |
|------|--------|
| [`spec.md`](../.sdd/features/phase-2-admin-core/spec.md) | Đặc tả: Dashboard, Products, Orders, Categories, Customers, Settings |
| [`plan.md`](../.sdd/features/phase-2-admin-core/plan.md) | Kế hoạch triển khai Phase 2 |
| [`tasks.md`](../.sdd/features/phase-2-admin-core/tasks.md) | Task list Phase 2 |

### Phase 3 — Analytics & Reports
| File | Mô tả |
|------|--------|
| [`spec.md`](../.sdd/features/phase-3-analytics/spec.md) | Đặc tả: KPI Dashboard, Charts, Heatmap, Reports |
| [`plan.md`](../.sdd/features/phase-3-analytics/plan.md) | Kế hoạch triển khai Phase 3 |
| [`tasks.md`](../.sdd/features/phase-3-analytics/tasks.md) | Task list Phase 3 |

### Phase 4 — Layout & Marketing
| File | Mô tả |
|------|--------|
| [`spec.md`](../.sdd/features/phase-4-layout-marketing/spec.md) | Đặc tả: Layout Builder, Promotions, Flash Sale, Loyalty, CMS |
| [`plan.md`](../.sdd/features/phase-4-layout-marketing/plan.md) | Kế hoạch triển khai Phase 4 |
| [`tasks.md`](../.sdd/features/phase-4-layout-marketing/tasks.md) | Task list Phase 4 |

### Phase 5 — Advanced
| File | Mô tả |
|------|--------|
| [`spec.md`](../.sdd/features/phase-5-advanced/spec.md) | Đặc tả: Inventory, Suppliers, Reviews, Media, Users, Import/Sync |
| [`plan.md`](../.sdd/features/phase-5-advanced/plan.md) | Kế hoạch triển khai Phase 5 |
| [`tasks.md`](../.sdd/features/phase-5-advanced/tasks.md) | Task list Phase 5 |

---

## Thiết kế (`Design/`)

| Folder | Nội dung |
|--------|----------|
| `Design/torano/` | 53 mockup Torano — ưu tiên layout storefront |
| `Design/aristino.com/` | 75 mockup Aristino — tham khảo checkout/navigation |

---

## Database

| File | Mô tả |
|------|--------|
| [`fashion_ecom_distribution.sql`](../fashion_ecom_distribution.sql) | Schema MySQL gốc (12 tables core) |
| `db/changelog/` | Directory-versioned SQL migrations |
| `scripts/db-changelog.sh` | Script chạy pending migrations |

---

## E2E Tests (`frontend/e2e/`)

| File | Tests | Phạm vi |
|------|-------|---------|
| `customer-flow.spec.ts` | 43 | Full luồng KH: Filter → Quick Add → Cart → Checkout |
| `admin-flow.spec.ts` | 59 | Full luồng Admin: Login → Dashboard → 18 trang quản lý |
| `checkout.spec.ts` | 14 | Checkout 3 steps chi tiết |
| `cart.spec.ts` | 4 | Giỏ hàng trống + có sản phẩm |
| `collection.spec.ts` | 5 | Collection page cơ bản |
| `search.spec.ts` | 11 | Search header + trang tìm kiếm |
| `auth.spec.ts` | 6 | Login/Register forms |
| `homepage.spec.ts` | 5 | Storefront layout |
| `navigation.spec.ts` | 5 | Route navigation |
| `responsive.spec.ts` | 5 | Mobile/Desktop responsive |
| `admin.spec.ts` | 16 | Admin layout + navigation |
| **Tổng** | **~173** | **121 passed (full suite, 0 failed)** |
