-- =============================================
-- Author:      Claude
-- Create date: 2026-04-15
-- Description: Them truong product attributes va shipping (Shopee-style)
-- =============================================

ALTER TABLE cat_product
  ADD COLUMN cat_product_origin VARCHAR(100) NULL AFTER cat_product_brand,
  ADD COLUMN cat_product_material VARCHAR(255) NULL AFTER cat_product_origin,
  ADD COLUMN cat_product_packaging_type VARCHAR(50) NULL AFTER cat_product_material,
  ADD COLUMN cat_product_condition VARCHAR(20) DEFAULT 'new' AFTER cat_product_packaging_type,
  ADD COLUMN cat_product_weight DECIMAL(18,4) NOT NULL DEFAULT 0 AFTER cat_product_condition,
  ADD COLUMN cat_product_length DECIMAL(18,4) NOT NULL DEFAULT 0 AFTER cat_product_weight,
  ADD COLUMN cat_product_width DECIMAL(18,4) NOT NULL DEFAULT 0 AFTER cat_product_length,
  ADD COLUMN cat_product_height DECIMAL(18,4) NOT NULL DEFAULT 0 AFTER cat_product_width,
  ADD COLUMN cat_product_pre_order TINYINT NOT NULL DEFAULT 0 AFTER cat_product_height,
  ADD COLUMN cat_product_pre_order_days INT NOT NULL DEFAULT 7 AFTER cat_product_pre_order;
