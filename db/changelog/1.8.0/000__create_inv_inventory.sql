-- =============================================
-- Create date: 2026-04-15
-- Description: Bang inv_inventory (ton kho theo variant)
--              Thiet ke theo fun_schema_goc: dung trong seed catalog 1.8.0
-- =============================================

USE fashion_ecom;

CREATE TABLE IF NOT EXISTS inv_inventory (
    inv_inventory_id          CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'PK — UUID',
    cat_product_variant_id    CHAR(36) NOT NULL COMMENT 'FK bien the san pham',
    inv_inventory_qty         DECIMAL(18,4) NOT NULL DEFAULT 0 COMMENT 'So luong ton kho',
    created_date              DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngay tao'
) COMMENT 'Ton kho theo bien the san pham';

SET @stmt := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.statistics
     WHERE table_schema = DATABASE() AND table_name = 'inv_inventory'
       AND index_name = 'ix_invinventory_variant') = 0,
  'ALTER TABLE inv_inventory ADD INDEX ix_invinventory_variant (cat_product_variant_id)',
  'SELECT 1'));
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;