-- =============================================
-- Author:      FashionEcom
-- Create date: 2026-04-10
-- Description: Notification queue + Push subscription
-- =============================================

CREATE TABLE sys_notification (
    sys_notification_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID notification',
    sys_customer_id CHAR(36) NULL COMMENT 'KH nhan (NULL = broadcast)',
    sys_notification_type VARCHAR(50) NOT NULL COMMENT 'Loai: order_status, flash_sale, abandoned_cart, loyalty, review_reminder',
    sys_notification_title VARCHAR(255) NOT NULL COMMENT 'Tieu de',
    sys_notification_body TEXT NOT NULL COMMENT 'Noi dung',
    sys_notification_data JSON NULL COMMENT 'Payload data (link, order_id, ...)',
    sys_notification_channel TINYINT NOT NULL DEFAULT 0 COMMENT '0: Push, 1: Email, 2: Both',
    sys_notification_status TINYINT NOT NULL DEFAULT 0 COMMENT '0: Queued, 1: Sent, 2: Failed, 3: Read',
    sys_notification_sent_at DATETIME NULL COMMENT 'Thoi diem gui thanh cong',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngay tao'
) COMMENT 'Hang doi thong bao (push + email)';

CREATE INDEX ix_sysnotification_syscustomerid ON sys_notification(sys_customer_id);
CREATE INDEX ix_sysnotification_status ON sys_notification(sys_notification_status);
CREATE INDEX ix_sysnotification_createddate ON sys_notification(created_date);

CREATE TABLE sys_push_subscription (
    sys_push_subscription_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID dang ky push',
    sys_customer_id CHAR(36) NOT NULL COMMENT 'Khoa ngoai KH',
    sys_push_subscription_endpoint VARCHAR(500) NOT NULL COMMENT 'Push endpoint URL',
    sys_push_subscription_keys JSON NOT NULL COMMENT '{ p256dh, auth } keys',
    sys_push_subscription_user_agent VARCHAR(255) NULL COMMENT 'Browser info',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngay dang ky',
    CONSTRAINT fk_syspushsubscription_syscustomer FOREIGN KEY (sys_customer_id) REFERENCES sys_customer(sys_customer_id) ON DELETE CASCADE
) COMMENT 'Danh sach dang ky nhan Push Notification';

CREATE INDEX ix_syspushsubscription_syscustomerid ON sys_push_subscription(sys_customer_id);
