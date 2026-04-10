-- =============================================
-- Author:      Claude Code
-- Create date: 2026-04-10
-- Description: Tao bang danh muc mau sac san pham (HEX swatch)
-- =============================================

USE fashion_ecom;

CREATE TABLE cat_color (
    cat_color_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID mau sac',
    cat_color_name VARCHAR(50) NOT NULL COMMENT 'Ten mau (Den, Trang, Navy...)',
    cat_color_hex VARCHAR(7) NOT NULL COMMENT 'Ma HEX (#1a1a1a)',
    cat_color_sort DECIMAL(18,4) NOT NULL DEFAULT 0 COMMENT 'Thu tu sap xep',
    cat_color_status TINYINT NOT NULL DEFAULT 1 COMMENT '0: An, 1: Active'
) COMMENT 'Danh muc mau sac san pham';

CREATE UNIQUE INDEX uix_catcolor_catcolorname ON cat_color(cat_color_name);
