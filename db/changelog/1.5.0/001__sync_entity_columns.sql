-- =============================================
-- Author:      BHQUAN97
-- Create date: 2026-04-13
-- Description: Dong bo cot giua TypeORM entity va MySQL schema
--              (idempotent — chi them cot con thieu)
-- =============================================

-- sal_review: them cat_product_id (FK san pham) + photos
SET @stmt := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = 'sal_review'
       AND column_name = 'cat_product_id') = 0,
  'ALTER TABLE `sal_review` ADD COLUMN `cat_product_id` CHAR(36) NULL COMMENT ''FK san pham duoc danh gia'' AFTER `sal_order_item_id`',
  'SELECT 1'));
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @stmt := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = 'sal_review'
       AND column_name = 'sal_review_photos') = 0,
  'ALTER TABLE `sal_review` ADD COLUMN `sal_review_photos` JSON NULL COMMENT ''Danh sach anh danh gia (JSON array URL)'' AFTER `sal_review_status`',
  'SELECT 1'));
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Index cho FK moi cua sal_review (idempotent)
SET @stmt := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.statistics
     WHERE table_schema = DATABASE() AND table_name = 'sal_review'
       AND index_name = 'ix_sal_review_cat_product_id') = 0,
  'ALTER TABLE `sal_review` ADD INDEX `ix_sal_review_cat_product_id` (`cat_product_id`)',
  'SELECT 1'));
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;