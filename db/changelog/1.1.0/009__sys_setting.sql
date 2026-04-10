-- =============================================
-- Author:      Claude Code
-- Create date: 2026-04-10
-- Description: Tao bang cai dat he thong dang key-value
-- =============================================

USE fashion_ecom;

CREATE TABLE sys_setting (
    sys_setting_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID setting',
    sys_setting_group VARCHAR(50) NOT NULL COMMENT 'Nhom: shop, shipping, payment, seo',
    sys_setting_key VARCHAR(100) NOT NULL COMMENT 'Key: shop_name, shop_logo, low_stock_threshold',
    sys_setting_value TEXT NULL COMMENT 'Gia tri (JSON string)',
    modified_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT 'Cai dat he thong dang key-value';

CREATE UNIQUE INDEX uix_syssetting_group_key ON sys_setting(sys_setting_group, sys_setting_key);
