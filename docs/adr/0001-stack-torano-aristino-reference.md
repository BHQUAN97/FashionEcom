# ADR-0001: Stack + design reference Torano.vn + Aristino.com

- **Status**: accepted
- **Date**: 2026-04-10
- **Tags**: stack, design

## Context

E-commerce thoi trang co UX pattern rieng (product gallery, size guide, variant selector, flash sale countdown). Tu thiet ke tu dau = ton, khong so sanh duoc competitor. Thay vao do, pick 2 reference:
- **Torano.vn**: layout/UX priority (grid san pham, homepage section, mobile navigation)
- **Aristino.com**: checkout/navigation patterns (3-step checkout, account dashboard, footer structure)

## Decision

- **Stack**: Next.js 14 App Router + NestJS 10 + MySQL 8 + TypeORM + Redis + Tailwind + shadcn/ui
- **Architecture reference**: LeQuyDon (same stack group)
- **Design reference**:
  - Torano.vn — storefront layout
  - Aristino.com — checkout flow + account
- **Mobile-first**: breakpoint chinh 375px (PRIMARY), 768px tablet, 1280px desktop
- **Design system**:
  - Primary: `#1a1a1a` (black)
  - Accent: `#D0021B` (red CTA, Shopee-style)
  - Typography: Quicksand (Google Fonts)

## Rationale

- Torano dan dau thi truong thoi trang VN → pattern da proven
- Aristino formal checkout phu hop trust hoa
- Mobile-first vi >70% e-commerce traffic VN la mobile
- Stack = LeQuyDon → reuse patterns (auth, REST, MySQL)

## Consequences

### Tich cuc
- Design khong reinvent wheel
- Mobile UX tot ngay
- Code reuse cao tu LeQuyDon (JWT, RolesGuard...)

### Tieu cuc
- "Copy" design co the dung chung phong cach thi truong → can brand rieng sau
- Tailwind mobile-first breakpoint khong dung desktop-first

## References

- Design refs: Torano.vn, Aristino.com (screenshots in repo)
- Related: LeQuyDon ADR-0001 (same stack)
