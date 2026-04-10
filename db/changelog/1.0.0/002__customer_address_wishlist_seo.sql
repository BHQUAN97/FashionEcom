-- =============================================
-- Author:      Claude Code
-- Create date: 2026-04-10
-- Description: Bo sung tables thieu trong spec: address, wishlist, SEO fields
-- =============================================

USE fashion_ecom;

-- Bang dia chi giao hang — 1 KH co nhieu dia chi
CREATE TABLE sys_customer_address (
    sys_customer_address_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID toan cuc dia chi',
    sys_customer_id CHAR(36) NOT NULL COMMENT 'Khoa ngoai tro toi khach hang',
    sys_customer_address_name VARCHAR(100) NOT NULL COMMENT 'Ten nguoi nhan',
    sys_customer_address_phone VARCHAR(50) NOT NULL COMMENT 'SDT nguoi nhan',
    sys_customer_address_province VARCHAR(100) NOT NULL COMMENT 'Tinh/Thanh pho',
    sys_customer_address_district VARCHAR(100) NOT NULL COMMENT 'Quan/Huyen',
    sys_customer_address_ward VARCHAR(100) NOT NULL COMMENT 'Phuong/Xa',
    sys_customer_address_detail VARCHAR(255) NOT NULL COMMENT 'Dia chi chi tiet (so nha, duong)',
    sys_customer_address_is_default TINYINT NOT NULL DEFAULT 0 COMMENT '1: Dia chi mac dinh, 0: Khong',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngay tao',
    CONSTRAINT fk_syscustomeraddress_syscustomer FOREIGN KEY (sys_customer_id) REFERENCES sys_customer(sys_customer_id) ON DELETE CASCADE
) COMMENT 'Danh sach dia chi giao hang cua khach';

CREATE INDEX ix_syscustomeraddress_syscustomerid ON sys_customer_address(sys_customer_id);

-- Bang wishlist — san pham yeu thich
CREATE TABLE sys_wishlist (
    sys_wishlist_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID toan cuc wishlist',
    sys_customer_id CHAR(36) NOT NULL COMMENT 'Khoa ngoai tro toi khach hang',
    cat_product_id CHAR(36) NOT NULL COMMENT 'Khoa ngoai tro toi san pham',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngay them vao wishlist',
    CONSTRAINT fk_syswishlist_syscustomer FOREIGN KEY (sys_customer_id) REFERENCES sys_customer(sys_customer_id) ON DELETE CASCADE,
    CONSTRAINT fk_syswishlist_catproduct FOREIGN KEY (cat_product_id) REFERENCES cat_product(cat_product_id) ON DELETE CASCADE
) COMMENT 'San pham yeu thich cua khach hang';

CREATE UNIQUE INDEX uix_syswishlist_customer_product ON sys_wishlist(sys_customer_id, cat_product_id);

-- Bo sung SEO fields cho san pham
ALTER TABLE cat_product
    ADD COLUMN cat_product_slug VARCHAR(255) NULL COMMENT 'URL slug cho SEO (VD: ao-polo-nam-cao-cap)' AFTER cat_product_name,
    ADD COLUMN cat_product_short_desc TEXT NULL COMMENT 'Mo ta ngan hien thi duoi title' AFTER cat_product_description,
    ADD COLUMN cat_product_seo_title VARCHAR(60) NULL COMMENT 'SEO Title (max 60 ky tu)' AFTER cat_product_short_desc,
    ADD COLUMN cat_product_seo_desc VARCHAR(160) NULL COMMENT 'Meta Description (max 160 ky tu)' AFTER cat_product_seo_title,
    ADD COLUMN cat_product_brand VARCHAR(100) NULL COMMENT 'Thuong hieu san pham' AFTER cat_product_seo_desc,
    ADD COLUMN cat_product_is_featured TINYINT NOT NULL DEFAULT 0 COMMENT '1: Noi bat, 0: Thuong' AFTER cat_product_brand,
    ADD COLUMN cat_product_is_new TINYINT NOT NULL DEFAULT 1 COMMENT '1: Moi, 0: Khong' AFTER cat_product_is_featured;

CREATE UNIQUE INDEX uix_catproduct_catproductslug ON cat_product(cat_product_slug);

-- Bo sung SEO fields cho danh muc
ALTER TABLE cat_category
    ADD COLUMN cat_category_slug VARCHAR(255) NULL COMMENT 'URL slug SEO' AFTER cat_category_name,
    ADD COLUMN cat_category_description TEXT NULL COMMENT 'Mo ta danh muc (cho SEO)' AFTER cat_category_slug,
    ADD COLUMN cat_category_icon VARCHAR(255) NULL COMMENT 'Icon SVG path' AFTER cat_category_description,
    ADD COLUMN cat_category_banner VARCHAR(255) NULL COMMENT 'Banner image path' AFTER cat_category_icon,
    ADD COLUMN cat_category_sort DECIMAL(18,4) NOT NULL DEFAULT 0 COMMENT 'Thu tu hien thi' AFTER cat_category_banner;

CREATE UNIQUE INDEX uix_catcategory_catcategoryslug ON cat_category(cat_category_slug);

-- Bo sung shipping address cho don hang
ALTER TABLE sal_order
    ADD COLUMN sal_order_shipping_name VARCHAR(100) NULL COMMENT 'Ten nguoi nhan' AFTER sal_order_payment_status,
    ADD COLUMN sal_order_shipping_phone VARCHAR(50) NULL COMMENT 'SDT nguoi nhan' AFTER sal_order_shipping_name,
    ADD COLUMN sal_order_shipping_province VARCHAR(100) NULL COMMENT 'Tinh/TP' AFTER sal_order_shipping_phone,
    ADD COLUMN sal_order_shipping_district VARCHAR(100) NULL COMMENT 'Quan/Huyen' AFTER sal_order_shipping_province,
    ADD COLUMN sal_order_shipping_ward VARCHAR(100) NULL COMMENT 'Phuong/Xa' AFTER sal_order_shipping_district,
    ADD COLUMN sal_order_shipping_address VARCHAR(255) NULL COMMENT 'Dia chi chi tiet' AFTER sal_order_shipping_ward,
    ADD COLUMN sal_order_note TEXT NULL COMMENT 'Ghi chu cua khach hang' AFTER sal_order_shipping_address,
    ADD COLUMN sal_order_tracking_code VARCHAR(50) NULL COMMENT 'Ma van don (GHN/GHTK)' AFTER sal_order_note;
