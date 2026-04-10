-- =============================================
-- Author:      FashionEcom Dev
-- Create date: 2026-04-10
-- Description: Tao bang prm_flash_sale + prm_flash_sale_item
-- =============================================

CREATE TABLE IF NOT EXISTS prm_flash_sale (
    prm_flash_sale_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY
        COMMENT 'ID toan cuc cua Flash Sale',
    prm_flash_sale_title VARCHAR(255) NOT NULL
        COMMENT 'Tieu de flash sale',
    prm_flash_sale_start_date DATETIME NOT NULL
        COMMENT 'Thoi diem bat dau',
    prm_flash_sale_end_date DATETIME NOT NULL
        COMMENT 'Thoi diem ket thuc',
    prm_flash_sale_status TINYINT NOT NULL DEFAULT 0
        COMMENT 'Trang thai: 0: Draft, 1: Scheduled, 2: Active, 3: Ended',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP
        COMMENT 'Ngay tao'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT 'Chuong trinh Flash Sale (giam gia co thoi han)';

CREATE INDEX ix_prmflashsale_status ON prm_flash_sale(prm_flash_sale_status);
CREATE INDEX ix_prmflashsale_dates ON prm_flash_sale(prm_flash_sale_start_date, prm_flash_sale_end_date);

CREATE TABLE IF NOT EXISTS prm_flash_sale_item (
    prm_flash_sale_item_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY
        COMMENT 'ID toan cuc cua Flash Sale Item',
    prm_flash_sale_id CHAR(36) NOT NULL
        COMMENT 'FK tro toi Flash Sale',
    cat_product_id CHAR(36) NOT NULL
        COMMENT 'FK tro toi San pham',
    prm_flash_sale_item_discount_pct DECIMAL(18,4) NOT NULL DEFAULT 0
        COMMENT 'Phan tram giam gia (10 = giam 10%)',
    prm_flash_sale_item_max_qty INT NOT NULL DEFAULT 0
        COMMENT 'So luong gioi han ban trong flash sale',
    prm_flash_sale_item_sold_qty INT NOT NULL DEFAULT 0
        COMMENT 'So luong da ban',
    CONSTRAINT fk_prmflashsaleitem_flashsale
        FOREIGN KEY (prm_flash_sale_id) REFERENCES prm_flash_sale(prm_flash_sale_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT 'Chi tiet San pham trong Flash Sale';

CREATE INDEX ix_prmflashsaleitem_flashsaleid ON prm_flash_sale_item(prm_flash_sale_id);
CREATE INDEX ix_prmflashsaleitem_productid ON prm_flash_sale_item(cat_product_id);
CREATE UNIQUE INDEX uix_prmflashsaleitem_sale_product
    ON prm_flash_sale_item(prm_flash_sale_id, cat_product_id);
