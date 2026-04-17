-- =============================================
-- Author:      Claude Code
-- Create date: 2026-04-14
-- Description: Seed default homepage layout — 8 sections (draft + published)
--              + header/footer menu items + theme config + 3 banners
-- Luu y:       INSERT IGNORE de chay lai an toan
-- =============================================

USE fashion_ecom;

-- ==============================================================================
-- 1. LAYOUT SECTIONS — Homepage default (draft)
-- Thu tu: announcement → hero → trust → category → featured tabs → product carousel → banner columns → newsletter
-- ==============================================================================

INSERT IGNORE INTO cms_layout_section (
    cms_layout_section_id,
    cms_layout_section_page,
    cms_layout_section_type,
    cms_layout_section_config,
    cms_layout_section_sort,
    cms_layout_section_visible,
    cms_layout_section_version,
    created_date
) VALUES
-- 1. Thanh thong bao
('ls-draft-0000-0000-0000-000000000001', 'homepage', 'announcement_bar', JSON_OBJECT(
    'messages', JSON_ARRAY(
        JSON_OBJECT('text', 'FREESHIP don tu 500K — Ap dung toan quoc', 'link', '/san-pham'),
        JSON_OBJECT('text', 'Giam 10% cho don hang dau tien — Ma: WELCOME10', 'link', '/san-pham'),
        JSON_OBJECT('text', 'Doi tra mien phi trong 30 ngay', 'link', '')
    ),
    'bg_color', '#1a1a1a',
    'text_color', '#FFFFFF',
    'auto_scroll', true,
    'scroll_speed', 3000,
    'dismissible', true
), 1.0000, 1, 'draft', NOW()),

-- 2. Hero Slider — 3 slides gioi thieu BST
('ls-draft-0000-0000-0000-000000000002', 'homepage', 'hero_slider', JSON_OBJECT(
    'display_mode', 'fullwidth',
    'slides', JSON_ARRAY(
        JSON_OBJECT(
            'image_desktop', '/images/hero/slide-1-desktop.jpg',
            'image_mobile', '/images/hero/slide-1-mobile.jpg',
            'title', 'Bo Suu Tap Xuan He 2026',
            'subtitle', 'Phong cach toi gian — Chat lieu cao cap',
            'cta_text', 'Kham pha ngay',
            'cta_link', '/danh-muc/ao-thun',
            'text_position', 'center',
            'text_color', '#FFFFFF'
        ),
        JSON_OBJECT(
            'image_desktop', '/images/hero/slide-2-desktop.jpg',
            'image_mobile', '/images/hero/slide-2-mobile.jpg',
            'title', 'Smart Casual',
            'subtitle', 'Tu tin moi ngay voi phong cach lich lam',
            'cta_text', 'Mua so mi',
            'cta_link', '/danh-muc/ao-so-mi',
            'text_position', 'left',
            'text_color', '#FFFFFF'
        ),
        JSON_OBJECT(
            'image_desktop', '/images/hero/slide-3-desktop.jpg',
            'image_mobile', '/images/hero/slide-3-mobile.jpg',
            'title', 'Jeans — Muon kieu phoi do',
            'subtitle', 'Slim fit, Skinny, Straight — Du phong cach',
            'cta_text', 'Chon quan jeans',
            'cta_link', '/danh-muc/quan-jeans',
            'text_position', 'right',
            'text_color', '#FFFFFF'
        )
    ),
    'autoplay', true,
    'autoplay_speed', 5000,
    'show_dots', true,
    'show_arrows', true,
    'overlay_color', '#000000',
    'overlay_opacity', 30,
    'height_desktop', 500,
    'height_mobile', 300
), 2.0000, 1, 'draft', NOW()),

-- 3. Trust Bar — 4 badges cam ket
('ls-draft-0000-0000-0000-000000000003', 'homepage', 'trust_bar', JSON_OBJECT(
    'display_mode', 'row',
    'items', JSON_ARRAY(
        JSON_OBJECT('icon', 'Truck', 'title', 'Freeship', 'subtitle', 'Don tu 500K'),
        JSON_OBJECT('icon', 'ShieldCheck', 'title', 'Chinh hang 100%', 'subtitle', 'Dam bao chat luong'),
        JSON_OBJECT('icon', 'RefreshCw', 'title', 'Doi tra 30 ngay', 'subtitle', 'Mien phi doi tra'),
        JSON_OBJECT('icon', 'Headphones', 'title', 'Ho tro 24/7', 'subtitle', '0901 234 567')
    ),
    'bg_color', '#F9FAFB',
    'text_color', '#333333',
    'icon_color', '#333333',
    'show_border', false,
    'show_icon_bg', true
), 3.0000, 1, 'draft', NOW()),

