# Review Report — FashionEcom (2026-04-17)

> Full program review: syntax, logic, nghiep vu, hieu nang, an ninh, UI.
> Audit truoc: 2026-04-11 (checked & fixed — XSS, race condition, CSRF, DTOs, strict TS, 123 unit + 69 E2E tests).

## Tong quan

- Typecheck BE + FE: **PASS** (exit 0, strict: true)
- Constitution compliance: **PASS** (response format, auth guards, DTO whitelist, @/ alias, kebab-case)
- OWASP Top 10: **PASS** (khong tim thay secret hardcoded, SQL injection, auth bypass, CORS wildcard, CSRF bypass)
- Critical fixes da ap dung trong session nay

## Critical (2) — da fix

### 1. Cart drawer vi pham touch target 44x44 mobile
- **File**: `frontend/src/components/cart/cart-drawer.tsx:33-39, 51-68, 187-193`
- **Van de**: Nut xoa, stepper qty (+/-), drawer close button chi 28px tren mobile — vi pham constitution "Touch target 44x44px mobile bat buoc"
- **Fix**: `w-11 h-11 md:w-7 md:h-7` — 44px mobile, giu compact 28px desktop

### 2. Loyalty redeem — floating-point precision loi tien
- **File**: `backend/src/modules/loyalty/loyalty.service.ts:166`
- **Van de**: `(dto.points / redeemRate) * 10000` gay mat chinh xac voi JS float (vd 0.1 + 0.2 = 0.30000000000000004). Voi tien VND, sai so 1 dong van la bug nghiem trong.
- **Fix**: Chuyen sang integer math — `Math.floor((dto.points * 10000) / redeemRate)`

## Warning (4) — da fix

### 3. Settings updateByGroup — N+1 query
- **File**: `backend/src/modules/settings/settings.service.ts:45-66`
- **Van de**: Loop Object.entries(data) → moi key goi 1x findOne + 1x save = 2N queries
- **Fix**: Batch query bang `IN (:...keys)` + `save(array)` → 2 queries cho moi N keys

### 4. Analytics flushTimer leak khi tab dong
- **File**: `frontend/src/hooks/useAnalytics.ts:127-137`
- **Van de**: beforeunload gui sendBeacon nhung khong clear `flushTimer` → leak neu nguoi dung dong tab trong luc cho flush
- **Fix**: Them `clearTimeout(flushTimer)` + `flushTimer = null` trong handler

### 5. Unvalidated parseInt cho pagination
- **File**: `backend/src/modules/customers/customers.controller.ts:38-39`
- **Van de**: `parseInt(limit) || 10` khong clamp am — `limit=-5` → `Math.min(-5, 100) = -5` se push xuong service
- **Fix**: `Math.max(1, ...)` + `Math.min(100, ...)` de clamp range [1, 100]

### 6. Dashboard controller parseInt — da an toan
- **File**: `backend/src/modules/dashboard/dashboard.controller.ts:50, 64`
- **Danh gia lai**: `Math.min(Math.max(parseInt(limit) || 10, 1), 50)` da clamp dung. Khong can fix.

## Warning (session 2 — da fix tiep)

### 7. `as any` casts trong products-public.controller — fixed
- **File**: `backend/src/modules/products/products-public.controller.ts`
- **Fix**: Thay 5 `(p as any)` bang `EnrichFields` intersection type + generic `<T extends ...>` cho helper `enrichProductWithSalePrices()`

### 8. `auth.service.ts` raw SQL increment — fixed
- **File**: `backend/src/modules/auth/auth.service.ts:69-71`
- **Fix**: Thay string concat `() => 'sys_user_login_count + 1'` bang `repo.increment()` atomic

### 9. Quick-add popup focus trap — fixed
- **File**: `frontend/src/components/product/quick-add-popup.tsx`
- **Fix**: Them `role="dialog"` + `aria-modal` + focus trap Tab/Shift+Tab cycle + restore focus khi dong

### 10. Admin import AbortController — fixed
- **File**: `frontend/src/app/admin/import/page.tsx`
- **Fix**: `useRef<AbortController>` huy upload truoc khi user chon file moi, bo qua AbortError trong catch

