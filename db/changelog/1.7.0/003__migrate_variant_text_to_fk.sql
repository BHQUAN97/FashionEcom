-- =============================================
-- Author:      Claude Code
-- Create date: 2026-04-14
-- Description: Migrate data tu cot text (color/size) sang FK
--              Fix collation mismatch bang COLLATE trong JOIN
-- =============================================

USE fashion_ecom;

-- Step 1: Migrate color text -> cat_color FK (match by name, fix collation)
UPDATE cat_product_variant v
    INNER JOIN cat_color c
        ON c.cat_color_name COLLATE utf8mb4_0900_ai_ci = v.cat_product_variant_color
SET v.cat_color_id = c.cat_color_id
WHERE v.cat_product_variant_color IS NOT NULL
  AND v.cat_color_id IS NULL;

-- Step 2: Migrate size text -> cat_size FK (match by value, fix collation)
UPDATE cat_product_variant v
    INNER JOIN cat_size s
        ON s.cat_size_value COLLATE utf8mb4_0900_ai_ci = v.cat_product_variant_size
SET v.cat_size_id = s.cat_size_id
WHERE v.cat_product_variant_size IS NOT NULL
  AND v.cat_size_id IS NULL;

-- Step 3: Drop cot text cu (chi chay sau khi verify migration thanh cong)
-- ALTER TABLE cat_product_variant DROP COLUMN cat_product_variant_color;
-- ALTER TABLE cat_product_variant DROP COLUMN cat_product_variant_size;