-- 4. Category Grid — 5 danh muc chinh
('ls-draft-0000-0000-0000-000000000004', 'homepage', 'category_grid', JSON_OBJECT(
    'title', 'Danh muc noi bat',
    'display_mode', 'grid',
    'columns_desktop', 5,
    'columns_mobile', 2,
    'show_image', true,
    'show_count', true,
    'show_arrow', true,
    'card_style', 'overlay',
    'categories', JSON_ARRAY(
        JSON_OBJECT('id', 'c0000000-0000-0000-0000-000000000001', 'name', 'Ao Thun', 'image', '/images/category/ao-thun.jpg', 'link', '/danh-muc/ao-thun'),
        JSON_OBJECT('id', 'c0000000-0000-0000-0000-000000000002', 'name', 'Ao So Mi', 'image', '/images/category/ao-so-mi.jpg', 'link', '/danh-muc/ao-so-mi'),
        JSON_OBJECT('id', 'c0000000-0000-0000-0000-000000000003', 'name', 'Quan Jeans', 'image', '/images/category/quan-jeans.jpg', 'link', '/danh-muc/quan-jeans'),
        JSON_OBJECT('id', 'c0000000-0000-0000-0000-000000000004', 'name', 'Ao Khoac', 'image', '/images/category/ao-khoac.jpg', 'link', '/danh-muc/ao-khoac'),
        JSON_OBJECT('id', 'c0000000-0000-0000-0000-000000000005', 'name', 'Phu Kien', 'image', '/images/category/phu-kien.jpg', 'link', '/danh-muc/phu-kien')
    ),
    'item_count', 5
), 4.0000, 1, 'draft', NOW()),

-- 5. Featured Products Tab — Hang moi + Ban chay
('ls-draft-0000-0000-0000-000000000005', 'homepage', 'featured_products_tab', JSON_OBJECT(
    'tab_style', 'underline',
    'tabs', JSON_ARRAY(
        JSON_OBJECT('label', 'Hang moi ve', 'source_type', 'collection', 'source_value', 'new_arrivals'),
        JSON_OBJECT('label', 'Ban chay nhat', 'source_type', 'collection', 'source_value', 'best_sellers'),
        JSON_OBJECT('label', 'Khuyen mai', 'source_type', 'collection', 'source_value', 'on_sale')
    ),
    'products_per_tab', 10,
    'columns_desktop', 5,
    'columns_mobile', 2,
    'show_cta', true,
    'cta_text', 'XEM TAT CA SAN PHAM'
), 5.0000, 1, 'draft', NOW()),

-- 6. Product Carousel — San pham noi bat
('ls-draft-0000-0000-0000-000000000006', 'homepage', 'product_carousel', JSON_OBJECT(
    'title', 'San pham noi bat',
    'display_mode', 'carousel',
    'source_type', 'collection',
    'source_value', 'featured',
    'category_id', NULL,
    'max_products', 12,
    'show_badge', true,
    'show_price', true,
    'show_rating', true,
    'show_quick_add', true,
    'show_cta', true,
    'cta_text', 'XEM TAT CA',
    'cta_link', '/san-pham?featured=1',
    'columns_desktop', 5,
    'autoplay', false
), 6.0000, 1, 'draft', NOW()),

-- 7. Banner Columns — 2 cot quang cao
('ls-draft-0000-0000-0000-000000000007', 'homepage', 'banner_columns', JSON_OBJECT(
    'display_mode', 'equal',
    'columns', JSON_ARRAY(
        JSON_OBJECT('image', '/images/banner/banner-col-1.jpg', 'title', 'Ao Khoac Mua Dong', 'subtitle', 'Giam den 40%', 'link', '/danh-muc/ao-khoac'),
        JSON_OBJECT('image', '/images/banner/banner-col-2.jpg', 'title', 'Phu Kien Thoi Trang', 'subtitle', 'Tu 200K', 'link', '/danh-muc/phu-kien')
    ),
    'gap', 12,
    'aspect_ratio', '4:3',
    'show_text_overlay', true,
    'rounded', true
), 7.0000, 1, 'draft', NOW()),

