-- =============================================
-- Author:      FashionEcom Dev
-- Create date: 2026-04-10
-- Description: Tao bang cms_theme_config — cau hinh giao dien
-- =============================================

CREATE TABLE IF NOT EXISTS cms_theme_config (
    cms_theme_config_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY
        COMMENT 'ID toan cuc cua Theme Config entry',
    cms_theme_config_key VARCHAR(50) NOT NULL
        COMMENT 'Key cau hinh: primary_color, font_heading, logo_url, ...',
    cms_theme_config_value TEXT NOT NULL
        COMMENT 'Gia tri cau hinh',
    cms_theme_config_type VARCHAR(20) NOT NULL DEFAULT 'text'
        COMMENT 'Kieu du lieu: color, font, text, number, boolean, json, image',
    cms_theme_config_group VARCHAR(30) NOT NULL
        COMMENT 'Nhom: colors, fonts, branding, footer, announcement, cookie',
    cms_theme_config_label VARCHAR(100) NOT NULL
        COMMENT 'Nhan hien thi cho admin',
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        COMMENT 'Lan cap nhat cuoi'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT 'Cau hinh giao dien toan cuc (colors, fonts, logo, ...)';

CREATE UNIQUE INDEX uix_cmsthemeconfig_key ON cms_theme_config(cms_theme_config_key);
CREATE INDEX ix_cmsthemeconfig_group ON cms_theme_config(cms_theme_config_group);

-- Seed default theme config
INSERT INTO cms_theme_config (cms_theme_config_key, cms_theme_config_value, cms_theme_config_type, cms_theme_config_group, cms_theme_config_label) VALUES
('primary_color', '#1a1a1a', 'color', 'colors', 'Mau chinh'),
('accent_color', '#D0021B', 'color', 'colors', 'Mau nhan (CTA, Sale)'),
('bg_color', '#FFFFFF', 'color', 'colors', 'Mau nen'),
('text_color', '#333333', 'color', 'colors', 'Mau chu'),
('muted_color', '#6B7280', 'color', 'colors', 'Mau chu phu'),
('font_heading', 'Inter', 'font', 'fonts', 'Font tieu de'),
('font_body', 'Inter', 'font', 'fonts', 'Font noi dung'),
('logo_url', '', 'image', 'branding', 'Logo'),
('favicon_url', '', 'image', 'branding', 'Favicon'),
('footer_copyright', '© 2026 FashionEcom. All rights reserved.', 'text', 'footer', 'Copyright footer'),
('footer_description', 'Thoi trang nam nu chinh hang', 'text', 'footer', 'Mo ta footer'),
('announcement_text', '', 'text', 'announcement', 'Text thong bao header'),
('announcement_bg_color', '#D0021B', 'color', 'announcement', 'Mau nen thong bao'),
('announcement_visible', '0', 'boolean', 'announcement', 'Hien thi thong bao');
