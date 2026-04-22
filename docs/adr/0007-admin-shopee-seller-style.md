# ADR-0007: Admin panel Shopee Seller Center style

- **Status**: accepted
- **Date**: 2026-04-16
- **Tags**: frontend, ux

## Context

Admin panel default Ant Design / shadcn dashboard theme = generic. Chu shop VN quen dung Shopee Seller Center → muon admin panel theo style do:
- Sidebar trai (mau trang, highlight cam)
- Top bar voi notification + user menu
- Multi-tab layout: khi mo nhieu page cung luc thi chia tab (nhu browser) → chuyen qua lai nhanh
- Orange theme (`#EE4D2D` Shopee-ish, adjust cho brand)
- Card-heavy layout (ro rang section)

## Decision

Admin UI pattern:
- **Sidebar collapsible** trai: logo + menu tree (Orders, Products, Analytics...)
- **Top bar**: notification bell, user dropdown, shop selector (neu multi-shop)
- **Multi-tab** trong content area: moi click menu mo tab moi, giu state khi chuyen tab
- **Orange accent** (`#D0021B` dung cho CTA, `#EE4D2D` cho active state)
- **Card layout**: moi section trong card (rounded corners, shadow)
- **Mobile admin**: sidebar → drawer, tabs → dropdown

## Rationale

- Learning curve thap cho chu shop quen Shopee
- Multi-tab: tang productivity (so sanh 2 order lien nhau)
- Orange = friendly, khac voi generic blue

## Consequences

### Tich cuc
- User feedback: "giong Shopee" → confident
- Multi-tab giam thao tac back/forward

### Tieu cuc
- Implement multi-tab tat phuc tap (state per tab, lazy load)
- Mobile admin UX khac desktop nhieu → test 3 breakpoint

## References

- Reference: shopee.vn/seller
- `frontend/src/app/(admin)/layout.tsx`
