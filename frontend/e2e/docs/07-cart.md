# 07. Cart — Gio hang

## Summary

Kiem tra trang gio hang `/gio-hang`: empty state khi khong co san pham, va state co san pham (heading, link thanh toan). Cart data duoc seed qua localStorage (zustand persist key `fashionecom-cart`).

**File test:** `e2e/cart.spec.ts`
**So test:** 4 (2 empty + 2 with items)
**Trang:** `/gio-hang`

## Workflow

```
Gio hang trong:
  /gio-hang → "Gio hang trong" + link "TIEP TUC MUA SAM"

Gio hang co san pham:
  Seed cart via localStorage → /gio-hang
  → Heading "Gio hang"
  → Link "TIEN HANH THANH TOAN"
```

## Chi tiet cac test case

### Cart — Empty (2 tests)

#### TC-01: gio hang trong hien thi empty state
- **Muc dich:** Khi khong co san pham, hien thong bao
- **Buoc:** Clear localStorage → goto `/gio-hang` → kiem tra text
- **Ky vong:** "Gio hang trong" visible
- **Ky thuat:** `localStorage.clear()` truoc khi navigate — phai goto 1 trang storefront truoc de co access localStorage

#### TC-02: co link TIEP TUC MUA SAM
- **Muc dich:** Empty cart co link quay lai mua sam
- **Buoc:** Clear localStorage → goto `/gio-hang` → kiem tra link
- **Ky vong:** Link "TIEP TUC MUA SAM" visible

### Cart — Co san pham (2 tests)

#### TC-03: hien thi heading gio hang
- **Muc dich:** Cart page co heading
- **Buoc:** Seed cart → goto `/gio-hang` → kiem tra heading
- **Ky vong:** Heading "Gio hang" visible

#### TC-04: co link thanh toan
- **Muc dich:** Co link de chuyen sang checkout
- **Buoc:** Seed cart → goto `/gio-hang` → kiem tra link
- **Ky vong:** Link "TIEN HANH THANH TOAN" visible
- **Ky thuat:** Dung `first()` vi mobile va desktop co the render 2 links (sticky CTA)

## Seed data

```typescript
// 1 san pham: Ao Polo Nam Cao Cap, Den, L, 590,000d, qty 2
localStorage.setItem('fashionecom-cart', JSON.stringify({
  state: {
    items: [{
      variantId: 'v1', productId: 'prod-1',
      name: 'Ao Polo Nam Cao Cap', slug: 'san-pham-1',
      color: 'Den', size: 'L', price: 590000, qty: 2,
      image: '', sku: 'POLO-DEN-L', max_qty: 10
    }]
  },
  version: 0
}));
```
