# 01. Homepage / Storefront Layout — Layout cua hang

## Summary

Kiem tra layout storefront (announcement bar, header, footer) tren route `/san-pham`. Layout nay chi render tren cac storefront routes (thuoc route group `(storefront)`), KHONG phai trang chu `/`. Test dam bao cac thanh phan chinh cua layout hien thi dung.

**File test:** `e2e/homepage.spec.ts`
**So test:** 4
**Trang:** `/san-pham`

## Workflow

```
User truy cap /san-pham
  → Storefront layout render:
    → Announcement bar ("Mien phi giao hang...")
    → Desktop header (brand logo FASHION + nav links)
    → Page content (product collection)
    → Footer (FASHION ECOM + payment methods)
```

## Chi tiet cac test case

### TC-01: render announcement bar
- **Muc dich:** Dam bao announcement bar (free shipping banner) hien thi
- **Buoc:** Goto `/san-pham` → kiem tra text "Mien phi giao hang"
- **Ky vong:** Text visible
- **Ky thuat:** `page.getByText(/Mien phi giao hang/i)`

### TC-02: render brand logo FASHION
- **Muc dich:** Logo thuong hieu hien thi trong desktop header
- **Buoc:** Goto `/san-pham` → tim desktop header → kiem tra `a[href="/"]` visible
- **Ky vong:** Logo link visible
- **Ky thuat:** Locator desktop header voi class `hidden md:block` de tranh trung voi mobile header

### TC-03: render desktop header nav links
- **Muc dich:** Nav links chinh hien thi trong header
- **Buoc:** Goto `/san-pham` → kiem tra `a[href="/san-pham"]` va `a[href="/danh-muc/sale"]`
- **Ky vong:** Ca 2 links visible
- **Giai phap khi fail:** Kiem tra header component → CSS responsive rules → link href thay doi?

### TC-04: render footer
- **Muc dich:** Footer hien thi voi brand name va payment methods
- **Buoc:** Goto `/san-pham` → kiem tra heading "FASHION ECOM" va text "COD | MoMo | VNPAY | ZaloPay"
- **Ky vong:** Ca 2 elements visible trong footer
- **Giai phap khi fail:** Kiem tra Footer component → text content thay doi?