-- 8. Newsletter — Dang ky nhan tin
('ls-draft-0000-0000-0000-000000000008', 'homepage', 'newsletter', JSON_OBJECT(
    'display_mode', 'full',
    'title', 'Dang ky nhan tin khuyen mai',
    'subtitle', 'Nhan ngay ma giam 10% cho don hang dau tien',
    'button_text', 'Dang ky',
    'placeholder', 'Nhap email cua ban',
    'bg_color', '#1a1a1a',
    'text_color', '#FFFFFF',
    'btn_color', '#D0021B',
    'input_style', 'rounded'
), 8.0000, 1, 'draft', NOW());

-- ==============================================================================
-- 2. CLONE DRAFT → PUBLISHED (de storefront hien thi ngay)
-- ==============================================================================

INSERT IGNORE INTO cms_layout_section (
    cms_layout_section_id,
    cms_layout_section_page,
    cms_layout_section_type,
    cms_layout_section_config,
    cms_layout_section_sort,
    cms_layout_section_visible,
    cms_layout_section_version,
    created_date
)
SELECT
    REPLACE(cms_layout_section_id, 'ls-draft', 'ls-publ-'),
    cms_layout_section_page,
    cms_layout_section_type,
    cms_layout_section_config,
    cms_layout_section_sort,
    cms_layout_section_visible,
    'published',
    NOW()
FROM cms_layout_section
WHERE cms_layout_section_version = 'draft'
  AND cms_layout_section_page = 'homepage'
  AND cms_layout_section_id LIKE 'ls-draft-0000-0000-0000-%';

-- ==============================================================================
-- 3. BANNERS — 3 banner quang cao mac dinh
-- ==============================================================================

INSERT IGNORE INTO cms_banner (
    cms_banner_id,
    cms_banner_title,
    cms_banner_image_desktop,
    cms_banner_image_mobile,
    cms_banner_alt,
    cms_banner_link,
    cms_banner_cta_text,
    cms_banner_sort,
    cms_banner_status,
    cms_banner_click_count,
    cms_banner_view_count,
    created_date
) VALUES
('bn-0000-0000-0000-000000000001',
 'BST Xuan He 2026',
 '/images/banner/banner-1-desktop.jpg',
 '/images/banner/banner-1-mobile.jpg',
 'Bo suu tap xuan he 2026',
 '/danh-muc/ao-thun',
 'Kham pha ngay',
 1.0000, 1, 0, 0, NOW()),

('bn-0000-0000-0000-000000000002',
 'Flash Sale Cuoi Tuan',
 '/images/banner/banner-2-desktop.jpg',
 '/images/banner/banner-2-mobile.jpg',
 'Flash sale cuoi tuan giam den 50%',
 '/san-pham?sale=1',
 'Mua ngay',
 2.0000, 1, 0, 0, NOW()),

('bn-0000-0000-0000-000000000003',
 'Ao Khoac Mua Dong',
 '/images/banner/banner-3-desktop.jpg',
 '/images/banner/banner-3-mobile.jpg',
 'Ao khoac mua dong giam 40%',
 '/danh-muc/ao-khoac',
 'Xem bo suu tap',
 3.0000, 1, 0, 0, NOW());

-- ==============================================================================
-- 4. MENU ITEMS — Header menu (6 items) + Footer menu (8 items)
-- ==============================================================================

-- Lay menu_id tu cms_menu
SET @header_menu_id = (SELECT cms_menu_id FROM cms_menu WHERE cms_menu_type = 'header' LIMIT 1);
SET @footer_menu_id = (SELECT cms_menu_id FROM cms_menu WHERE cms_menu_type = 'footer' LIMIT 1);
SET @mobile_menu_id = (SELECT cms_menu_id FROM cms_menu WHERE cms_menu_type = 'mobile' LIMIT 1);

