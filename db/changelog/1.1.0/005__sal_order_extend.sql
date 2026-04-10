-- =============================================
-- Author:      Claude Code
-- Create date: 2026-04-10
-- Description: Mo rong sal_order: them shipping provider, tracking, internal note, modified_date
-- =============================================

USE fashion_ecom;

ALTER TABLE sal_order
    ADD COLUMN sal_order_shipping_provider VARCHAR(20) NULL COMMENT 'Ma don vi VC: GHN, GHTK, NINJA_VAN' AFTER sal_order_tracking_code,
    ADD COLUMN sal_order_internal_note TEXT NULL COMMENT 'Ghi chu noi bo (admin)' AFTER sal_order_note,
    ADD COLUMN modified_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Ngay cap nhat';
