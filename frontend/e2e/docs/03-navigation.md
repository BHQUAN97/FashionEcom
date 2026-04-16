# 03. Navigation — Dieu huong nguoi dung

## Summary

Kiem tra cac route chinh hoat dong dung: click nav links trong header, click product card vao detail page, click logo ve trang chu, va footer links hien thi. Dam bao nguoi dung di chuyen giua cac trang khong gap loi.

**File test:** `e2e/navigation.spec.ts`
**So test:** 5
**Trang:** `/san-pham`, `/danh-muc/*`, `/san-pham/[slug]`, `/`

## Workflow

```
/san-pham → [click SAN PHAM MOI] → /san-pham
/san-pham → [click AO NAM] → /danh-muc/ao-nam
/san-pham → [click product card] → /san-pham/[slug]
/san-pham → [click brand logo] → /
/san-pham → footer links visible (van chuyen, doi tra)
```

## Chi tiet cac test case

### TC-01: click SAN PHAM MOI di den /san-pham
- **Muc dich:** Nav link header hoat dong
- **Buoc:** Goto `/san-pham` → click `header a[href="/san-pham"]` → verify URL
- **Ky vong:** URL = `/san-pham`

### TC-02: click AO NAM di den /danh-muc/ao-nam
- **Muc dich:** Category nav link hoat dong
- **Buoc:** Click `header a[href="/danh-muc/ao-nam"]` → verify URL
- **Ky vong:** URL = `/danh-muc/ao-nam`

### TC-03: click product card di den product detail
- **Muc dich:** Product card link dua den detail page
- **Buoc:** Click `a[href^="/san-pham/"]` dau tien → verify URL match pattern
- **Ky vong:** URL match `/san-pham/.+`
- **Ky thuat:** Regex URL assertion `toHaveURL(/\/san-pham\/.+/)`

### TC-04: click brand logo di den trang chu
- **Muc dich:** Logo link navigate ve homepage
- **Buoc:** Click `header a[href="/"].text-2xl` → verify URL
- **Ky vong:** URL = `/`
- **Ky thuat:** Selector cu the cho desktop logo (class `text-2xl`)

### TC-05: footer links hien thi
- **Muc dich:** Footer co cac policy links
- **Buoc:** Kiem tra `footer a[href="/chinh-sach/van-chuyen"]` va `footer a[href="/chinh-sach/doi-tra"]`
- **Ky vong:** Ca 2 links visible
