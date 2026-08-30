-- =============================================
-- Author:      FashionEcom
-- Create date: 2026-04-10
-- Description: Bang audit log nang cao — them entity_name, user_agent
-- =============================================

-- Them cot vao bang log_audit hien co (neu chua co)
-- MySQL khong ho tro "ADD COLUMN IF NOT EXISTS" → dung PREPARE/EXECUTE
SET @stmt := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = 'log_audit'
       AND column_name = 'log_audit_entity_name') = 0,
  'ALTER TABLE log_audit ADD COLUMN log_audit_entity_name VARCHAR(255) NULL COMMENT ''Ten doi tuong (de doc log khong can join)'' AFTER log_audit_entity_id',
  'SELECT 1'));
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @stmt := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = 'log_audit'
       AND column_name = 'log_audit_user_agent') = 0,
  'ALTER TABLE log_audit ADD COLUMN log_audit_user_agent VARCHAR(500) NULL COMMENT ''Browser User-Agent'' AFTER log_audit_ip',
  'SELECT 1'));
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;