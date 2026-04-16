# 06. Search — Tim kiem san pham

## Summary

Kiem tra chuc nang tim kiem: search input trong header (mobile/desktop), bottom tab bar, trang `/tim-kiem` voi auto-focus, tim kiem pho bien, ket qua tim kiem, xu ly khong tim thay, nut xoa, va click tu khoa pho bien. Bao gom ca mobile va desktop behavior.

**File test:** `e2e/search.spec.ts`
**So test:** 12 (4 header + 8 search page)
**Trang:** `/san-pham` (header), `/tim-kiem`

## Workflow

```
Mobile:
  Header → search bar full-width (type="search")
  Bottom tab bar → link "Tim kiem" → /tim-kiem

Desktop:
  Header → button "Tim kiem" (aria-label)

Trang /tim-kiem:
  → Input auto-focus
  → Mac dinh: hien "Tim kiem pho bien"
  → Nhap tu khoa + Enter → ket qua "Tim thay X san pham"
  → Tu khoa khong co → "Khong tim thay san pham"
  → Submit rong → khong lam gi
  → Nut X → reset input
  → Click tu khoa pho bien → thuc hien tim kiem
```

## Chi tiet cac test case

### Search — Header (4 tests)

#### TC-01: mobile: search bar hien thi trong header
- **Muc dich:** Mobile header co search bar
- **Buoc:** Set viewport 375x667 → goto `/san-pham` → kiem tra input type="search" trong header
- **Ky vong:** Input visible voi placeholder "Tim kiem san pham"

#### TC-02: desktop: nut tim kiem hien thi trong header
- **Muc dich:** Desktop header co search button
- **Buoc:** Goto `/san-pham` → kiem tra `button[aria-label="Tim kiem"]`
- **Ky vong:** Button visible

#### TC-03: mobile: bottom tab bar co link Tim kiem
- **Muc dich:** Bottom tab bar co tab Tim kiem
- **Buoc:** Set viewport 375x667 → kiem tra `nav a[href="/tim-kiem"]`
- **Ky vong:** Link visible voi text "Tim kiem"

#### TC-04: mobile: click tab Tim kiem di den /tim-kiem
- **Muc dich:** Click tab navigate den search page
- **Buoc:** Click `nav a[href="/tim-kiem"]` → verify URL
- **Ky vong:** URL = `/tim-kiem`

### Search — Trang /tim-kiem (8 tests)

#### TC-05: render search input voi auto-focus
- **Muc dich:** Search page co input
- **Buoc:** Goto `/tim-kiem` → kiem tra input type="search"
- **Ky vong:** Input visible voi placeholder "Tim kiem san pham"

#### TC-06: hien thi tim kiem pho bien khi chua nhap gi
- **Muc dich:** Default state hien danh sach popular keywords
- **Buoc:** Goto `/tim-kiem` → kiem tra text "Tim kiem pho bien"
- **Ky vong:** Text visible

#### TC-07: nhap tu khoa va submit hien ket qua
- **Muc dich:** Tim kiem "Ao Polo" tra ve ket qua
- **Buoc:** Fill "Ao Polo" → press Enter → cho ket qua
- **Ky vong:** Text "Tim thay X san pham" visible (timeout 5s)
- **Ky thuat:** Debounce 300ms + render time

#### TC-08: tu khoa khong co ket qua hien thong bao
- **Muc dich:** Tu khoa khong hop le hien empty state
- **Buoc:** Fill "xyzkhongtontai999" → Enter → cho
- **Ky vong:** Text "Khong tim thay san pham" visible

#### TC-09: submit form rong khong thuc hien tim kiem
- **Muc dich:** Enter khi input rong khong trigger search
- **Buoc:** Fill "" → Enter → kiem tra trang thai
- **Ky vong:** Van hien "Tim kiem pho bien", khong co ket qua

#### TC-10: nut xoa (X) reset input ve rong
- **Muc dich:** Clear button reset search state
- **Buoc:** Fill "Ao Polo" → click button "Xoa" → verify
- **Ky vong:** Input value = "", hien lai "Tim kiem pho bien"
- **Ky thuat:** `button[aria-label="Xoa"]`

#### TC-11: click tu khoa pho bien thuc hien tim kiem
- **Muc dich:** Click popular keyword triggers search
- **Buoc:** Click button "ao polo" → cho ket qua
- **Ky vong:** Text "Tim thay X san pham" visible
- **Ky thuat:** `getByRole('button', { name: /ao polo|ao polo/i })`
