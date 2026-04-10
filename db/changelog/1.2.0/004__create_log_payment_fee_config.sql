-- =============================================
-- Author:      Developer
-- Create date: 2026-04-10
-- Description: Config ty le phi cong thanh toan theo tung phuong thuc (cho bao cao P&L)
-- =============================================

CREATE TABLE IF NOT EXISTS `log_payment_fee_config` (
    `log_payment_fee_config_id`           CHAR(36) NOT NULL DEFAULT (UUID()) COMMENT 'PK — UUID',
    `log_payment_fee_config_payment_type` TINYINT NOT NULL COMMENT '0:COD, 1:Bank Transfer, 2:MoMo/VNPay',
    `log_payment_fee_config_rate`         DECIMAL(18,4) NOT NULL DEFAULT 0 COMMENT 'Ty le phi (VD: 0.015 = 1.5%)',
    `log_payment_fee_config_fixed`        DECIMAL(22,4) NOT NULL DEFAULT 0 COMMENT 'Phi co dinh (neu co)',
    `effective_from`                       DATE NOT NULL COMMENT 'Ngay bat dau ap dung',
    `effective_to`                         DATE NULL COMMENT 'Ngay het hieu luc (NULL = hien tai)',
    PRIMARY KEY (`log_payment_fee_config_id`),
    INDEX `ix_logpaymentfeeconfig_paymenttype` (`log_payment_fee_config_payment_type`),
    INDEX `ix_logpaymentfeeconfig_effectivefrom` (`effective_from`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Ty le phi cong thanh toan — dung trong bao cao Lo/Lai';
