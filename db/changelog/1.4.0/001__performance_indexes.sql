-- =============================================
-- Author:      FashionEcom
-- Create date: 2026-04-17
-- Description: Performance indexes — toi uu search LIKE %%,
--              dashboard/report queries va composite filters cho
--              sal_order va cat_product.
-- Muc dich:
--   1. FULLTEXT thay the cho LIKE '%keyword%' (khong su dung duoc B-Tree index)
--   2. Composite index cho cac truy van filter nhieu cot (dashboard, stats)
-- Luu y:
--   - Yeu cau MySQL 8.0.29+ (da co san CREATE INDEX IF NOT EXISTS).
--   - FULLTEXT khong ho tro IF NOT EXISTS → dung pattern check
--     information_schema.statistics truoc khi ADD.
--   - cat_product_variant.cat_product_variant_sku DA co UNIQUE index
--     (uix_catproductvariant_catproductvariantsku trong 1.0.0/001)
--     → bo qua, khong tao them index phu.
-- =============================================

-- ---------------------------------------------------------------
-- 1. FULLTEXT index cho sal_order_code
--    Dung cho: orders.service.ts:123 — qb.andWhere('o.salOrderCode LIKE :s')
--    va shipping-incident.service.ts:178
-- ---------------------------------------------------------------
SET @stmt := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.statistics
     WHERE table_schema = DATABASE()
       AND table_name   = 'sal_order'
       AND index_name   = 'ftx_sal_order_code') = 0,
  'ALTER TABLE sal_order ADD FULLTEXT INDEX ftx_sal_order_code (sal_order_code)',
  'SELECT 1'));
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------
-- 2. FULLTEXT index cho cat_product_name + cat_product_code
--    Dung cho: products.service.ts:61 —
--    qb.andWhere('(p.catProductName LIKE :s OR p.catProductCode LIKE :s)')
-- ---------------------------------------------------------------
SET @stmt := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.statistics
     WHERE table_schema = DATABASE()
       AND table_name   = 'cat_product'
       AND index_name   = 'ftx_cat_product_name_code') = 0,
  'ALTER TABLE cat_product ADD FULLTEXT INDEX ftx_cat_product_name_code (cat_product_name, cat_product_code)',
  'SELECT 1'));
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------
-- 3. Composite index: sal_order_status + created_date
--    Dung cho: orders.service stats, dashboard revenue/top queries
--    (where salOrderStatus = 4 AND createdDate >= :since).
--    (Bo qua ix_sal_order_status_shipping — cot sal_order_shipping_status
--     chua ton tai tai version 1.4.0; index tao o 20260415_order_shipping_status.sql)
-- ---------------------------------------------------------------
SET @stmt := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.statistics
     WHERE table_schema = DATABASE()
       AND table_name   = 'sal_order'
       AND index_name   = 'ix_sal_order_status_created') = 0,
  'ALTER TABLE sal_order ADD INDEX ix_sal_order_status_created (sal_order_status, created_date)',
  'SELECT 1'));
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------
-- 5. (Bo qua) Index cat_product_variant_sku
--    Ly do: Da co UNIQUE INDEX uix_catproductvariant_catproductvariantsku
--    trong 1.0.0/001__core_schema.sql (line 81). Them index B-Tree moi
--    se du thua — MySQL optimizer dung duoc UNIQUE index cho lookup.
-- ---------------------------------------------------------------
