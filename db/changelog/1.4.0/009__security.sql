-- =============================================
-- Author:      FashionEcom
-- Create date: 2026-04-10
-- Description: Nhat ky dang nhap + Lich su mat khau (security enhancements)
-- =============================================

CREATE TABLE log_access (
    log_access_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID log dang nhap',
    sys_user_id CHAR(36) NULL COMMENT 'User (NULL neu login failed)',
    log_access_email VARCHAR(100) NOT NULL COMMENT 'Email dang nhap',
    log_access_success TINYINT NOT NULL DEFAULT 0 COMMENT '0: That bai, 1: Thanh cong',
    log_access_ip VARCHAR(50) NOT NULL COMMENT 'IP address',
    log_access_user_agent VARCHAR(500) NULL COMMENT 'Browser User-Agent',
    log_access_geo VARCHAR(100) NULL COMMENT 'Geo location (tinh/thanh tu IP)',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Thoi diem dang nhap'
) COMMENT 'Nhat ky dang nhap he thong (bao gom that bai)';

CREATE INDEX ix_logaccess_email ON log_access(log_access_email);
CREATE INDEX ix_logaccess_sysuserid ON log_access(sys_user_id);
CREATE INDEX ix_logaccess_createddate ON log_access(created_date);

CREATE TABLE sys_password_history (
    sys_password_history_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID lich su mat khau',
    sys_user_id CHAR(36) NOT NULL COMMENT 'Khoa ngoai User',
    sys_password_history_hash VARCHAR(255) NOT NULL COMMENT 'Hash mat khau cu',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngay doi mat khau',
    CONSTRAINT fk_syspasswordhistory_sysuser FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id) ON DELETE CASCADE
) COMMENT 'Lich su mat khau (chong dung lai 5 mat khau gan nhat)';

CREATE INDEX ix_syspasswordhistory_sysuserid ON sys_password_history(sys_user_id);
