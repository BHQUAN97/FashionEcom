-- =============================================
-- Author:      BHQUAN97
-- Create date: 2026-04-14
-- Description: Tao bang log_system — HTTP request/response log (NLog style)
-- =============================================

CREATE TABLE IF NOT EXISTS log_system (
    log_system_id       CHAR(36)     NOT NULL DEFAULT (UUID()) PRIMARY KEY
                        COMMENT 'UUID PK',
    log_system_level    VARCHAR(10)  NOT NULL
                        COMMENT 'Log level: DEBUG, INFO, WARN, ERROR, FATAL',
    log_system_method   VARCHAR(10)  NOT NULL
                        COMMENT 'HTTP method: GET, POST, PUT, DELETE, PATCH',
    log_system_url      VARCHAR(500) NOT NULL
                        COMMENT 'URL path (khong bao gom host)',
    log_system_status   SMALLINT     NOT NULL
                        COMMENT 'HTTP status code: 200, 400, 401, 404, 500...',
    log_system_duration INT          NOT NULL DEFAULT 0
                        COMMENT 'Response time (ms)',
    log_system_request_body TEXT     NULL
                        COMMENT 'Request body (truncated 2KB, bo sensitive fields)',
    log_system_error    TEXT         NULL
                        COMMENT 'Error message (cho 4xx/5xx)',
    log_system_stack    TEXT         NULL
                        COMMENT 'Stack trace (chi ghi cho 5xx)',
    sys_user_id         CHAR(36)     NULL
                        COMMENT 'FK user da dang nhap (null neu anonymous)',
    log_system_ip       VARCHAR(45)  NULL
                        COMMENT 'Client IP address',
    log_system_user_agent VARCHAR(500) NULL
                        COMMENT 'Browser/client user agent',
    created_date        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
                        COMMENT 'Thoi diem ghi log',

    INDEX ix_log_system_level (log_system_level),
    INDEX ix_log_system_status (log_system_status),
    INDEX ix_log_system_created (created_date),
    INDEX ix_log_system_method_url (log_system_method, log_system_url(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT 'HTTP request/response log — NLog style, luu 4xx/5xx + mutating 2xx';
