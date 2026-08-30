-- =============================================
-- Author:      Claude AI
-- Create date: 2026-04-15
-- Description: Su co van chuyen — mat hang, hu hong, hoan tra, giao lai nhieu lan
--              Theo doi impact len loi nhuan/doanh thu
-- =============================================

-- 1. Bang su co van chuyen
CREATE TABLE IF NOT EXISTS sal_shipping_incident (
  sal_shipping_incident_id CHAR(36) NOT NULL DEFAULT (UUID()),

  sal_order_id CHAR(36) NOT NULL COMMENT 'Don hang lien quan',

  -- Loai su co
  -- 1=hu_hong (damaged), 2=mat_hang (lost), 3=khach_tu_choi (customer_refused),
  -- 4=giao_lai (re_delivery), 5=dia_chi_sai (wrong_address), 6=khac (other)
  sal_shipping_incident_type TINYINT NOT NULL COMMENT 'Loai su co: 1-6',

  -- Trang thai xu ly
  -- 0=mo (open), 1=dang_xu_ly (investigating), 2=da_xu_ly (resolved), 3=dong (closed)
  sal_shipping_incident_status TINYINT NOT NULL DEFAULT 0 COMMENT 'Trang thai: 0-3',

  -- So lan giao hang (1 = giao lan dau, 2+ = giao lai)
  sal_shipping_incident_delivery_attempts INT NOT NULL DEFAULT 1
    COMMENT 'So lan giao hang (2+ = phat sinh phu phi giao lai)',

  -- Chi phi phat sinh
  sal_shipping_incident_extra_cost DECIMAL(22,4) NOT NULL DEFAULT 0
    COMMENT 'Phu phi phat sinh (giao lai, luu kho, ...)',

  -- Gia tri hang hu hong / mat
  sal_shipping_incident_product_loss DECIMAL(22,4) NOT NULL DEFAULT 0
    COMMENT 'Gia tri hang bi hu hong hoac mat (COGS)',

  -- So tien hoan tra KH (neu co)
  sal_shipping_incident_refund_amount DECIMAL(22,4) NOT NULL DEFAULT 0
    COMMENT 'So tien hoan tra KH',

  -- DVVC boi thuong (neu co)
  sal_shipping_incident_carrier_compensation DECIMAL(22,4) NOT NULL DEFAULT 0
    COMMENT 'So tien DVVC boi thuong',

  -- Ket qua cuoi cung cho doanh thu
  -- 0=binh_thuong (doanh thu giu nguyen), 1=mat_doanh_thu (revenue=0), 2=giam_doanh_thu (partial)
  sal_shipping_incident_revenue_impact TINYINT NOT NULL DEFAULT 0
    COMMENT '0=binh thuong, 1=mat toan bo DT, 2=giam 1 phan',

  sal_shipping_incident_note TEXT DEFAULT NULL COMMENT 'Ghi chu chi tiet su co',
  sal_shipping_incident_photos JSON DEFAULT NULL COMMENT 'Anh chung minh hu hong / mat hang',
  sal_shipping_incident_resolved_date DATETIME DEFAULT NULL,

  sys_user_id CHAR(36) DEFAULT NULL COMMENT 'Nguoi tao / xu ly su co',

  created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  modified_date DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (sal_shipping_incident_id),
  INDEX ix_sal_shipping_incident_order (sal_order_id),
  INDEX ix_sal_shipping_incident_type (sal_shipping_incident_type),
  INDEX ix_sal_shipping_incident_status (sal_shipping_incident_status),
  INDEX ix_sal_shipping_incident_date (created_date),
  CONSTRAINT fk_shipping_incident_order FOREIGN KEY (sal_order_id)
    REFERENCES sal_order(sal_order_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Su co van chuyen — mat hang, hu hong, hoan, giao lai';

-- 2. Them cot tong hop su co vao order de query nhanh
ALTER TABLE sal_order
  ADD COLUMN sal_order_delivery_attempts INT NOT NULL DEFAULT 1
    COMMENT 'So lan giao hang (1=binh thuong, 2+=giao lai)' AFTER sal_order_shipping_status,
  ADD COLUMN sal_order_shipping_extra_cost DECIMAL(22,4) NOT NULL DEFAULT 0
    COMMENT 'Tong phu phi ship phat sinh (giao lai, ...)' AFTER sal_order_delivery_attempts,
  ADD COLUMN sal_order_has_incident TINYINT NOT NULL DEFAULT 0
    COMMENT '1=don co su co van chuyen' AFTER sal_order_shipping_extra_cost;
