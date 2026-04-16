# 08. Checkout — Thanh toan

## Summary

Kiem tra luong thanh toan `/thanh-toan` voi 3 steps: Review → Shipping → Payment. Bao gom: gio hang trong, review step (order summary, accordion), shipping step (form fields, validation, navigation), va order summary panel desktop. Cart data duoc seed qua localStorage.

**File test:** `e2e/checkout.spec.ts`
**So test:** 12 (2 empty + 4 review + 5 shipping + 1 summary)
**Trang:** `/thanh-toan`

## Workflow

```
Gio hang trong:
  /thanh-toan → "Gio hang trong" (khong hien form)

Co san pham — 3 steps:
  Step 1: Review
    → Heading "Thanh toan"
    → Accordion "Don hang (2 san pham)" → expand → ten + mau + size
    → Nut TIEP TUC → chuyen sang Step 2

  Step 2: Shipping
    → Form: Ho ten, SDT, Tinh/Thanh, Quan/Huyen, Phuong/Xa, Dia chi, Ghi chu
    → Nut CHON THANH TOAN disabled khi chua dien du
    → Nut QUAY LAI → ve Step 1
    → Dien du → enable nut → click → Step 3

  Step 3: Payment
    → Nut DAT HANG hien thi

Desktop sidebar:
  → "Tong don hang" hien thi ben phai
```

## Chi tiet cac test case

### Checkout — Gio hang trong (2 tests)

#### TC-01: hien thong bao khi gio hang trong
- **Muc dich:** Checkout page xu ly cart empty
- **Buoc:** Clear localStorage → goto `/thanh-toan`
- **Ky vong:** "Gio hang trong" visible

#### TC-02: khong hien form shipping khi gio hang trong
- **Muc dich:** Khong cho dien form khi khong co san pham
- **Ky vong:** "Thong tin giao hang" NOT visible

### Checkout — Review step (4 tests)

#### TC-03: hien heading "Thanh toan"
- **Muc dich:** Page heading render dung
- **Ky vong:** `h1` "Thanh toan" visible

#### TC-04: hien order summary voi san pham tu cart
- **Muc dich:** Accordion hien danh sach san pham
- **Buoc:** Click accordion trigger → verify ten san pham
- **Ky vong:** "Ao Polo Nam Cao Cap" va "Quan Tay Slim Fit" visible

#### TC-05: hien thi mau sac va size cua san pham
- **Muc dich:** Variant info hien trong order summary
- **Buoc:** Expand accordion → kiem tra text
- **Ky vong:** "Den...L" va "Xam...M" visible

#### TC-06: co nut TIEP TUC de chuyen sang shipping
- **Muc dich:** Navigation button hoat dong
- **Buoc:** Click TIEP TUC → verify shipping form hien
- **Ky vong:** "Thong tin giao hang" visible sau click

### Checkout — Shipping step (5 tests)

#### TC-07: hien day du form fields
- **Muc dich:** Form co tat ca fields can thiet
- **Ky vong:** Ho ten, SDT, Tinh/Thanh, Quan/Huyen, Phuong/Xa, Dia chi, Ghi chu — tat ca visible

#### TC-08: nut CHON THANH TOAN bi disabled khi chua dien du
- **Muc dich:** Form validation prevent next step
- **Ky vong:** Button disabled

#### TC-09: co nut QUAY LAI de quay ve review
- **Muc dich:** Back navigation hoat dong
- **Buoc:** Click QUAY LAI → verify accordion "san pham" hien lai
- **Ky vong:** Review step visible

#### TC-10: dien form shipping va enable nut next
- **Muc dich:** Dien du thong tin → button enabled
- **Buoc:** Fill ho ten, SDT, chon Tinh/Thanh (79=HCM), Quan (760=Q1), dia chi
- **Ky vong:** Button CHON THANH TOAN enabled
- **Ky thuat:** `selectOption('79')` cho Tinh, doi `select` nth(1) attached roi chon Quan

#### TC-11: dien form day du va chuyen sang payment step
- **Muc dich:** Full flow review → shipping → payment
- **Buoc:** Dien form → click CHON THANH TOAN
- **Ky vong:** Button DAT HANG visible

### Checkout — Order summary panel (1 test)

#### TC-12: hien tong don hang tren desktop
- **Muc dich:** Desktop sidebar summary hien thi
- **Ky vong:** Heading "Tong don hang" visible
- **Ky thuat:** Dung `last()` vi mobile va desktop co 2 element, mobile bi hidden

## Seed data

```typescript
// 2 san pham: Ao Polo (590k x2) + Quan Tay (450k x1) = 1,630,000d
// Seed qua localStorage key "fashionecom-cart"
```
