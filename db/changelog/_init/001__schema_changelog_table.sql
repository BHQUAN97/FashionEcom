-- Schema Changelog Tracker — ghi lai cac migration da ap dung
CREATE TABLE IF NOT EXISTS schema_changelog (
    schema_changelog_id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY COMMENT 'UUID PK — MISA convention',
    version VARCHAR(20) NOT NULL COMMENT 'Version (VD: 1.0.0)',
    filename VARCHAR(255) NOT NULL COMMENT 'Ten file SQL',
    checksum VARCHAR(64) NULL COMMENT 'SHA256 cua file SQL',
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Thoi diem ap dung',
    applied_by VARCHAR(100) DEFAULT 'system' COMMENT 'Nguoi/he thong ap dung',
    execution_ms INT DEFAULT 0 COMMENT 'Thoi gian chay (ms)',
    UNIQUE KEY uix_changelog_version_filename (version, filename)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT 'Theo doi cac migration SQL da ap dung';
