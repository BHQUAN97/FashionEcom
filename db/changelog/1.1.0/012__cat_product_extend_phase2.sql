-- =============================================
-- Author:      Claude Code
-- Create date: 2026-04-10
-- Description: Mo rong cat_product: them tags, modified_date (bo sung tu Phase 1)
-- =============================================

USE fashion_ecom;

ALTER TABLE cat_product
    ADD COLUMN cat_product_tags TEXT NULL COMMENT 'Tags JSON array' AFTER cat_product_is_new,
    ADD COLUMN modified_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Ngay cap nhat';
