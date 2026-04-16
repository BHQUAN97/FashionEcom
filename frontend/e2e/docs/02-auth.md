# 02. Auth — Login & Register — Xac thuc khach hang

## Summary

Kiem tra luong xac thuc khach hang: trang dang nhap render form dung, toggle password, links Quen mat khau / Dang ky, login thanh cong redirect, va trang dang ky. Day la auth phia customer (khong phai admin).

**File test:** `e2e/auth.spec.ts`
**So test:** 6 (4 login + 2 register)
**Trang:** `/dang-nhap`, `/dang-ky`

## Workflow

```
User truy cap /dang-nhap
  → Form: email + password + DANG NHAP button
  → Links: Quen mat khau? + Dang ky ngay
  → Toggle password visibility (type password ↔ text)
  → Submit → POST login → redirect /tai-khoan

User truy cap /dang-ky
  → Form dang ky hien thi
  → Hoac: click "Dang ky ngay" tu /dang-nhap → navigate /dang-ky
```

## Chi tiet cac test case

### Auth — Login (4 tests)

#### TC-01: login page render form dung
- **Muc dich:** Form login co day du: heading "Dang nhap", email input, password input, button
- **Buoc:** Goto `/dang-nhap` → verify tung element
- **Ky vong:** Heading + email placeholder `email@example.com` + password placeholder `Nhap mat khau` + button `DANG NHAP`
- **Ky thuat:** `getByRole('heading')`, `getByPlaceholder()`, `getByRole('button')`

#### TC-02: login form co link Quen mat khau va Dang ky
- **Muc dich:** Co links phu tro phia duoi form
- **Buoc:** Goto `/dang-nhap` → kiem tra 2 links
- **Ky vong:** Link "Quen mat khau?" va "Dang ky ngay" visible

#### TC-03: toggle hien/an mat khau
- **Muc dich:** Click toggle button → chuyen password field tu `type="password"` sang `type="text"`
- **Buoc:** Verify type="password" → click toggle button → verify type="text"
- **Ky vong:** Input type thay doi
- **Ky thuat:** Tim toggle button bang sibling selector `input + button` hoac `input ~ button`

#### TC-04: login thanh cong redirect den /tai-khoan
- **Muc dich:** Dien form va submit → redirect ve trang tai khoan
- **Buoc:** Fill email `test@example.com` + password `password123` → click DANG NHAP → waitForURL `/tai-khoan`
- **Ky vong:** URL = `/tai-khoan` sau 5s timeout
- **Giai phap khi fail:** Kiem tra login API handler → mock login logic → redirect target

### Auth — Register (2 tests)

#### TC-05: register page render form dung
- **Muc dich:** Trang dang ky hien thi form
- **Buoc:** Goto `/dang-ky` → verify heading "Dang ky"
- **Ky vong:** Heading visible

#### TC-06: click Dang ky ngay tu login page
- **Muc dich:** Link "Dang ky ngay" navigate den /dang-ky
- **Buoc:** Goto `/dang-nhap` → click link → verify URL
- **Ky vong:** URL = `/dang-ky`
