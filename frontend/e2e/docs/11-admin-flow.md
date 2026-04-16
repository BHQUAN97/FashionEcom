# 11. Admin Flow — Full luong quan tri

## Summary

Test suite admin day du nhat — kiem tra TOAN BO luong admin: Login page → Layout (sidebar + topbar + avatar) → Dashboard (KPI, charts) → San pham (list + create form 5 tabs) → Don hang → Khach hang → Danh muc (CRUD modal) → Ton kho → Khuyen mai (hub + sub-pages) → Thuoc tinh (Mau sac/Size tabs) → Cai dat (groups + save) → Nguoi dung (CRUD modal) → Media → Danh gia (status filter) → Nha cung cap → Layout Builder → Nhat ky → Sidebar Navigation (6 links).

Auth: seed localStorage + cookie (zustand persist key `fashionecom-auth` voi role=1 + cookie `fashionecom-auth-token`).

**File test:** `e2e/admin-flow.spec.ts`
**So test:** 57
**Trang:** `/admin-login`, `/admin`, `/admin/*`

## Workflow

```
1. Admin Login:    /admin-login → form (email + password + Dang nhap)
2. Admin Layout:   sidebar ADMIN + topbar + nav links (10 routes) + avatar dropdown
3. Dashboard:      heading + range buttons + KPI cards + charts
4. San pham:       heading + Them SP + status filter + search + create form (5 tabs + quality score)
5. Don hang:       heading + status filter + search
6. Khach hang:     heading + table
7. Danh muc:       heading + Them danh muc → modal
8. Ton kho:        load + status tabs
9. Khuyen mai:     hub (Sale, Flash Sale, Ma giam gia, Loyalty) → sub-page
10. Thuoc tinh:    tabs (Mau sac, Kich co) → switch tab → table
11. Cai dat:       heading + groups (Cua hang, Giao hang, Thanh toan) + Luu → switch tab
12. Nguoi dung:    heading + Them nguoi dung → modal
13. Media:         heading + Tai len button
14. Danh gia:      heading + status filter (Cho duyet, Da duyet)
15. Nha cung cap:  load + Them NCC button
16. Layout Builder: load (no 404)
17. Nhat ky:       load (no 404)
18. Sidebar Nav:   6 links click test
```

## Chi tiet cac test case

### 1. Admin Login (3 tests)

| # | Test | Ky vong |
|---|------|---------|
| 1 | Login page hien form | Heading "Admin Login" + email + password + button |
| 2 | Placeholder dung | `admin@example.com` visible |
| 3 | Submit form trong | Form van hien (khong redirect) |

### 2. Admin Layout (4 tests)

| # | Test | Ky vong |
|---|------|---------|
| 1 | Sidebar voi logo ADMIN | aside + "ADMIN" visible |
| 2 | Topbar "FashionEcom Admin" | Text visible |
| 3 | Sidebar 10 nav links | 10 `a[href]` visible (don-hang → nhat-ky) |
| 4 | Avatar dropdown | Click header button → "Dang xuat" visible |

### 3. Dashboard (5 tests)

| # | Test | Ky vong |
|---|------|---------|
| 1 | Heading Dashboard | h visible |
| 2 | Range buttons 7d/30d/90d | 3 buttons visible |
| 3 | Click 7d active state | Class `bg-gray-900` |
| 4 | KPI cards | "Doanh thu" visible |
| 5 | Charts section | "Doanh thu theo ng..." visible |

### 4. San pham (5 tests)

| # | Test | Ky vong |
|---|------|---------|
| 1 | Heading "San pham" | h visible |
| 2 | Nut "Them san pham" | Text visible |
| 3 | Status filter tabs ("Tat ca") | Button visible |
| 4 | Search input | `input[placeholder*="Tim"]` visible |
| 5 | Click Them → /admin/san-pham/tao | Navigate + heading "Them san pham moi" |

### 5. Tao san pham (5 tests)

| # | Test | Ky vong |
|---|------|---------|
| 1 | Heading "Them san pham moi" | h visible |
| 2 | 5 tabs thong tin | Thong tin co ban, Chi tiet, Mo ta, Van chuyen, Thong tin khac |
| 3 | Content quality score | "Cap do Noi dung" visible |
| 4 | Nut Luu | Button visible |
| 5 | Link quay lai danh sach | "Quay lai danh sach" visible |

