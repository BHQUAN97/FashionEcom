-- =============================================
-- Author:      Claude Code
-- Create date: 2026-04-14
-- Description: Them FK cat_color_id, cat_size_id vao cat_product_variant
--              Fix collation mismatch (variant=ai_ci, color/size=as_ci)
-- =============================================

USE fashion_ecom;

-- Cot da duoc ADD tu lan chay truoc (neu co), nen dung MODIFY de fix collation
-- Neu cot chua ton tai thi ADD truoc
SET @has_color_col = (
  SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'fashion_ecom'
    AND TABLE_NAME = 'cat_product_variant'
    AND COLUMN_NAME = 'cat_color_id'
);

-- Them cot neu chua co
SET @stmt := (SELECT IF(@has_color_col = 0,
  'ALTER TABLE cat_product_variant ADD COLUMN cat_color_id CHAR(36) COLLATE utf8mb4_0900_ai_ci NULL COMMENT ''FK mau sac'' AFTER cat_product_variant_status',
  'SELECT 1'));
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @stmt := (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = 'fashion_ecom' AND TABLE_NAME = 'cat_product_variant'
       AND COLUMN_NAME = 'cat_size_id') = 0,
  'ALTER TABLE cat_product_variant ADD COLUMN cat_size_id CHAR(36) COLLATE utf8mb4_0900_ai_ci NULL COMMENT ''FK kich thuoc'' AFTER cat_color_id',
  'SELECT 1'));
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Fix collation cho cot FK khop voi bang tham chieu (as_ci)
ALTER TABLE cat_product_variant
    MODIFY COLUMN cat_color_id CHAR(36) COLLATE utf8mb4_0900_ai_ci NULL COMMENT 'FK mau sac',
    MODIFY COLUMN cat_size_id CHAR(36) COLLATE utf8mb4_0900_ai_ci NULL COMMENT 'FK kich thuoc';

-- Tao FK constraints
ALTER TABLE cat_product_variant
    ADD CONSTRAINT fk_catproductvariant_catcolor
        FOREIGN KEY (cat_color_id) REFERENCES cat_color(cat_color_id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_catproductvariant_catsize
        FOREIGN KEY (cat_size_id) REFERENCES cat_size(cat_size_id) ON DELETE RESTRICT;

-- Index cho FK
CREATE INDEX ix_catproductvariant_catcolorid ON cat_product_variant(cat_color_id);
CREATE INDEX ix_catproductvariant_catsizeid ON cat_product_variant(cat_size_id);

-- Unique: 1 product khong co 2 variant cung color+size
CREATE UNIQUE INDEX uix_catproductvariant_product_color_size
    ON cat_product_variant(cat_product_id, cat_color_id, cat_size_id);
