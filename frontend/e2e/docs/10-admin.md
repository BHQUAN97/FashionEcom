# 10. Admin Panel — Quan tri co ban

## Summary

Kiem tra admin panel co ban: layout (sidebar, topbar), dashboard (heading, range buttons), cac trang quan ly load duoc (khong 404), va sidebar navigation click test. Auth duoc seed qua localStorage (zustand persist key `fashionecom-auth` voi role=1).

**File test:** `e2e/admin.spec.ts`
**So test:** 17 (4 layout + 3 dashboard + 6 management pages + 4 sidebar nav)
**Trang:** `/admin`, `/admin/*`

## Workflow

```
Seed admin auth → localStorage fashionecom-auth (role=1)

Admin Layout:
  /admin → sidebar ADMIN + topbar FashionEcom Admin
  → Nav links: Dashboard, Don hang, San pham, Danh muc, Khach hang, Khuyen mai, Bao cao, Cai dat
  → Nut Thong bao

Dashboard:
  /admin → heading Dashboard + range buttons 7d/30d/90d
  → Click 7d → active state (bg-gray-900)

Trang quan ly:
  /admin/ton-kho, /admin/don-dat-hang, /admin/danh-gia,
  /admin/nha-cung-cap, /admin/nhat-ky, /admin/layout-builder
  → Moi trang: aside visible + khong 404

Sidebar Navigation:
  Click Don hang → /admin/don-hang
  Click San pham → /admin/san-pham
  Click Danh muc → /admin/danh-muc
  Click Bao cao → /admin/bao-cao
```

## Chi tiet cac test case

### Admin — Layout & Sidebar (4 tests)

#### TC-01: sidebar render voi logo ADMIN
- **Muc dich:** Sidebar hien thi dung
- **Buoc:** Seed auth → goto `/admin` → kiem tra `aside` va text "ADMIN"
- **Ky vong:** Ca 2 visible

#### TC-02: topbar hien thi FashionEcom Admin
- **Muc dich:** Topbar brand text hien thi
- **Ky vong:** "FashionEcom Admin" visible

#### TC-03: sidebar chua cac nav links chinh
- **Muc dich:** 8 nav links hien thi trong sidebar
- **Buoc:** Loop kiem tra moi `a[href]` trong `aside nav`
- **Ky vong:** Dashboard, Don hang, San pham, Danh muc, Khach hang, Khuyen mai, Bao cao, Cai dat — tat ca visible

#### TC-04: topbar co nut Thong bao
- **Muc dich:** Notification button hien thi
- **Ky vong:** `button[aria-label="Thong bao"]` visible

### Admin — Dashboard (3 tests)

#### TC-05: heading Dashboard
- **Ky vong:** `h` "Dashboard" visible

#### TC-06: range buttons 7d / 30d / 90d
- **Ky vong:** 3 buttons visible

#### TC-07: click range button thay doi active state
- **Buoc:** Click 7d → kiem tra class
- **Ky vong:** Button co class `bg-gray-900`

### Admin — Trang quan ly (6 tests)

| # | Trang | URL | Kiem tra |
|---|-------|-----|---------|
| 8 | Ton kho | `/admin/ton-kho` | aside visible + no 404 |
| 9 | Don dat hang | `/admin/don-dat-hang` | aside visible + no 404 |
| 10 | Danh gia | `/admin/danh-gia` | aside visible + no 404 |
| 11 | Nha cung cap | `/admin/nha-cung-cap` | aside visible + no 404 |
| 12 | Nhat ky | `/admin/nhat-ky` | aside visible + no 404 |
| 13 | Layout Builder | `/admin/layout-builder` | aside visible + no 404 |

**Ky thuat:** Moi test seed auth → goto trang → verify `aside` visible va `text=404` NOT visible

### Admin — Sidebar Navigation (4 tests)

| # | Label | URL ky vong |
|---|-------|-------------|
| 14 | Don hang | `/admin/don-hang` |
| 15 | San pham | `/admin/san-pham` |
| 16 | Danh muc | `/admin/danh-muc` |
| 17 | Bao cao | `/admin/bao-cao` |

**Ky thuat:** Click `aside a[href="..."]` → verify `page.toHaveURL()`

## Auth seeding

```typescript
async function seedAdminAuth(page: Page) {
  await page.goto('/admin');
  await page.evaluate(() => {
    localStorage.setItem('fashionecom-auth', JSON.stringify({
      state: {
        user: { id: 'e2e-admin-001', email: 'admin@fashionecom.vn', name: 'E2E Admin', role: 1 },
        accessToken: 'e2e-fake-token-admin'
      },
      version: 0
    }));
  });
}
```
