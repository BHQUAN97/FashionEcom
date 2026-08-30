-- =============================================
-- Author:      FashionEcom
-- Create date: 2026-04-10
-- Description: Them cot recovery tracking vao sal_cart
-- =============================================

-- Neu bang sal_cart chua co, tao moi:
CREATE TABLE IF NOT EXISTS sal_cart (
    sal_cart_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID gio hang',
    sys_customer_id CHAR(36) NULL COMMENT 'KH (NULL = guest)',
    sal_cart_status TINYINT NOT NULL DEFAULT 0 COMMENT '0: Active, 1: Converted, 2: Abandoned, 3: Recovered',
    sal_cart_recovery_email_count TINYINT NOT NULL DEFAULT 0 COMMENT 'So email recovery da gui (0-3)',
    sal_cart_last_activity DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Lan cuoi cap nhat gio hang',
    sal_cart_recovery_discount_code VARCHAR(20) NULL COMMENT 'Ma giam gia auto-gen cho recovery',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngay tao gio hang',
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Ngay cap nhat'
) COMMENT 'Gio hang (theo doi abandoned cart recovery)';

SET @stmt := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.statistics
     WHERE table_schema = DATABASE()
       AND table_name   = 'sal_cart'
       AND index_name   = 'ix_salcart_syscustomerid') = 0,
  'ALTER TABLE sal_cart ADD INDEX ix_salcart_syscustomerid (sys_customer_id)',
  'SELECT 1'));
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @stmt := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.statistics
     WHERE table_schema = DATABASE()
       AND table_name   = 'sal_cart'
       AND index_name   = 'ix_salcart_status') = 0,
  'ALTER TABLE sal_cart ADD INDEX ix_salcart_status (sal_cart_status)',
  'SELECT 1'));
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @stmt := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.statistics
     WHERE table_schema = DATABASE()
       AND table_name   = 'sal_cart'
       AND index_name   = 'ix_salcart_lastactivity') = 0,
  'ALTER TABLE sal_cart ADD INDEX ix_salcart_lastactivity (sal_cart_last_activity)',
  'SELECT 1'));
PREPARE stmt FROM @stmt; EXECUTE stmt; DEALLOCATE PREPARE stmt;
