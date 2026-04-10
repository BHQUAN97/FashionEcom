-- =============================================
-- Author:      Developer
-- Create date: 2026-04-10
-- Description: Seed default payment fee config — COD 1%, Bank 0%, MoMo/VNPay 1.5%
-- =============================================

INSERT INTO `log_payment_fee_config`
    (`log_payment_fee_config_id`, `log_payment_fee_config_payment_type`, `log_payment_fee_config_rate`, `log_payment_fee_config_fixed`, `effective_from`, `effective_to`)
VALUES
    (UUID(), 0, 0.0100, 0, '2026-01-01', NULL),  -- COD: 1%
    (UUID(), 1, 0.0000, 0, '2026-01-01', NULL),  -- Bank Transfer: 0%
    (UUID(), 2, 0.0150, 0, '2026-01-01', NULL);  -- MoMo/VNPay: 1.5%
