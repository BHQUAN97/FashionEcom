-- =============================================
-- Author:      Developer
-- Create date: 2026-04-10
-- Description: Bang RFM scores per customer — tinh bang cron daily, TRUNCATE + INSERT
-- =============================================

CREATE TABLE IF NOT EXISTS `log_customer_rfm` (
    `log_customer_rfm_id`            CHAR(36) NOT NULL DEFAULT (UUID()) COMMENT 'PK — UUID',
    `sys_customer_id`                CHAR(36) NOT NULL COMMENT 'FK → sys_customer (UNIQUE — 1 record per customer)',
    `log_customer_rfm_recency`       DECIMAL(18,4) NOT NULL DEFAULT 0 COMMENT 'So ngay tu don cuoi',
    `log_customer_rfm_frequency`     DECIMAL(18,4) NOT NULL DEFAULT 0 COMMENT 'Tong so don hoan thanh',
    `log_customer_rfm_monetary`      DECIMAL(22,4) NOT NULL DEFAULT 0 COMMENT 'Tong gia tri don hoan thanh',
    `log_customer_rfm_r_score`       TINYINT NOT NULL DEFAULT 1 COMMENT 'Score R (1-5)',
    `log_customer_rfm_f_score`       TINYINT NOT NULL DEFAULT 1 COMMENT 'Score F (1-5)',
    `log_customer_rfm_m_score`       TINYINT NOT NULL DEFAULT 1 COMMENT 'Score M (1-5)',
    `log_customer_rfm_segment`       VARCHAR(50) NOT NULL DEFAULT 'Lost' COMMENT 'Ten segment: Champions, Loyal Customers, Potential Loyalists, New Customers, At Risk, Cant Lose Them, Hibernating, Lost',
    `log_customer_rfm_calculated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thoi diem tinh',
    PRIMARY KEY (`log_customer_rfm_id`),
    UNIQUE INDEX `uix_logcustomerrfm_syscustomerid` (`sys_customer_id`),
    INDEX `ix_logcustomerrfm_segment` (`log_customer_rfm_segment`),
    CONSTRAINT `fk_logcustomerrfm_syscustomer`
        FOREIGN KEY (`sys_customer_id`) REFERENCES `sys_customer` (`sys_customer_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='RFM scores per customer — recalc daily 01:00';
