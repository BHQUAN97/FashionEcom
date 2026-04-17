-- =============================================
-- Author:      Claude Code
-- Create date: 2026-04-14
-- Description: Normalize size: tao bang cat_size tu cat_size_group JSON values
-- =============================================

USE fashion_ecom;

-- Bang cat_size — tung gia tri size cu the (S, M, L, XL, 39, 40...)
CREATE TABLE IF NOT EXISTS cat_size (
    cat_size_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID gia tri size',
    cat_size_group_id CHAR(36) NOT NULL COMMENT 'FK nhom size',
    cat_size_value VARCHAR(50) NOT NULL COMMENT 'Gia tri size (S, M, L, XL, 39, 40...)',
    cat_size_sort DECIMAL(18,4) NOT NULL DEFAULT 0 COMMENT 'Thu tu sap xep trong nhom',
    cat_size_status TINYINT NOT NULL DEFAULT 1 COMMENT '0: An, 1: Active',
    CONSTRAINT fk_catsize_catsizegroup FOREIGN KEY (cat_size_group_id)
        REFERENCES cat_size_group(cat_size_group_id) ON DELETE RESTRICT
) COMMENT 'Gia tri kich thuoc cu the (normalize tu cat_size_group JSON)';

CREATE INDEX ix_catsize_catsizegroupid ON cat_size(cat_size_group_id);
CREATE UNIQUE INDEX uix_catsize_group_value ON cat_size(cat_size_group_id, cat_size_value);