### 6. Don hang (3 tests)

| # | Test | Ky vong |
|---|------|---------|
| 1 | Heading "Don hang" | h visible |
| 2 | Status filter tabs | "Tat ca" button visible |
| 3 | Search input | Input visible |

### 7. Khach hang (2 tests)

| # | Test | Ky vong |
|---|------|---------|
| 1 | Heading "Khach hang" | h visible |
| 2 | Table hien thi | `table` visible |

### 8. Danh muc (3 tests)

| # | Test | Ky vong |
|---|------|---------|
| 1 | Heading "Danh muc" | h visible |
| 2 | Nut "Them danh muc" | Button visible |
| 3 | Click → modal "Them danh muc moi" | Modal text visible |

### 9. Ton kho (2 tests)

| # | Test | Ky vong |
|---|------|---------|
| 1 | Load duoc (no 404) | aside visible + "Ton kho" text |
| 2 | Stock status tabs | "Tat ca" button visible |

### 10. Khuyen mai (3 tests)

| # | Test | Ky vong |
|---|------|---------|
| 1 | Load duoc (no 404) | "Khuyen mai" text visible |
| 2 | 4 card links | Chuong trinh Sale, Flash Sale, Ma giam gia, Loyalty |
| 3 | Click Ma giam gia → sub-page | URL match `/admin/khuyen-mai/ma-giam` |

### 11. Thuoc tinh (3 tests)

| # | Test | Ky vong |
|---|------|---------|
| 1 | Load duoc (no 404) | "Thuoc tinh" text visible |
| 2 | Tabs Mau sac va Kich co | 2 buttons visible (exact match) |
| 3 | Switch tab Kich co | Click → table visible |

### 12. Cai dat (4 tests)

| # | Test | Ky vong |
|---|------|---------|
| 1 | Heading "Cai dat" | h visible |
| 2 | Setting groups | 3 buttons: Thong tin cua hang, Giao hang, Thanh toan |
| 3 | Nut Luu thay doi | Button visible |
| 4 | Switch tab Giao hang | Click → shipping text visible |

### 13. Nguoi dung (3 tests)

| # | Test | Ky vong |
|---|------|---------|
| 1 | Heading "Nguoi dung" | h visible |
| 2 | Nut Them nguoi dung | Button visible |
| 3 | Click → modal | "Them nguoi dung moi" visible |

### 14. Media (2 tests)

| # | Test | Ky vong |
|---|------|---------|
| 1 | Heading "Media" | h visible |
| 2 | Nut Tai len | Button visible |

### 15. Danh gia (2 tests)

| # | Test | Ky vong |
|---|------|---------|
| 1 | Heading "Danh gia" | h visible |
| 2 | Status filter | "Cho duyet" va "Da duyet" buttons visible |

### 16. Nha cung cap (2 tests)

| # | Test | Ky vong |
|---|------|---------|
| 1 | Load duoc (no 404) | "Nha cung cap" text visible |
| 2 | Nut Them NCC | Button visible |

### 17. Layout Builder (1 test)

| # | Test | Ky vong |
|---|------|---------|
| 1 | Load duoc | aside visible + no 404 |

### 18. Nhat ky (1 test)

| # | Test | Ky vong |
|---|------|---------|
| 1 | Load duoc | aside visible + no 404 |

### 19. Sidebar Navigation (6 tests)

| # | Label | URL ky vong |
|---|-------|-------------|
| 1 | Don hang | `/admin/don-hang` |
| 2 | San pham | `/admin/san-pham` |
| 3 | Danh muc | `/admin/danh-muc` |
| 4 | Ton kho | `/admin/ton-kho` |
| 5 | Khach hang | `/admin/khach-hang` |
| 6 | Khuyen mai | `/admin/khuyen-mai` |

**Ky thuat:** Loop `for (const nav of navTests)` → click `aside nav a[href]` → verify URL

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
    document.cookie = 'fashionecom-auth-token=e2e-fake-token-admin; path=/; max-age=604800; SameSite=Strict';
  });
}
```

**Luu y:** File nay seed ca cookie `fashionecom-auth-token` (khac voi `admin.spec.ts` chi seed localStorage). Cookie can thiet cho middleware kiem tra phia server.
