-- =============================================
-- Author:      FashionEcom
-- Create date: 2026-04-10
-- Description: Cau hinh va giao dich Loyalty Program
-- =============================================

CREATE TABLE prm_loyalty_config (
    prm_loyalty_config_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID cau hinh loyalty',
    prm_loyalty_config_earn_rate DECIMAL(18,4) NOT NULL DEFAULT 10000 COMMENT 'So VND de tich 1 diem (mac dinh 10,000)',
    prm_loyalty_config_redeem_rate DECIMAL(18,4) NOT NULL DEFAULT 100 COMMENT 'So diem de doi 10,000 VND (mac dinh 100)',
    prm_loyalty_config_max_redeem_percent DECIMAL(18,4) NOT NULL DEFAULT 50 COMMENT '% toi da gia tri don duoc dung diem',
    prm_loyalty_config_min_redeem_points DECIMAL(18,4) NOT NULL DEFAULT 50 COMMENT 'So diem toi thieu de doi',
    prm_loyalty_config_expiry_months DECIMAL(18,4) NOT NULL DEFAULT 12 COMMENT 'So thang het han diem',
    prm_loyalty_config_pending_days DECIMAL(18,4) NOT NULL DEFAULT 7 COMMENT 'So ngay cho truoc khi diem duoc confirmed',
    prm_loyalty_config_silver_threshold DECIMAL(22,4) NOT NULL DEFAULT 2000000 COMMENT 'Nguong len Silver (VND/12 thang)',
    prm_loyalty_config_gold_threshold DECIMAL(22,4) NOT NULL DEFAULT 5000000 COMMENT 'Nguong len Gold',
    prm_loyalty_config_platinum_threshold DECIMAL(22,4) NOT NULL DEFAULT 15000000 COMMENT 'Nguong len Platinum',
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Ngay cap nhat'
) COMMENT 'Cau hinh chuong trinh Loyalty (1 record duy nhat)';

-- Insert default config
INSERT INTO prm_loyalty_config (prm_loyalty_config_id) VALUES (UUID());

CREATE TABLE prm_loyalty_transaction (
    prm_loyalty_transaction_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID giao dich diem',
    sys_customer_id CHAR(36) NOT NULL COMMENT 'Khoa ngoai tro toi KH',
    prm_loyalty_transaction_type TINYINT NOT NULL COMMENT 'Loai: 0: Earn, 1: Redeem, 2: Expire, 3: Refund, 4: Adjust',
    prm_loyalty_transaction_points DECIMAL(18,4) NOT NULL DEFAULT 0 COMMENT 'So diem (+ tich, - tieu)',
    prm_loyalty_transaction_balance DECIMAL(18,4) NOT NULL DEFAULT 0 COMMENT 'So du sau giao dich',
    prm_loyalty_transaction_ref_type VARCHAR(50) NULL COMMENT 'Loai tham chieu: order, return, admin_adjust, birthday, event',
    prm_loyalty_transaction_ref_id CHAR(36) NULL COMMENT 'ID doi tuong tham chieu',
    prm_loyalty_transaction_description VARCHAR(255) NULL COMMENT 'Mo ta giao dich',
    prm_loyalty_transaction_expires_at DATETIME NULL COMMENT 'Ngay het han diem (chi cho type=earn)',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngay giao dich',
    CONSTRAINT fk_prmloyaltytransaction_syscustomer FOREIGN KEY (sys_customer_id) REFERENCES sys_customer(sys_customer_id) ON DELETE RESTRICT
) COMMENT 'Lich su giao dich diem Loyalty';

CREATE INDEX ix_prmloyaltytransaction_syscustomerid ON prm_loyalty_transaction(sys_customer_id);
CREATE INDEX ix_prmloyaltytransaction_createddate ON prm_loyalty_transaction(created_date);
CREATE INDEX ix_prmloyaltytransaction_expiresdate ON prm_loyalty_transaction(prm_loyalty_transaction_expires_at);
