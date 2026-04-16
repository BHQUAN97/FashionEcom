# 04. Responsive — Layout tren cac viewport

## Summary

Kiem tra layout responsive tren mobile (375x812) va desktop (default). Dam bao cac element quan trong hien thi dung tren tung viewport: mobile search bar, bottom tab bar, nut Bo loc, desktop nav links, footer.

**File test:** `e2e/responsive.spec.ts`
**So test:** 5 (3 mobile + 2 desktop)
**Trang:** `/san-pham`

## Workflow

```
Mobile (375x812):
  Header → search bar full-width
  Bottom → tab bar (Trang chu, Tai khoan...)
  /san-pham → nut "Bo loc" (thay sidebar)

Desktop (default viewport):
  Header → nav links (San pham, Ao nam...)
  Footer → brand name FASHION ECOM
```

## Chi tiet cac test case

### Responsive — Mobile (3 tests)

#### TC-01: mobile header hien thi search bar
- **Muc dich:** Mobile co search bar ngay trong header
- **Buoc:** Set viewport 375x812 → goto `/san-pham` → kiem tra input "Tim kiem"
- **Ky vong:** Search input visible
- **Ky thuat:** `page.setViewportSize({ width: 375, height: 812 })`

#### TC-02: bottom tab bar hien thi
- **Muc dich:** Mobile co bottom navigation bar
- **Buoc:** Set viewport 375x812 → goto `/san-pham` → kiem tra nav cuoi cung
- **Ky vong:** "Trang chu" va "Tai khoan" visible trong nav cuoi
- **Ky thuat:** `page.locator('nav').last()` — bottom tab bar la nav cuoi trang

#### TC-03: san-pham: nut Bo loc hien thi
- **Muc dich:** Mobile thay sidebar filter bang nut "Bo loc"
- **Buoc:** Set viewport 375x812 → goto `/san-pham` → kiem tra button
- **Ky vong:** Button "Bo loc" visible
- **Giai phap khi fail:** Kiem tra FilterSidebar → mobile breakpoint → button render condition

### Responsive — Desktop (2 tests)

#### TC-04: desktop header hien thi nav links
- **Muc dich:** Desktop header co cac nav links chinh
- **Buoc:** Goto `/san-pham` → kiem tra `header a[href="/san-pham"]` va `header a[href="/danh-muc/ao-nam"]`
- **Ky vong:** Ca 2 links visible

#### TC-05: footer hien thi
- **Muc dich:** Footer hien thi tren desktop
- **Buoc:** Goto `/san-pham` → kiem tra footer heading "FASHION ECOM"
- **Ky vong:** Heading visible
