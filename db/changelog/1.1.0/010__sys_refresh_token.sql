-- =============================================
-- Author:      Claude Code
-- Create date: 2026-04-10
-- Description: Tao bang luu tru refresh tokens (JWT rotation + revoke)
-- =============================================

USE fashion_ecom;

CREATE TABLE sys_refresh_token (
    sys_refresh_token_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY,
    sys_user_id CHAR(36) NOT NULL,
    sys_refresh_token_hash VARCHAR(255) NOT NULL COMMENT 'Hash cua refresh token',
    sys_refresh_token_expires DATETIME NOT NULL,
    sys_refresh_token_revoked TINYINT NOT NULL DEFAULT 0,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sysrefreshtoken_sysuser FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id) ON DELETE CASCADE
) COMMENT 'Luu tru refresh tokens';

CREATE INDEX ix_sysrefreshtoken_sysuserid ON sys_refresh_token(sys_user_id);
