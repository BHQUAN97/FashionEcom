-- =============================================
-- Author:      Claude Code
-- Create date: 2026-04-15
-- Description: Tao bang chuong trinh sale (prm_sale_campaign)
--              va chi tiet giam gia per variant (prm_sale_campaign_variant)
-- =============================================

USE fashion_ecom;

-- Bang chinh: chuong trinh sale (VD: "Sale He 2026", "Black Friday")
CREATE TABLE IF NOT EXISTS prm_sale_campaign (
    prm_sale_campaign_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY
        COMMENT 'ID chuong trinh sale',
    prm_sale_campaign_name VARCHAR(255) NOT NULL
        COMMENT 'Ten chuong trinh (VD: Sale He 2026)',
    prm_sale_campaign_desc TEXT NULL
        COMMENT 'Mo ta chuong trinh',
    prm_sale_campaign_start_date DATETIME NOT NULL
        COMMENT 'Thoi diem bat dau',
    prm_sale_campaign_end_date DATETIME NOT NULL
        COMMENT 'Thoi diem ket thuc',
    prm_sale_campaign_discount_type TINYINT NOT NULL DEFAULT 1
        COMMENT 'Loai giam gia mac dinh: 1=Phan tram, 2=Gia co dinh',
    prm_sale_campaign_discount_value DECIMAL(22,4) NOT NULL DEFAULT 0
        COMMENT 'Gia tri giam mac dinh (% hoac so tien). Ap dung cho tat ca variant trong campaign neu khong co override',
    prm_sale_campaign_priority TINYINT NOT NULL DEFAULT 0
        COMMENT 'Do uu tien (cao hon = uu tien hon khi SP thuoc nhieu campaign)',
    prm_sale_campaign_status TINYINT NOT NULL DEFAULT 0
        COMMENT '0: Draft, 1: Scheduled, 2: Active, 3: Paused, 4: Ended',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP
        COMMENT 'Ngay tao',
    modified_date DATETIME NULL ON UPDATE CURRENT_TIMESTAMP
        COMMENT 'Ngay sua cuoi'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT 'Chuong trinh sale — giam gia theo dot, co thoi gian bat dau/ket thuc';

CREATE INDEX ix_prmsalecampaign_status ON prm_sale_campaign(prm_sale_campaign_status);
CREATE INDEX ix_prmsalecampaign_dates ON prm_sale_campaign(prm_sale_campaign_start_date, prm_sale_campaign_end_date);

-- Chi tiet: gia sale per variant (override gia mac dinh cua campaign)
CREATE TABLE IF NOT EXISTS prm_sale_campaign_variant (
    prm_sale_campaign_variant_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY
        COMMENT 'ID chi tiet',
    prm_sale_campaign_id CHAR(36) NOT NULL
        COMMENT 'FK chuong trinh sale',
    cat_product_variant_id CHAR(36) NOT NULL
        COMMENT 'FK variant san pham',
    prm_sale_cv_discount_type TINYINT NULL
        COMMENT 'Override loai giam: NULL=dung default campaign, 1=%, 2=gia co dinh',
    prm_sale_cv_discount_value DECIMAL(22,4) NULL
        COMMENT 'Override gia tri giam: NULL=dung default campaign',
    prm_sale_cv_sale_price DECIMAL(22,4) NULL
        COMMENT 'Gia sale cuoi cung (tinh san hoac set truc tiep). NULL=tu dong tinh tu % + gia goc',
    prm_sale_cv_status TINYINT NOT NULL DEFAULT 1
        COMMENT '0: Bo qua variant nay, 1: Active trong campaign',
    CONSTRAINT fk_prmsalecv_campaign
        FOREIGN KEY (prm_sale_campaign_id) REFERENCES prm_sale_campaign(prm_sale_campaign_id) ON DELETE CASCADE,
    CONSTRAINT fk_prmsalecv_variant
        FOREIGN KEY (cat_product_variant_id) REFERENCES cat_product_variant(cat_product_variant_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT 'Chi tiet gia sale per variant trong campaign — override hoac dung default';

CREATE INDEX ix_prmsalecv_campaignid ON prm_sale_campaign_variant(prm_sale_campaign_id);
CREATE INDEX ix_prmsalecv_variantid ON prm_sale_campaign_variant(cat_product_variant_id);
CREATE UNIQUE INDEX uix_prmsalecv_campaign_variant
    ON prm_sale_campaign_variant(prm_sale_campaign_id, cat_product_variant_id);
