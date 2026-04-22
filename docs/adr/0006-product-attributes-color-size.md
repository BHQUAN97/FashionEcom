# ADR-0006: Product attributes — Color (HEX swatch), Size (group), Material

- **Status**: accepted
- **Date**: 2026-04-14
- **Tags**: domain, pattern

## Context

Thoi trang co variant: ao thun 3 mau x 5 size = 15 SKU. User expect chon theo swatch color + size dropdown. Options:
1. **Option string JSON** trong product — don gian nhung query kho
2. **Table variant rieng** voi color/size column — chuan hon
3. **Table attribute + variant** — flexible nhat (add attribute "Material" sau khong can migration)

## Decision

**Normalized attributes + variant table**:

### Attributes
```sql
cat_color (color_id, color_code, color_name, hex_code)
  e.g., ('red', 'Do', '#D0021B'), ('blue', 'Xanh', '#4A90E2')

cat_size (size_id, size_code, size_group_id)
  - size_group_id: 'clothing' (S/M/L/XL/XXL), 'shoes' (36/37/38...), 'accessories' ('Free size')

cat_material (material_id, name, description)
  e.g., ('cotton', 'Cotton 100%'), ('polyester', 'Polyester')
```

### Variant
```sql
cat_product_variant (
  variant_id, product_id, sku,
  color_id, size_id, material_id,
  stock_quantity, price_override  -- optional, if NULL use product.price
)
```

### Frontend Product detail
- Render color swatch tu `hex_code` (clickable, border when selected)
- Size dropdown grouped (neu product group clothing → hien S/M/L/XL)
- Khi user chon color + size → tim variant → hien stock + price
- Disable option neu variant out of stock

## Rationale

- Normalized cho query: "tat ca san pham co color Do" = join `cat_color`
- Add attribute moi (Pattern, Style...) = them table, khong ALTER variant
- SKU o variant level = inventory/warehouse track chinh xac

## Consequences

### Tich cuc
- Filter/search san pham theo attribute linh hoat
- Admin quan ly attribute tap trung (add color mới = them 1 row, khong phai sua moi variant)
- Variant-level pricing (size XXL co the dat hon M)

### Tieu cuc
- JOIN 3-4 table moi khi query variant → phai index + cache
- Create product UI phuc tap (generate N variant tu color x size)

### Rui ro
- **Variant combination explosion**: 5 color x 8 size x 3 material = 120 variant → mitigation: auto-generate tool

## Alternatives Considered

### JSON trong product
- **Nhuoc**: query kho, no schema enforcement

### EAV (Entity-Attribute-Value)
- **Uu**: super flexible
- **Nhuoc**: query rat cham, over-engineer

## References

- `backend/src/modules/products/attributes/`
- `db/changelog/1.0.0/005__product_attributes.sql`
