-- =============================================
-- Author:      Claude Code
-- Create date: 2026-04-10
-- Description: Mo rong cat_product_variant: them compare_price, barcode, status
-- =============================================

USE fashion_ecom;

ALTER TABLE cat_product_variant
    ADD COLUMN cat_product_variant_compare_price DECIMAL(22,4) NOT NULL DEFAULT 0 COMMENT 'Gia goc (gia gach)' AFTER cat_product_variant_price,
    ADD COLUMN cat_product_variant_barcode VARCHAR(50) NULL COMMENT 'Barcode EAN/UPC',
    ADD COLUMN cat_product_variant_status TINYINT NOT NULL DEFAULT 1 COMMENT '0: An, 1: Hien';
