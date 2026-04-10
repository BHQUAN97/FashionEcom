-- =============================================
-- Author:      FashionEcom Dev
-- Create date: 2026-04-10
-- Description: Tao bang cms_layout_section — cac section Homepage Layout Builder
-- =============================================

CREATE TABLE IF NOT EXISTS cms_layout_section (
    cms_layout_section_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY
        COMMENT 'ID toan cuc cua Section trong Layout',
    cms_layout_section_page VARCHAR(50) NOT NULL DEFAULT 'homepage'
        COMMENT 'Trang ap dung: homepage, landing_xxx',
    cms_layout_section_type VARCHAR(50) NOT NULL
        COMMENT 'Loai section: hero_slider, announcement_bar, category_grid, ...',
    cms_layout_section_config JSON NOT NULL
        COMMENT 'Config JSON theo schema cua tung section type',
    cms_layout_section_sort DECIMAL(18,4) NOT NULL DEFAULT 0
        COMMENT 'Thu tu hien thi tren trang',
    cms_layout_section_visible TINYINT NOT NULL DEFAULT 1
        COMMENT 'An/hien section: 0: An, 1: Hien',
    cms_layout_section_version VARCHAR(20) NOT NULL DEFAULT 'draft'
        COMMENT 'Version: draft, published, scheduled',
    cms_layout_section_publish_at DATETIME NULL
        COMMENT 'Thoi diem hen publish (khi version=scheduled)',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP
        COMMENT 'Ngay tao section',
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        COMMENT 'Ngay cap nhat cuoi'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT 'Cac section cau thanh trang Homepage (Layout Builder)';

CREATE INDEX ix_cmslayoutsection_page_version
    ON cms_layout_section(cms_layout_section_page, cms_layout_section_version);
CREATE INDEX ix_cmslayoutsection_sort
    ON cms_layout_section(cms_layout_section_sort);
