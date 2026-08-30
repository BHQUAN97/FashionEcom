-- =============================================
-- Author:      FashionEcom
-- Create date: 2026-04-10
-- Description: Bo sung cot admin reply vao sal_review
-- =============================================

-- MySQL khong ho tro "ADD COLUMN IF NOT EXISTS" → dung PREPARE/EXECUTE
SET @stmt := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = 'sal_review'
       AND column_name = 'sal_review_admin_reply') = 0,
  'ALTER TABLE sal_review ADD COLUMN sal_review_admin_reply TEXT NULL COMMENT ''Phan hoi tu Admin (Official Reply)'' AFTER sal_review_content',
  'SELECT 1'));
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @stmt := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = 'sal_review'
       AND column_name = 'sal_review_admin_reply_date') = 0,
  'ALTER TABLE sal_review ADD COLUMN sal_review_admin_reply_date DATETIME NULL COMMENT ''Ngay admin phan hoi'' AFTER sal_review_admin_reply',
  'SELECT 1'));
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @stmt := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = 'sal_review'
       AND column_name = 'sal_review_admin_reply_by') = 0,
  'ALTER TABLE sal_review ADD COLUMN sal_review_admin_reply_by CHAR(36) NULL COMMENT ''Admin ID phan hoi'' AFTER sal_review_admin_reply_date',
  'SELECT 1'));
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;