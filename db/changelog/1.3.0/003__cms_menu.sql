-- =============================================
-- Author:      FashionEcom Dev
-- Create date: 2026-04-10
-- Description: Tao bang cms_menu + cms_menu_item — quan ly menu header/footer/mobile
-- =============================================

CREATE TABLE IF NOT EXISTS cms_menu (
    cms_menu_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY
        COMMENT 'ID toan cuc cua Menu',
    cms_menu_type VARCHAR(20) NOT NULL
        COMMENT 'Loai menu: header, footer, mobile',
    cms_menu_name VARCHAR(100) NOT NULL
        COMMENT 'Ten menu',
    cms_menu_status TINYINT NOT NULL DEFAULT 1
        COMMENT 'Trang thai: 0: An, 1: Active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT 'Danh sach Menu chinh (header, footer, mobile)';

CREATE UNIQUE INDEX uix_cmsmenu_type ON cms_menu(cms_menu_type);

CREATE TABLE IF NOT EXISTS cms_menu_item (
    cms_menu_item_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY
        COMMENT 'ID toan cuc cua Menu Item',
    cms_menu_id CHAR(36) NOT NULL
        COMMENT 'FK tro toi Menu',
    cms_menu_item_parent_id CHAR(36) NULL
        COMMENT 'FK tro toi parent item (NULL = cap 1)',
    cms_menu_item_label VARCHAR(100) NOT NULL
        COMMENT 'Text hien thi cua menu item',
    cms_menu_item_type VARCHAR(20) NOT NULL DEFAULT 'url'
        COMMENT 'Loai item: category, page, url, custom',
    cms_menu_item_value VARCHAR(255) NOT NULL
        COMMENT 'Gia tri: category_id / page_slug / URL / path',
    cms_menu_item_icon VARCHAR(50) NULL
        COMMENT 'Lucide icon name (optional)',
    cms_menu_item_badge VARCHAR(20) NULL
        COMMENT 'Badge text: Moi, Sale (optional)',
    cms_menu_item_open_new_tab TINYINT NOT NULL DEFAULT 0
        COMMENT 'Mo trong tab moi: 0: Khong, 1: Co',
    cms_menu_item_mobile_visible TINYINT NOT NULL DEFAULT 1
        COMMENT 'Hien thi tren mobile: 0: An, 1: Hien',
    cms_menu_item_sort DECIMAL(18,4) NOT NULL DEFAULT 0
        COMMENT 'Thu tu sap xep trong cung cap',
    CONSTRAINT fk_cmsmenuitem_cmsmenu
        FOREIGN KEY (cms_menu_id) REFERENCES cms_menu(cms_menu_id) ON DELETE CASCADE,
    CONSTRAINT fk_cmsmenuitem_parent
        FOREIGN KEY (cms_menu_item_parent_id) REFERENCES cms_menu_item(cms_menu_item_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT 'Cac item trong Menu (ho tro 2 cap cho header)';

CREATE INDEX ix_cmsmenuitem_cmsmenuid ON cms_menu_item(cms_menu_id);
CREATE INDEX ix_cmsmenuitem_parentid ON cms_menu_item(cms_menu_item_parent_id);
CREATE INDEX ix_cmsmenuitem_sort ON cms_menu_item(cms_menu_item_sort);
