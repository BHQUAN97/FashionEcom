# 05. Collection Page — Trang danh sach san pham

## Summary

Kiem tra trang collection `/san-pham`: heading, product grid, sort dropdown, filter sidebar. Day la trang chinh de khach hang duyet san pham.

**File test:** `e2e/collection.spec.ts`
**So test:** 5
**Trang:** `/san-pham`

## Workflow

```
User truy cap /san-pham
  → Heading "Tat ca san pham"
  → Product grid (cards voi link den detail)
  → Sort dropdown (sap xep)
  → Filter sidebar (Bo loc: danh muc, gia, size, mau)
```

## Chi tiet cac test case

### TC-01: hien thi heading san pham
- **Muc dich:** Trang co heading chinh
- **Buoc:** Goto `/san-pham` → kiem tra heading chua "san pham"
- **Ky vong:** Heading visible

### TC-02: hien thi danh sach san pham
- **Muc dich:** Product grid co it nhat 1 san pham
- **Buoc:** Goto `/san-pham` → dem `a[href^="/san-pham/"]`
- **Ky vong:** Count >= 1
- **Giai phap khi fail:** Kiem tra API product list → co data? → pagination?

### TC-03: click product di den detail page
- **Muc dich:** Product card link hoat dong
- **Buoc:** Click `.product-loop a[href^="/san-pham/"]` dau tien → verify URL
- **Ky vong:** URL match `/san-pham/.+`

### TC-04: sort select hien thi
- **Muc dich:** Dropdown sap xep hien thi tren desktop
- **Buoc:** Tim `select` hoac `[role="combobox"]` dau tien
- **Ky vong:** Element visible

### TC-05: filter sidebar hien thi tren desktop
- **Muc dich:** Sidebar filter co heading "Bo loc"
- **Buoc:** Tim `aside` → kiem tra text "Bo loc"
- **Ky vong:** Text visible trong aside