-- Header menu items
INSERT IGNORE INTO cms_menu_item (
    cms_menu_item_id, cms_menu_id, cms_menu_item_parent_id,
    cms_menu_item_label, cms_menu_item_type, cms_menu_item_value,
    cms_menu_item_icon, cms_menu_item_badge, cms_menu_item_open_new_tab,
    cms_menu_item_mobile_visible, cms_menu_item_sort
) VALUES
('mi-hdr-0000-0000-0000-000000000001', @header_menu_id, NULL,
 'Trang chu', 'url', '/', NULL, NULL, 0, 1, 1.0000),
('mi-hdr-0000-0000-0000-000000000002', @header_menu_id, NULL,
 'Ao Thun', 'category', 'ao-thun', NULL, 'New', 0, 1, 2.0000),
('mi-hdr-0000-0000-0000-000000000003', @header_menu_id, NULL,
 'Ao So Mi', 'category', 'ao-so-mi', NULL, NULL, 0, 1, 3.0000),
('mi-hdr-0000-0000-0000-000000000004', @header_menu_id, NULL,
 'Quan Jeans', 'category', 'quan-jeans', NULL, NULL, 0, 1, 4.0000),
('mi-hdr-0000-0000-0000-000000000005', @header_menu_id, NULL,
 'Ao Khoac', 'category', 'ao-khoac', NULL, 'Sale', 0, 1, 5.0000),
('mi-hdr-0000-0000-0000-000000000006', @header_menu_id, NULL,
 'Phu Kien', 'category', 'phu-kien', NULL, NULL, 0, 1, 6.0000);

-- Footer menu items — 2 nhom: Ho tro & Chinh sach
INSERT IGNORE INTO cms_menu_item (
    cms_menu_item_id, cms_menu_id, cms_menu_item_parent_id,
    cms_menu_item_label, cms_menu_item_type, cms_menu_item_value,
    cms_menu_item_icon, cms_menu_item_badge, cms_menu_item_open_new_tab,
    cms_menu_item_mobile_visible, cms_menu_item_sort
) VALUES
-- Nhom: Ho tro khach hang
('mi-ftr-0000-0000-0000-000000000001', @footer_menu_id, NULL,
 'Ho tro khach hang', 'custom', '#', NULL, NULL, 0, 1, 1.0000),
('mi-ftr-0000-0000-0000-000000000002', @footer_menu_id, 'mi-ftr-0000-0000-0000-000000000001',
 'Huong dan mua hang', 'page', '/huong-dan-mua-hang', NULL, NULL, 0, 1, 1.0000),
('mi-ftr-0000-0000-0000-000000000003', @footer_menu_id, 'mi-ftr-0000-0000-0000-000000000001',
 'Phuong thuc thanh toan', 'page', '/phuong-thuc-thanh-toan', NULL, NULL, 0, 1, 2.0000),
('mi-ftr-0000-0000-0000-000000000004', @footer_menu_id, 'mi-ftr-0000-0000-0000-000000000001',
 'Van chuyen & Giao hang', 'page', '/van-chuyen', NULL, NULL, 0, 1, 3.0000),
-- Nhom: Chinh sach
('mi-ftr-0000-0000-0000-000000000005', @footer_menu_id, NULL,
 'Chinh sach', 'custom', '#', NULL, NULL, 0, 1, 2.0000),
('mi-ftr-0000-0000-0000-000000000006', @footer_menu_id, 'mi-ftr-0000-0000-0000-000000000005',
 'Chinh sach doi tra', 'page', '/chinh-sach-doi-tra', NULL, NULL, 0, 1, 1.0000),
('mi-ftr-0000-0000-0000-000000000007', @footer_menu_id, 'mi-ftr-0000-0000-0000-000000000005',
 'Chinh sach bao mat', 'page', '/chinh-sach-bao-mat', NULL, NULL, 0, 1, 2.0000),
('mi-ftr-0000-0000-0000-000000000008', @footer_menu_id, 'mi-ftr-0000-0000-0000-000000000005',
 'Dieu khoan su dung', 'page', '/dieu-khoan-su-dung', NULL, NULL, 0, 1, 3.0000);

-- Mobile menu — copy header items
INSERT IGNORE INTO cms_menu_item (
    cms_menu_item_id, cms_menu_id, cms_menu_item_parent_id,
    cms_menu_item_label, cms_menu_item_type, cms_menu_item_value,
    cms_menu_item_icon, cms_menu_item_badge, cms_menu_item_open_new_tab,
    cms_menu_item_mobile_visible, cms_menu_item_sort
) VALUES
('mi-mob-0000-0000-0000-000000000001', @mobile_menu_id, NULL,
 'Trang chu', 'url', '/', 'Home', NULL, 0, 1, 1.0000),
