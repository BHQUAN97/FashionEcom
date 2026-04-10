-- =============================================
-- Author:      Developer
-- Create date: 2026-04-10
-- Description: Bang raw events cho analytics tracking (page views, cart, checkout, search)
-- =============================================

CREATE TABLE IF NOT EXISTS `log_analytics_event` (
    `log_analytics_event_id`          CHAR(36) NOT NULL DEFAULT (UUID()) COMMENT 'PK — UUID',
    `log_analytics_event_type`        VARCHAR(50) NOT NULL COMMENT 'Event type: page_view, product_view, add_to_cart, remove_from_cart, begin_checkout, enter_shipping, select_payment, complete_order, search, wishlist_add, review_submit',
    `log_analytics_event_data`        JSON NULL COMMENT 'Payload tu do (product_id, variant_id, search_term, ...)',
    `log_analytics_event_session_id`  VARCHAR(100) NOT NULL COMMENT 'Session tracking UUID (client-side)',
    `sys_customer_id`                 CHAR(36) NULL COMMENT 'FK → sys_customer. NULL neu chua dang nhap',
    `log_analytics_event_device`      VARCHAR(20) NULL COMMENT 'mobile / tablet / desktop',
    `log_analytics_event_source`      VARCHAR(50) NULL COMMENT 'utm_source / referrer',
    `created_date`                    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thoi diem event',
    PRIMARY KEY (`log_analytics_event_id`),
    INDEX `ix_loganalyticsevent_eventtype_createddate` (`log_analytics_event_type`, `created_date`),
    INDEX `ix_loganalyticsevent_sessionid` (`log_analytics_event_session_id`),
    INDEX `ix_loganalyticsevent_syscustomerid` (`sys_customer_id`),
    INDEX `ix_loganalyticsevent_createddate` (`created_date`),
    CONSTRAINT `fk_loganalyticsevent_syscustomer`
        FOREIGN KEY (`sys_customer_id`) REFERENCES `sys_customer` (`sys_customer_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Raw analytics events — page views, cart, checkout, search. Retention: 12 thang';
