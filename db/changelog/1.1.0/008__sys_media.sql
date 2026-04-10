-- =============================================
-- Author:      Claude Code
-- Create date: 2026-04-10
-- Description: Tao bang thu vien media toan he thong
-- =============================================

USE fashion_ecom;

CREATE TABLE sys_media (
    sys_media_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID media',
    sys_media_filename VARCHAR(255) NOT NULL COMMENT 'Ten file goc',
    sys_media_path VARCHAR(255) NOT NULL COMMENT 'Duong dan storage',
    sys_media_type TINYINT NOT NULL DEFAULT 1 COMMENT '1: Image, 2: Video',
    sys_media_size INT NOT NULL DEFAULT 0 COMMENT 'Kich thuoc file (bytes)',
    sys_media_width INT NULL COMMENT 'Chieu rong (px)',
    sys_media_height INT NULL COMMENT 'Chieu cao (px)',
    sys_media_alt VARCHAR(255) NULL COMMENT 'Alt text',
    sys_user_id CHAR(36) NULL COMMENT 'Nguoi upload',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP
) COMMENT 'Thu vien media toan he thong';

CREATE INDEX ix_sysmedia_createddate ON sys_media(created_date);
CREATE INDEX ix_sysmedia_sysmediatype ON sys_media(sys_media_type);
