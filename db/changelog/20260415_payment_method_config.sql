-- =============================================
-- Author:      Claude AI
-- Create date: 2026-04-15
-- Description: Cau hinh thanh toan theo tung phuong thuc — QR, STK, huong dan
--              Thay the bank_transfer settings cu bang bang rieng ho tro nhieu PT
-- =============================================

CREATE TABLE IF NOT EXISTS sal_payment_method_config (
  sal_payment_method_config_id CHAR(36) NOT NULL DEFAULT (UUID()),
  sal_payment_method_config_method TINYINT NOT NULL
    COMMENT '0=COD, 1=BankTransfer, 2=MoMo, 3=VNPAY, 4=Payoo, 5=ZaloPay',
  sal_payment_method_config_name VARCHAR(50) NOT NULL COMMENT 'Ten hien thi: Chuyen khoan, MoMo, ...',
  sal_payment_method_config_qr_image VARCHAR(500) DEFAULT NULL COMMENT 'URL anh QR thanh toan',
  sal_payment_method_config_account_name VARCHAR(100) DEFAULT NULL COMMENT 'Ten tai khoan',
  sal_payment_method_config_account_number VARCHAR(50) DEFAULT NULL COMMENT 'So tai khoan / SDT',
  sal_payment_method_config_bank_name VARCHAR(100) DEFAULT NULL COMMENT 'Ten ngan hang (neu CK)',
  sal_payment_method_config_instructions TEXT DEFAULT NULL COMMENT 'Huong dan thanh toan (HTML/text)',
  sal_payment_method_config_status TINYINT NOT NULL DEFAULT 1 COMMENT '0=tat, 1=bat',
  sal_payment_method_config_sort_order INT NOT NULL DEFAULT 0,
  created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modified_date DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (sal_payment_method_config_id),
  UNIQUE INDEX uix_payment_method_config_method (sal_payment_method_config_method)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Cau hinh QR + tai khoan cho tung phuong thuc thanh toan';

-- Seed du lieu mac dinh
INSERT INTO sal_payment_method_config
  (sal_payment_method_config_id, sal_payment_method_config_method, sal_payment_method_config_name,
   sal_payment_method_config_account_name, sal_payment_method_config_account_number,
   sal_payment_method_config_bank_name, sal_payment_method_config_sort_order)
VALUES
  (UUID(), 0, 'Thanh toán khi nhận hàng (COD)', NULL, NULL, NULL, 0),
  (UUID(), 1, 'Chuyển khoản ngân hàng', 'CONG TY TNHH FASHION ECOM', '1234567890', 'Vietcombank', 1),
  (UUID(), 2, 'Ví MoMo', 'FASHION ECOM', '0901234567', NULL, 2),
  (UUID(), 3, 'VNPay', 'FASHION ECOM', NULL, NULL, 3);
