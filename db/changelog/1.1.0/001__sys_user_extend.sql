-- =============================================
-- Author:      Claude Code
-- Create date: 2026-04-10
-- Description: Mo rong sys_user: them columns cho admin panel (name, avatar, login tracking)
-- =============================================

USE fashion_ecom;

ALTER TABLE sys_user
    ADD COLUMN sys_user_name VARCHAR(100) NULL COMMENT 'Ho ten hien thi' AFTER sys_user_email,
    ADD COLUMN sys_user_avatar VARCHAR(255) NULL COMMENT 'Duong dan avatar' AFTER sys_user_name,
    ADD COLUMN sys_user_last_login DATETIME NULL COMMENT 'Lan dang nhap gan nhat',
    ADD COLUMN sys_user_login_count INT NOT NULL DEFAULT 0 COMMENT 'So lan dang nhap',
    ADD COLUMN modified_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Ngay cap nhat';
