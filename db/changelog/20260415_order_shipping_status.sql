-- =============================================
-- Author:      Claude AI
-- Create date: 2026-04-15
-- Description: Trang thai van chuyen rieng biet cho don hang
--              Tach biet business status (don hang) va delivery status (giao hang)
-- =============================================

ALTER TABLE sal_order
  ADD COLUMN sal_order_shipping_status TINYINT NOT NULL DEFAULT 0
    COMMENT '0=chua_giao, 1=cho_lay_hang, 2=da_lay_hang, 3=dang_van_chuyen, 4=dang_giao, 5=giao_thanh_cong, 6=giao_that_bai, 7=dang_giao_lai, 8=hoan_hang, 9=mat_hang, 10=hu_hong'
    AFTER sal_order_has_incident;