('mi-mob-0000-0000-0000-000000000002', @mobile_menu_id, NULL,
 'Ao Thun', 'category', 'ao-thun', 'Shirt', 'New', 0, 1, 2.0000),
('mi-mob-0000-0000-0000-000000000003', @mobile_menu_id, NULL,
 'Ao So Mi', 'category', 'ao-so-mi', 'Shirt', NULL, 0, 1, 3.0000),
('mi-mob-0000-0000-0000-000000000004', @mobile_menu_id, NULL,
 'Quan Jeans', 'category', 'quan-jeans', 'Shirt', NULL, 0, 1, 4.0000),
('mi-mob-0000-0000-0000-000000000005', @mobile_menu_id, NULL,
 'Ao Khoac', 'category', 'ao-khoac', 'Shirt', 'Sale', 0, 1, 5.0000),
('mi-mob-0000-0000-0000-000000000006', @mobile_menu_id, NULL,
 'Phu Kien', 'category', 'phu-kien', 'Package', NULL, 0, 1, 6.0000);

-- ==============================================================================
-- 5. THEME CONFIG — Cau hinh giao dien mac dinh (Torano-inspired)
-- ==============================================================================

INSERT IGNORE INTO cms_theme_config (
    cms_theme_config_id, cms_theme_config_key, cms_theme_config_value,
    cms_theme_config_type, cms_theme_config_group, cms_theme_config_label
) VALUES
-- Colors
('tc-0000-0000-0000-000000000001', 'primary_color',    '#1a1a1a', 'color', 'colors', 'Mau chinh'),
('tc-0000-0000-0000-000000000002', 'secondary_color',  '#D0021B', 'color', 'colors', 'Mau phu (accent)'),
('tc-0000-0000-0000-000000000003', 'background_color', '#FFFFFF', 'color', 'colors', 'Mau nen'),
('tc-0000-0000-0000-000000000004', 'text_color',       '#333333', 'color', 'colors', 'Mau chu'),
('tc-0000-0000-0000-000000000005', 'border_color',     '#E5E7EB', 'color', 'colors', 'Mau vien'),
-- Fonts
('tc-0000-0000-0000-000000000006', 'heading_font',  'Montserrat', 'font', 'fonts', 'Font tieu de'),
('tc-0000-0000-0000-000000000007', 'body_font',     'Inter',      'font', 'fonts', 'Font noi dung'),
-- Branding
('tc-0000-0000-0000-000000000008', 'logo_url',      '/images/logo.png',      'image', 'branding', 'Logo'),
('tc-0000-0000-0000-000000000009', 'favicon_url',   '/images/favicon.ico',   'image', 'branding', 'Favicon'),
('tc-0000-0000-0000-000000000010', 'site_name',     'Fashion Ecom',          'text',  'branding', 'Ten website'),
-- Footer
('tc-0000-0000-0000-000000000011', 'footer_text',       '© 2026 Fashion Ecom. All rights reserved.', 'text',    'footer', 'Text footer'),
('tc-0000-0000-0000-000000000012', 'footer_bg_color',   '#1a1a1a',                                    'color',   'footer', 'Mau nen footer'),
('tc-0000-0000-0000-000000000013', 'footer_text_color', '#FFFFFF',                                    'color',   'footer', 'Mau chu footer'),
('tc-0000-0000-0000-000000000014', 'show_social_icons', '1',                                          'boolean', 'footer', 'Hien icon MXH'),
-- Announcement
('tc-0000-0000-0000-000000000015', 'show_announcement', '1',       'boolean', 'announcement', 'Hien thanh thong bao'),
('tc-0000-0000-0000-000000000016', 'announcement_bg',   '#1a1a1a', 'color',   'announcement', 'Mau nen thong bao');

-- =============================================
-- DONE — Default layout seeded
-- Homepage: 8 sections (draft + published)
-- Banners: 3 banners
-- Menus: header (6) + footer (8) + mobile (6) items
-- Theme: 16 config entries
-- =============================================
