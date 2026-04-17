-- =============================================
-- Author:      Claude AI
-- Create date: 2026-04-15
-- Description: Quan ly van chuyen — bang cau hinh dong gia + cot moi trong don hang
--              Phuc vu tinh loi nhuan per don va bao cao free ship
-- =============================================

-- 1. Bang cau hinh phi van chuyen theo don vi
CREATE TABLE IF NOT EXISTS sal_shipping_config (
  sal_shipping_config_id CHAR(36) NOT NULL DEFAULT (UUID()),
  sal_shipping_config_provider VARCHAR(20) NOT NULL COMMENT 'Ma don vi: GHN, GHTK, NINJA_VAN, J&T, BEST, MANUAL',
  sal_shipping_config_name VARCHAR(100) NOT NULL COMMENT 'Ten hien thi: Giao Hang Nhanh, ...',
  sal_shipping_config_flat_rate DECIMAL(22,4) NOT NULL DEFAULT 0 COMMENT 'Phi ship dong gia thu KH (VND)',
  sal_shipping_config_actual_cost DECIMAL(22,4) NOT NULL DEFAULT 0 COMMENT 'Chi phi thuc te tra hang van chuyen (VND)',
  sal_shipping_config_free_ship_threshold DECIMAL(22,4) NOT NULL DEFAULT 500000 COMMENT 'Nguong mien phi ship (VND). 0 = khong mien phi',
  sal_shipping_config_status TINYINT NOT NULL DEFAULT 1 COMMENT '0=inactive, 1=active',
  sal_shipping_config_sort_order INT NOT NULL DEFAULT 0 COMMENT 'Thu tu hien thi',
  created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modified_date DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (sal_shipping_config_id),
  UNIQUE INDEX uix_sal_shipping_config_provider (sal_shipping_config_provider)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Cau hinh phi van chuyen dong gia theo don vi';

-- 2. Them cot vao sal_order de luu chi phi thuc te + flag free ship
ALTER TABLE sal_order
  ADD COLUMN sal_order_shipping_cost_actual DECIMAL(22,4) NOT NULL DEFAULT 0
    COMMENT 'Chi phi ship thuc te tra hang van chuyen (VND)' AFTER sal_order_shipping_fee,
  ADD COLUMN sal_order_free_ship TINYINT NOT NULL DEFAULT 0
    COMMENT '1=don duoc mien phi ship (subtotal >= threshold)' AFTER sal_order_shipping_cost_actual;

-- 3. Seed du lieu cau hinh mac dinh — 4 don vi van chuyen pho bien
INSERT INTO sal_shipping_config
  (sal_shipping_config_id, sal_shipping_config_provider, sal_shipping_config_name,
   sal_shipping_config_flat_rate, sal_shipping_config_actual_cost,
   sal_shipping_config_free_ship_threshold, sal_shipping_config_sort_order)
VALUES
  (UUID(), 'GHN', 'Giao Hàng Nhanh', 30000, 22000, 500000, 1),
  (UUID(), 'GHTK', 'Giao Hàng Tiết Kiệm', 25000, 18000, 500000, 2),
  (UUID(), 'NINJA_VAN', 'Ninja Van', 35000, 25000, 500000, 3),
  (UUID(), 'JT', 'J&T Express', 28000, 20000, 500000, 4);
