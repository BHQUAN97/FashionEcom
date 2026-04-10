-- =============================================
-- Author:      FashionEcom Dev
-- Create date: 2026-04-10
-- Description: Tao bang cms_banner — quan ly banner quang cao
-- =============================================

CREATE TABLE IF NOT EXISTS cms_banner (
    cms_banner_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY
        COMMENT 'ID toan cuc cua Banner',
    cms_banner_title VARCHAR(255) NOT NULL
        COMMENT 'Ten banner noi bo',
    cms_banner_image_desktop VARCHAR(255) NOT NULL
        COMMENT 'Duong dan anh desktop (1440x600)',
    cms_banner_image_mobile VARCHAR(255) NOT NULL
        COMMENT 'Duong dan anh mobile (768x500)',
    cms_banner_alt VARCHAR(255) NULL
        COMMENT 'Alt text SEO',
    cms_banner_link VARCHAR(255) NULL
        COMMENT 'URL redirect khi click',
    cms_banner_cta_text VARCHAR(100) NULL
        COMMENT 'Text nut CTA',
    cms_banner_sort DECIMAL(18,4) NOT NULL DEFAULT 0
        COMMENT 'Thu tu hien thi',
    cms_banner_start_date DATETIME NULL
        COMMENT 'Ngay bat dau hien thi',
    cms_banner_end_date DATETIME NULL
        COMMENT 'Ngay ket thuc hien thi (NULL = vinh vien)',
    cms_banner_status TINYINT NOT NULL DEFAULT 1
        COMMENT 'Trang thai: 0: An, 1: Hien thi, 2: Scheduled',
    cms_banner_ab_variant CHAR(1) NULL
        COMMENT 'Phien ban A/B test: NULL / A / B',
    cms_banner_ab_group_id CHAR(36) NULL
        COMMENT 'Group ID chung cho 2 banner A/B',
    cms_banner_click_count INT NOT NULL DEFAULT 0
        COMMENT 'So luot click',
    cms_banner_view_count INT NOT NULL DEFAULT 0
        COMMENT 'So luot impression',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP
        COMMENT 'Ngay tao'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT 'Quan ly Banner quang cao tren Storefront';

CREATE INDEX ix_cmsbanner_status ON cms_banner(cms_banner_status);
CREATE INDEX ix_cmsbanner_abgroupid ON cms_banner(cms_banner_ab_group_id);
CREATE INDEX ix_cmsbanner_sort ON cms_banner(cms_banner_sort);
