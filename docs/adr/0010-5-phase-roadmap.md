# ADR-0010: 5-phase roadmap

- **Status**: accepted
- **Date**: 2026-04-10
- **Tags**: roadmap, scope

## Context

Scope lon (30+ module tiem nang). Neu lam tat ca cung luc = roi loan. Solo dev can phase ro rang.

## Decision

### Phase 1: Storefront (5-7 tuan) — current
- Homepage, product list, product detail, cart, checkout COD
- Auth (login/register/guest checkout)
- Basic admin (orders list, product CRUD)

### Phase 2: Admin Core (4-5 tuan)
- Full admin dashboard
- Inventory multi-warehouse
- Promotions + coupons
- Review/rating
- Payment gateways (MoMo, VNPAY, bank transfer)

### Phase 3: Analytics (3-4 tuan)
- Page view tracking
- Revenue reports (daily, monthly, P&L)
- Customer RFM analysis
- Inventory alerts

### Phase 4: Layout Builder (3-4 tuan)
- Homepage section DnD (admin edit)
- Menu builder (nav + footer)
- Theme customization (color, font)
- Draft mode preview

### Phase 5: Advanced (3-4 tuan)
- Meilisearch integration
- Multi-language / multi-currency
- R2 migration (ADR-0009)
- Loyalty tier program

## Rationale

- Phase 1 = MVP launchable
- Phase khac stackable
- 5 phase × 4 tuan = 5 thang total (linh hoat)

## Consequences

### Tich cuc
- Focus theo phase, khong FOMO feature
- Ship increment → thu feedback som

### Tieu cuc
- Phase later can refactor neu Phase 1 thiet ke sai
- User muon feature Phase 5 ngay → phai no

## References

- `.sdd/constitution.md` "Phase Timeline"
