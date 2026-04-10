-- =============================================
-- Author:      FashionEcom Dev
-- Create date: 2026-04-10
-- Description: Tao bang prm_discount_code + prm_discount_usage — ma giam gia
-- =============================================

CREATE TABLE IF NOT EXISTS prm_discount_code (
    prm_discount_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY
        COMMENT 'ID toan cuc cua Ma giam gia',
    prm_discount_code VARCHAR(20) NOT NULL
        COMMENT 'Ma code (uppercase, unique)',
    prm_discount_type TINYINT NOT NULL DEFAULT 1
        COMMENT 'Loai giam: 1: Phan tram, 2: So tien co dinh',
    prm_discount_value DECIMAL(22,4) NOT NULL DEFAULT 0
        COMMENT 'Gia tri giam (% hoac VND)',
    prm_discount_max_amount DECIMAL(22,4) NOT NULL DEFAULT 0
        COMMENT 'Giam toi da (VND, chi ap dung khi type=1)',
    prm_discount_conditions_json JSON NULL
        COMMENT 'Dieu kien ap dung: min_order, categories, products, ...',
    prm_discount_usage_count INT NOT NULL DEFAULT 0
        COMMENT 'So lan da su dung',
    prm_discount_max_usage INT NULL
        COMMENT 'Gioi han tong so lan su dung (NULL = unlimited)',
    prm_discount_max_per_customer INT NULL
        COMMENT 'Gioi han moi KH (NULL = unlimited)',
    prm_discount_start_date DATETIME NULL
        COMMENT 'Ngay bat dau hieu luc',
    prm_discount_end_date DATETIME NULL
        COMMENT 'Ngay het han (NULL = vinh vien)',
    prm_discount_stackable TINYINT NOT NULL DEFAULT 0
        COMMENT 'Ket hop voi ma khac: 0: Khong, 1: Co',
    prm_discount_status TINYINT NOT NULL DEFAULT 1
        COMMENT 'Trang thai: 0: An, 1: Active',
    prm_discount_customer_scope TINYINT NOT NULL DEFAULT 0
        COMMENT 'Pham vi KH: 0: Tat ca, 1: Da dang nhap, 2: KH cu the',
    prm_discount_customer_ids JSON NULL
        COMMENT 'Danh sach sys_customer_id khi scope=2',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP
        COMMENT 'Ngay tao ma'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT 'Ma giam gia (Voucher/Coupon) cho don hang';

CREATE UNIQUE INDEX uix_prmdiscountcode_code ON prm_discount_code(prm_discount_code);
CREATE INDEX ix_prmdiscountcode_status ON prm_discount_code(prm_discount_status);
CREATE INDEX ix_prmdiscountcode_dates ON prm_discount_code(prm_discount_start_date, prm_discount_end_date);

CREATE TABLE IF NOT EXISTS prm_discount_usage (
    prm_discount_usage_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY
        COMMENT 'ID toan cuc',
    prm_discount_id CHAR(36) NOT NULL
        COMMENT 'FK tro toi Ma giam gia',
    sys_customer_id CHAR(36) NOT NULL
        COMMENT 'FK tro toi Khach hang',
    sal_order_id CHAR(36) NOT NULL
        COMMENT 'FK tro toi Don hang da ap dung',
    prm_discount_usage_amount DECIMAL(22,4) NOT NULL DEFAULT 0
        COMMENT 'So tien duoc giam',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP
        COMMENT 'Thoi diem su dung',
    CONSTRAINT fk_prmdiscountusage_prmdiscount
        FOREIGN KEY (prm_discount_id) REFERENCES prm_discount_code(prm_discount_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT 'Lich su su dung ma giam gia theo KH va don hang';

CREATE INDEX ix_prmdiscountusage_discountid ON prm_discount_usage(prm_discount_id);
CREATE INDEX ix_prmdiscountusage_customerid ON prm_discount_usage(sys_customer_id);
CREATE UNIQUE INDEX uix_prmdiscountusage_discount_order
    ON prm_discount_usage(prm_discount_id, sal_order_id);
