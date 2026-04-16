# E2E Test Documentation — FashionEcom

> Tai lieu nghiep vu E2E Playwright cho website FashionEcom (e-commerce thoi trang)
> Cap nhat: 2026-04-16 | Tong: 11 test suites | ~163 tests

## Tong quan

| # | Nghiep vu | File test | So test | Trang |
|---|-----------|-----------|---------|-------|
| 01 | [Homepage / Storefront Layout](01-homepage.md) | `homepage.spec.ts` | 4 | `/san-pham` (storefront layout) |
| 02 | [Auth — Login & Register](02-auth.md) | `auth.spec.ts` | 6 | `/dang-nhap`, `/dang-ky` |
| 03 | [Navigation](03-navigation.md) | `navigation.spec.ts` | 5 | Header links, product detail |
| 04 | [Responsive](04-responsive.md) | `responsive.spec.ts` | 5 | Mobile 375px + Desktop |
| 05 | [Collection Page](05-collection.md) | `collection.spec.ts` | 5 | `/san-pham` |
| 06 | [Search](06-search.md) | `search.spec.ts` | 12 | Header search, `/tim-kiem` |
| 07 | [Cart](07-cart.md) | `cart.spec.ts` | 4 | `/gio-hang` |
| 08 | [Checkout](08-checkout.md) | `checkout.spec.ts` | 12 | `/thanh-toan` |
| 09 | [Customer Flow](09-customer-flow.md) | `customer-flow.spec.ts` | 36 | Full luong khach hang |
| 10 | [Admin Panel](10-admin.md) | `admin.spec.ts` | 17 | `/admin/*` |
| 11 | [Admin Flow](11-admin-flow.md) | `admin-flow.spec.ts` | 57 | Full luong admin |

## Coverage theo man hinh

```
STOREFRONT (PUBLIC):
  [x] Storefront Layout /san-pham       — 4 tests (announcement bar, header, nav links, footer)
  [x] Collection /san-pham              — 5 tests (heading, product grid, sort, filter sidebar)
  [x] Product Detail /san-pham/[slug]   — 6 tests (navigate, name, color swatches, size, qty, trust)
  [x] Search /tim-kiem                  — 12 tests (header search, popular, results, empty, clear)
  [x] Cart /gio-hang                    — 4 tests (empty state, heading, checkout link)
  [x] Checkout /thanh-toan              — 12 tests (review, shipping form, payment, order summary)

AUTH:
  [x] Login /dang-nhap                  — 4 tests (form render, links, toggle password, login flow)
  [x] Register /dang-ky                 — 2 tests (render, navigate from login)

ADMIN:
  [x] Login /admin-login                — 3 tests (form, placeholder, empty submit)
  [x] Layout & Sidebar                  — 4 tests (sidebar, topbar, nav links, avatar dropdown)
  [x] Dashboard /admin                  — 5 tests (heading, range buttons, KPI, charts)
  [x] San pham /admin/san-pham          — 10 tests (list, create form, tabs, content quality)
  [x] Don hang /admin/don-hang          — 3 tests (heading, status filter, search)
  [x] Khach hang /admin/khach-hang      — 2 tests (heading, table)
  [x] Danh muc /admin/danh-muc          — 3 tests (heading, add button, modal)
  [x] Ton kho /admin/ton-kho            — 2 tests (load, status tabs)
  [x] Khuyen mai /admin/khuyen-mai      — 3 tests (load, cards, navigate)
  [x] Thuoc tinh /admin/thuoc-tinh      — 3 tests (load, tabs, switch)
  [x] Cai dat /admin/cai-dat            — 4 tests (heading, setting groups, save, switch tab)
  [x] Nguoi dung /admin/nguoi-dung      — 3 tests (heading, add button, modal)
  [x] Media /admin/media                — 2 tests (heading, upload button)
  [x] Danh gia /admin/danh-gia          — 2 tests (heading, status filter)
  [x] Nha cung cap /admin/nha-cung-cap  — 2 tests (load, add button)
  [x] Layout Builder                    — 1 test (load)
  [x] Nhat ky /admin/nhat-ky            — 1 test (load)
  [x] Sidebar Navigation                — 10 tests (click nav links)

CROSS-CUTTING:
  [x] Navigation                        — 5 tests (menu links, product card, logo, footer)
  [x] Responsive                        — 5 tests (mobile header, bottom tab, filter, desktop)
  [x] Customer Flow                     — 36 tests (filter→detail→cart→checkout guest+auth)
```

## Ky thuat chung

### 1. Auth seeding — Zustand persist store
```typescript
// Seed admin auth vao localStorage (zustand persist key: fashionecom-auth)
localStorage.setItem('fashionecom-auth', JSON.stringify({
  state: { user: { id, email, name, role: 1 }, accessToken: 'fake-token' },
  version: 0
}));
```

### 2. Cart seeding — LocalStorage
```typescript
// Seed cart data (zustand persist key: fashionecom-cart)
localStorage.setItem('fashionecom-cart', JSON.stringify({
  state: { items: [{ variantId, productId, name, slug, color, size, price, qty, sku, max_qty }] },
  version: 0
}));
```

### 3. Element co the an tren viewport khac — Dung first()/last()
```typescript
// Mobile va desktop co the render cung element — dung first()/last() de chon dung
await expect(page.getByText('text').first()).toBeVisible();
```

### 4. Force click cho hover-only elements
```typescript
await quickAddBtn.click({ force: true }); // Proloop-actions chi hien khi hover
```

## Cach chay test

```bash
# Tat ca tests
npx playwright test

# Chi 1 file
npx playwright test homepage.spec.ts

# Chi 1 test case
npx playwright test -g "render announcement bar"

# Voi UI mode (debug)
npx playwright test --ui

# Xem report
npx playwright show-report
```

## Cau hinh

- **Base URL:** `http://localhost:5300` (dev)
- **Browsers:** Chromium (default viewport)
- **State management:** Zustand persist (localStorage)
- **Routes:** Vietnamese slug (`/san-pham`, `/dang-nhap`, `/gio-hang`, `/thanh-toan`)

## Cau truc file

```
frontend/e2e/
  ├── docs/                          ← TAI LIEU (ban dang doc)
  │   ├── INDEX.md                   ← File nay
  │   ├── 01-homepage.md
  │   ├── 02-auth.md
  │   ├── 03-navigation.md
  │   ├── 04-responsive.md
  │   ├── 05-collection.md
  │   ├── 06-search.md
  │   ├── 07-cart.md
  │   ├── 08-checkout.md
  │   ├── 09-customer-flow.md
  │   ├── 10-admin.md
  │   └── 11-admin-flow.md
  ├── homepage.spec.ts               ← Test files
  ├── auth.spec.ts
  ├── navigation.spec.ts
  ├── responsive.spec.ts
  ├── collection.spec.ts
  ├── search.spec.ts
  ├── cart.spec.ts
  ├── checkout.spec.ts
  ├── customer-flow.spec.ts
  ├── admin.spec.ts
  └── admin-flow.spec.ts
```
