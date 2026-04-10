-- =============================================
-- Author:      Claude Code
-- Create date: 2026-04-10
-- Description: Tao bang nhom kich thuoc san pham
-- =============================================

USE fashion_ecom;

CREATE TABLE cat_size_group (
    cat_size_group_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID nhom size',
    cat_size_group_name VARCHAR(100) NOT NULL COMMENT 'Ten nhom (Ao, Quan, Giay)',
    cat_size_group_values TEXT NOT NULL COMMENT 'JSON array cac gia tri size ["S","M","L","XL"]',
    cat_size_group_guide TEXT NULL COMMENT 'Huong dan chon size (HTML)',
    cat_size_group_sort DECIMAL(18,4) NOT NULL DEFAULT 0 COMMENT 'Thu tu'
) COMMENT 'Nhom kich thuoc san pham';

CREATE UNIQUE INDEX uix_catsizegroup_catsizegroupname ON cat_size_group(cat_size_group_name);
