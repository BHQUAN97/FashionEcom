# 09. Customer Flow — Full luong khach hang

## Summary

Test suite lon nhat — kiem tra TOAN BO luong khach hang tu dau den cuoi: Collection (filter, sort, load more) → Product Detail (variant, color, size, trust badges) → Quick Add Popup (hover, ESC, link) → Cart (empty, co san pham, free ship bar) → Checkout Guest (khong can dang nhap) → Checkout Authenticated (da dang nhap) → Checkout Validation (empty cart, disabled button, back navigation, COD, order summary).

**File test:** `e2e/customer-flow.spec.ts`
**So test:** 36
**Trang:** `/san-pham`, `/san-pham/[slug]`, `/gio-hang`, `/thanh-toan`

## Workflow

```
1. Collection — Filter & Sort:
   /san-pham → heading + product grid + filter sidebar
   → Danh muc, Khoang gia (slider), Size filter (chip) → Clear all
   → Sort dropdown → Category link → Load more

2. Product Detail:
   Collection → click card → /san-pham/[slug]
   → Ten SP, Mau sac, Kich thuoc (auto-select), So luong, Trust badges

3. Quick Add Popup:
   Collection → hover product card → click THEM VAO GIO
   → Popup: SKU, Gia, size auto-selected, link chi tiet
   → ESC dong popup

4. Cart:
   Empty → "Gio hang trong" + TIEP TUC MUA SAM
   Co SP → heading + danh sach + tong don + THANH TOAN + free ship bar

5. Checkout Guest:
   /thanh-toan → KHONG bi redirect login
   → Goi y dang nhap (khong bat buoc)
   → Full flow: Review → Shipping (fill form) → Payment (COD/Bank)

6. Checkout Authenticated:
   Seed auth → KHONG thay goi y dang nhap
   → Full flow + chon chuyen khoan → thong tin chuyen khoan

7. Checkout Validation:
   Cart trong → thong bao
   Shipping disabled khi chua dien
   QUAY LAI → review
   COD mac dinh
   Order summary desktop
```

## Chi tiet cac test case

### 1. Collection — Filter & Sort (11 tests)

| # | Test | Ky vong |
|---|------|---------|
| 1 | Heading "Tat ca san pham" voi so luong | h1 visible, contain text |
| 2 | Product grid co nhieu san pham | `.product-loop` count >= 1 |
| 3 | Filter sidebar heading "Bo loc" | Text visible trong aside |
| 4 | Category section "Danh muc san pham" | Links ao-polo, ao-thun visible |
| 5 | Price range slider "Khoang gia" | 2+ input[type="range"] |
| 6 | Click size filter tao chip | Click M → "Size: M" visible |
| 7 | Clear all filters xoa chips | Click L → "Xoa het" → chip bien mat |
| 8 | Sort dropdown hien thi | `select` first visible |
| 9 | Sort co 3+ options | Option count >= 3 |
| 10 | Click category navigate | Click ao-polo → URL match |
| 11 | Load more button | Click "Xem them" → cards count tang (conditional) |

### 2. Product Detail — Variant & Add to Cart (6 tests)

| # | Test | Ky vong |
|---|------|---------|
| 1 | Navigate tu collection den detail | URL match `/san-pham/.+`, h1 visible |
| 2 | Ten san pham hien thi | h1 text truthy |
| 3 | Color swatches voi label "Mau sac" | Label visible |
| 4 | Size selector auto-select | Button KHONG chua "VUI LONG CHON" |
| 5 | Quantity stepper | "So luong" visible |
| 6 | Trust badges | "Mien phi giao hang" + "Hang chinh hang" visible |

**Ky thuat:** Moi test navigate tu `/san-pham` → click product → waitForURL. Dung `.product-loop a` de click card cu the.

### 3. Quick Add Popup (5 tests)

| # | Test | Ky vong |
|---|------|---------|
| 1 | Mo popup tu hover | Hover card → click button → popup z-[60] visible |
| 2 | Popup co SKU va Gia | "SKU:" va "Gia:" visible |
| 3 | Size auto-selected | Button khong chua "VUI LONG CHON" |
| 4 | ESC dong popup | Press Escape → popup not visible |
| 5 | Link "Xem chi tiet san pham" | Link visible trong popup |

**Ky thuat:**
- Hover card → `waitForTimeout(300)` de `.proloop-actions` hien
- `click({ force: true })` vi button chi visible khi hover
- Popup selector: `.fixed.inset-0.z-\\[60\\]` filter by `h2`

### 4. Cart (8 tests)

| # | Test | Ky vong |
|---|------|---------|
| 1 | Empty: "Gio hang trong" | Text visible |
| 2 | Empty: "chua co san pham nao" | Text visible |
| 3 | Empty: TIEP TUC MUA SAM → /san-pham | Link click → URL match |
| 4 | Heading gio hang voi so luong | Heading visible |
| 5 | Danh sach san pham | 2 ten SP visible (dung first()) |
| 6 | Tong don hang | "Tong don hang" visible |
| 7 | Link TIEN HANH THANH TOAN | Link visible |
| 8 | Free ship bar | Text "MIEN PHI VAN CHUYEN" hoac "mua them" visible |
| 9 | Click THANH TOAN → /thanh-toan | Desktop link → URL match |

### 5. Checkout — Guest (4 tests)

| # | Test | Ky vong |
|---|------|---------|
| 1 | Guest vao checkout KHONG bi redirect | h1 "Thanh toan" visible |
| 2 | Goi y dang nhap (khong bat buoc) | Banner + link "Tao tai khoan" visible |
| 3 | Review step co nut TIEP TUC | Button visible |
| 4 | Full flow: review → shipping → payment | Fill form → 3 steps → DAT HANG visible |

### 6. Checkout — Authenticated (2 tests)

| # | Test | Ky vong |
|---|------|---------|
| 1 | KHONG thay goi y dang nhap | Banner NOT visible |
| 2 | Full flow + chuyen khoan | Chon bank → thong tin chuyen khoan visible |

**Ky thuat:** Seed auth bang cookie + localStorage (ca customer va admin dung zustand persist)

### 7. Checkout — Validation (5 tests)

| # | Test | Ky vong |
|---|------|---------|
| 1 | Cart trong hien thong bao | "Gio hang trong" visible |
| 2 | Shipping nut disabled khi chua dien | Button disabled |
| 3 | QUAY LAI ve review | Button TIEP TUC hien lai |
| 4 | COD mac dinh | "Thanh toan khi nhan hang" visible |
| 5 | Order summary desktop sidebar | Heading "Tong don hang" visible |

### 8. Review step chi tiet (2 tests)

| # | Test | Ky vong |
|---|------|---------|
| 1 | Accordion hien so luong SP | Button "san pham" visible |
| 2 | Mobile order summary co details element | `<details>` element ton tai |

## Seed data

```typescript
// Cart: 2 san pham, tong 1,630,000d
// Auth customer: role=0, email customer@test.vn
// Auth admin: role=1, email admin@fashionecom.vn
// Persist keys: fashionecom-cart, fashionecom-auth
// Cookie: fashionecom-auth-token (cho middleware check)
```