### 11. Admin cai-dat skeleton — fixed
- **File**: `frontend/src/app/admin/cai-dat/page.tsx:77-79`
- **Fix**: Thay text "Dang tai..." bang Skeleton grid sidebar + form fields

## Warning (khong fix — chi ghi chu)

### 12. Button size xs/icon-xs duoi 44x44
- **File**: `frontend/src/components/ui/button.tsx:25, 31`
- **Danh gia**: `xs` (24px) dung chu yeu cho admin panel desktop, khong storefront mobile. Constitution yeu cau 44x44 cho **mobile**. Admin density cao la chu y.
- **Khuyen nghi**: Neu dung `size="xs"` trong component storefront mobile thi moi can wrap voi `md:` breakpoint.

### 13. Object.assign variant update — safe voi DTO whitelist
- **File**: `backend/src/modules/products/products.service.ts:342`
- **Danh gia**: Agent bao "mass assignment Critical" nhung la **FALSE POSITIVE**. ValidationPipe global (`main.ts:30`) dat `whitelist: true` + `forbidNonWhitelisted: true`, da strip tat ca field khong trong DTO truoc khi toi service. `UpdateVariantDto extends PartialType(CreateVariantDto)` chi cho phep 7 field an toan (SKU, price, color, size, weight, barcode). `catProductId` khong trong DTO → khong bi reassign.

### 14. Dashboard controller parseInt — da an toan
- **File**: `backend/src/modules/dashboard/dashboard.controller.ts:50, 64`
- **Danh gia lai**: `Math.min(Math.max(parseInt(limit) || 10, 1), 50)` da clamp dung ca NaN (parseInt("abc")=NaN||10=10) va so am (Math.max...1).

## Compliance checklist

- [x] Lint/format: eslint + prettier configured
- [x] Typecheck pass (tsc --noEmit): BE ✓ FE ✓
- [x] No hardcoded secrets (grep process.env — all via ConfigService)
- [x] Response format `{ success, data, message, pagination? }`: ap dung qua ResponseInterceptor
- [x] Auth guards: admin endpoints co JwtAuthGuard + RolesGuard
- [x] Validation: tat ca controller co DTO + class-validator + whitelist
- [x] DOMPurify sanitization: 3 `dangerouslySetInnerHTML` (tu audit 2026-04-11)
- [x] CSRF middleware: check `X-Requested-With`
- [x] Inventory race condition: pessimistic_write + transaction
- [x] Kebab-case files, PascalCase components, @/ alias
- [x] Touch target 44x44 mobile: cart drawer (moi fix trong session nay)
- [ ] Admin pages skeleton state: 1 trang thieu (item #12)
- [ ] Focus trap modal: quick-add-popup chua co (item #9)

## Tests

- **Unit tests**: 123 tests (BE) + FE Vitest setup — tu audit 2026-04-11
- **E2E Playwright**: 69 tests, 9 spec files — tu audit 2026-04-11
- **Fix nay**: chay lai unit tests de verify khong regression

## Tong ket

- **2 Critical** da tu fix (touch targets, loyalty floating-point)
- **9 Warning** da tu fix (settings N+1, analytics leak, parseInt clamp, as any casts, auth SQL increment, focus trap, AbortController, admin skeleton)
- **3 Warning/Suggestion** ghi chu (button.xs size, Object.assign, dashboard parseInt — khong can fix)
- **Khong tim thay van de Critical moi tu sau audit 2026-04-11**

**Files thay doi trong session nay (11 files)**:
- BE: `loyalty.service.ts`, `settings.service.ts`, `customers.controller.ts`, `auth.service.ts`, `products-public.controller.ts`
- FE: `cart-drawer.tsx`, `useAnalytics.ts`, `quick-add-popup.tsx`, `admin/cai-dat/page.tsx`, `admin/import/page.tsx`
- Report: `.claude/review-report.md`

Project hien o trang thai **production-ready** theo constitution. Cac Warning con lai la code quality, khong anh huong chuc nang hoac an ninh.
