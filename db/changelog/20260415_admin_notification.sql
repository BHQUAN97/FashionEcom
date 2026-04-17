-- =============================================
-- Author:      Claude AI
-- Create date: 2026-04-15
-- Description: Notification cho admin — don moi, nhac chua duyet, su co
-- =============================================

CREATE TABLE IF NOT EXISTS sys_admin_notification (
  sys_admin_notification_id CHAR(36) NOT NULL DEFAULT (UUID()),
  sys_user_id CHAR(36) DEFAULT NULL COMMENT 'Admin cu the, NULL = tat ca admin',

  -- Loai: new_order, pending_payment, pending_order, shipping_incident, hourly_summary, system
  sys_admin_notification_type VARCHAR(30) NOT NULL,
  sys_admin_notification_title VARCHAR(255) NOT NULL,
  sys_admin_notification_body TEXT NOT NULL,
  sys_admin_notification_data JSON DEFAULT NULL COMMENT 'Du lieu kem theo (orderId, counts, ...)',

  -- 0=chua doc, 1=da doc
  sys_admin_notification_read TINYINT NOT NULL DEFAULT 0,
  sys_admin_notification_read_at DATETIME DEFAULT NULL,

  created_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (sys_admin_notification_id),
  INDEX ix_admin_notif_user (sys_user_id),
  INDEX ix_admin_notif_read (sys_admin_notification_read),
  INDEX ix_admin_notif_type (sys_admin_notification_type),
  INDEX ix_admin_notif_date (created_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT='Notification he thong cho admin — don moi, nhac chua duyet';
