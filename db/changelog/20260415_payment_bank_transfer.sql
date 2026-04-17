-- =============================================
-- Author:      Claude AI
-- Create date: 2026-04-15
-- Description: Ho tro thanh toan chuyen khoan — upload proof, admin duyet/tu choi
-- =============================================

-- 1. Them cot vao sal_payment cho flow bank transfer
ALTER TABLE sal_payment
  ADD COLUMN sal_payment_proof_image VARCHAR(500) DEFAULT NULL
    COMMENT 'URL anh chung minh da chuyen khoan (KH upload)' AFTER sal_payment_gateway_response,
  ADD COLUMN sal_payment_admin_note TEXT DEFAULT NULL
    COMMENT 'Ghi chu admin khi duyet/tu choi' AFTER sal_payment_proof_image,
  ADD COLUMN sal_payment_reviewed_by CHAR(36) DEFAULT NULL
    COMMENT 'Admin ID nguoi duyet' AFTER sal_payment_admin_note,
  ADD COLUMN sal_payment_reviewed_at DATETIME DEFAULT NULL
    COMMENT 'Thoi diem duyet' AFTER sal_payment_reviewed_by;

-- 2. Seed bank info vao settings
INSERT INTO sys_setting (sys_setting_id, sys_setting_group, sys_setting_key, sys_setting_value) VALUES
  (UUID(), 'bank_transfer', 'bank_name', 'Vietcombank'),
  (UUID(), 'bank_transfer', 'bank_account_number', '1234567890'),
  (UUID(), 'bank_transfer', 'bank_account_name', 'CONG TY TNHH FASHION ECOM'),
  (UUID(), 'bank_transfer', 'bank_branch', 'Ho Chi Minh'),
  (UUID(), 'bank_transfer', 'bank_qr_image', ''),
  (UUID(), 'bank_transfer', 'transfer_note_template', 'DH {orderCode}')
ON DUPLICATE KEY UPDATE sys_setting_value = VALUES(sys_setting_value);
