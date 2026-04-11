-- =============================================
-- Author:      FashionEcom
-- Create date: 2026-04-10
-- Description: Bang giao dich thanh toan online (MoMo, VNPAY, Payoo, ZaloPay)
-- =============================================

CREATE TABLE sal_payment (
    sal_payment_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID toan cuc giao dich thanh toan',
    sal_order_id CHAR(36) NOT NULL COMMENT 'Khoa ngoai tro toi Don hang',
    sal_payment_method TINYINT NOT NULL DEFAULT 0 COMMENT 'Phuong thuc: 0: COD, 1: Bank Transfer, 2: MoMo, 3: VNPAY, 4: Payoo, 5: ZaloPay',
    sal_payment_amount DECIMAL(22,4) NOT NULL DEFAULT 0 COMMENT 'So tien giao dich',
    sal_payment_fee DECIMAL(22,4) NOT NULL DEFAULT 0 COMMENT 'Phi cong thanh toan (tinh vao P&L)',
    sal_payment_status TINYINT NOT NULL DEFAULT 0 COMMENT 'Trang thai: 0: Pending, 1: Success, 2: Failed, 3: Refunded, 4: Expired',
    sal_payment_transaction_id VARCHAR(100) NULL COMMENT 'Ma giao dich tu gateway (momo transId, vnpay TransactionNo...)',
    sal_payment_gateway_response TEXT NULL COMMENT 'Raw JSON response tu gateway (debug)',
    sal_payment_redirect_url VARCHAR(500) NULL COMMENT 'URL redirect sang gateway',
    sal_payment_expires_at DATETIME NULL COMMENT 'Thoi diem het han giao dich (15 phut)',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngay tao giao dich',
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Ngay cap nhat cuoi',
    CONSTRAINT fk_salpayment_salorder FOREIGN KEY (sal_order_id) REFERENCES sal_order(sal_order_id) ON DELETE RESTRICT
) COMMENT 'Giao dich thanh toan online (MoMo, VNPAY, Payoo, ZaloPay)';

CREATE INDEX ix_salpayment_salorderid ON sal_payment(sal_order_id);
CREATE INDEX ix_salpayment_salpaymentstatus ON sal_payment(sal_payment_status);
CREATE UNIQUE INDEX uix_salpayment_salpaymenttransactionid ON sal_payment(sal_payment_transaction_id);
