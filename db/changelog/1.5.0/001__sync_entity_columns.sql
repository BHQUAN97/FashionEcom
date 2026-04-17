-- =============================================
-- Author:      BHQUAN97
-- Create date: 2026-04-13
-- Description: Dong bo cot giua TypeORM entity va MySQL schema
--              Them cac cot con thieu cho 5 bang: cat_category, cat_product,
--              sal_order, sal_review, log_audit
-- =============================================

-- =============================================================
-- 1. cat_category — them slug, description, icon, banner, sort
-- =============================================================
ALTER TABLE `cat_category`
    ADD COLUMN `cat_category_slug` VARCHAR(255) NULL COMMENT 'Duong dan URL than thien SEO' AFTER `cat_category_name`,
    ADD COLUMN `cat_category_description` TEXT NULL COMMENT 'Mo ta danh muc' AFTER `cat_category_slug`,
    ADD COLUMN `cat_category_icon` VARCHAR(255) NULL COMMENT 'Duong dan icon danh muc' AFTER `cat_category_description`,
    ADD COLUMN `cat_category_banner` VARCHAR(255) NULL COMMENT 'Duong dan banner danh muc' AFTER `cat_category_icon`,
    ADD COLUMN `cat_category_sort` DECIMAL(18,4) NOT NULL DEFAULT 0 COMMENT 'Thu tu sap xep' AFTER `cat_category_banner`;

-- =============================================================
-- 2. cat_product — them slug, short_desc, seo, brand, flags, modified_date
-- =============================================================
ALTER TABLE `cat_product`
    ADD COLUMN `cat_product_slug` VARCHAR(255) NULL COMMENT 'Duong dan URL than thien SEO' AFTER `cat_product_name`,
    ADD COLUMN `cat_product_short_desc` TEXT NULL COMMENT 'Mo ta ngan (hien thi card/list)' AFTER `cat_product_description`,
    ADD COLUMN `cat_product_seo_title` VARCHAR(60) NULL COMMENT 'Tieu de SEO (toi da 60 ky tu)' AFTER `cat_product_short_desc`,
    ADD COLUMN `cat_product_seo_desc` VARCHAR(160) NULL COMMENT 'Mo ta SEO (toi da 160 ky tu)' AFTER `cat_product_seo_title`,
    ADD COLUMN `cat_product_brand` VARCHAR(100) NULL COMMENT 'Thuong hieu san pham' AFTER `cat_product_seo_desc`,
    ADD COLUMN `cat_product_is_featured` TINYINT NOT NULL DEFAULT 0 COMMENT 'San pham noi bat: 0=Khong, 1=Co' AFTER `cat_product_brand`,
    ADD COLUMN `cat_product_is_new` TINYINT NOT NULL DEFAULT 1 COMMENT 'San pham moi: 0=Khong, 1=Co' AFTER `cat_product_is_featured`,
    ADD COLUMN `modified_date` DATETIME NULL COMMENT 'Ngay cap nhat cuoi' AFTER `created_date`;

-- =============================================================
-- 3. sal_order — them thong tin giao hang, ghi chu, tracking, modified_date
-- =============================================================
ALTER TABLE `sal_order`
    ADD COLUMN `sal_order_shipping_name` VARCHAR(100) NULL COMMENT 'Ten nguoi nhan hang' AFTER `sal_order_payment_status`,
    ADD COLUMN `sal_order_shipping_phone` VARCHAR(50) NULL COMMENT 'SDT nguoi nhan' AFTER `sal_order_shipping_name`,
    ADD COLUMN `sal_order_shipping_province` VARCHAR(100) NULL COMMENT 'Tinh/Thanh pho' AFTER `sal_order_shipping_phone`,
    ADD COLUMN `sal_order_shipping_district` VARCHAR(100) NULL COMMENT 'Quan/Huyen' AFTER `sal_order_shipping_province`,
    ADD COLUMN `sal_order_shipping_ward` VARCHAR(100) NULL COMMENT 'Phuong/Xa' AFTER `sal_order_shipping_district`,
    ADD COLUMN `sal_order_shipping_address` VARCHAR(255) NULL COMMENT 'Dia chi chi tiet' AFTER `sal_order_shipping_ward`,
    ADD COLUMN `sal_order_note` TEXT NULL COMMENT 'Ghi chu cua khach hang' AFTER `sal_order_shipping_address`,
    ADD COLUMN `sal_order_tracking_code` VARCHAR(50) NULL COMMENT 'Ma van don' AFTER `sal_order_note`,
    ADD COLUMN `sal_order_internal_note` TEXT NULL COMMENT 'Ghi chu noi bo (chi admin thay)' AFTER `sal_order_tracking_code`,
    ADD COLUMN `modified_date` DATETIME NULL COMMENT 'Ngay cap nhat cuoi' AFTER `created_date`;

-- =============================================================
-- 4. sal_review — them cat_product_id, admin reply, photos
--    Luu y: sal_review_rating trong entity la tinyint nhung DB hien tai la decimal(18,4)
--    Giu nguyen decimal de khong mat du lieu, entity se tu ep kieu
-- =============================================================
ALTER TABLE `sal_review`
    ADD COLUMN `cat_product_id` CHAR(36) NOT NULL COMMENT 'FK san pham duoc danh gia' AFTER `sal_order_item_id`,
    ADD COLUMN `sal_review_admin_reply` TEXT NULL COMMENT 'Noi dung phan hoi cua admin' AFTER `sal_review_content`,
    ADD COLUMN `sal_review_admin_reply_date` DATETIME NULL COMMENT 'Ngay admin phan hoi' AFTER `sal_review_admin_reply`,
    ADD COLUMN `sal_review_admin_reply_by` CHAR(36) NULL COMMENT 'FK user admin da phan hoi' AFTER `sal_review_admin_reply_date`,
    ADD COLUMN `sal_review_photos` JSON NULL COMMENT 'Danh sach anh danh gia (JSON array URL)' AFTER `sal_review_status`;

-- Index cho FK moi cua sal_review
ALTER TABLE `sal_review`
    ADD INDEX `ix_sal_review_cat_product_id` (`cat_product_id`);

-- =============================================================
-- 5. log_audit — them entity_name, user_agent
-- =============================================================
ALTER TABLE `log_audit`
    ADD COLUMN `log_audit_entity_name` VARCHAR(255) NULL COMMENT 'Ten entity de hien thi (khong can join)' AFTER `log_audit_entity_id`,
    ADD COLUMN `log_audit_user_agent` VARCHAR(500) NULL COMMENT 'Thong tin trinh duyet/client' AFTER `log_audit_ip`;
