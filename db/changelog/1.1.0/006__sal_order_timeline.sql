-- =============================================
-- Author:      Claude Code
-- Create date: 2026-04-10
-- Description: Tao bang hanh trinh don hang theo thoi gian
-- =============================================

USE fashion_ecom;

CREATE TABLE sal_order_timeline (
    sal_order_timeline_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID timeline entry',
    sal_order_id CHAR(36) NOT NULL COMMENT 'FK don hang',
    sal_order_timeline_step TINYINT NOT NULL COMMENT 'Buoc timeline (0-6)',
    sal_order_timeline_status VARCHAR(30) NOT NULL COMMENT 'Trang thai text',
    sal_order_timeline_label VARCHAR(100) NOT NULL COMMENT 'Nhan hien thi',
    sal_order_timeline_note TEXT NULL COMMENT 'Ghi chu',
    sal_order_timeline_actor VARCHAR(100) NULL COMMENT 'Nguoi thuc hien (email hoac system)',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Thoi diem',
    CONSTRAINT fk_salordertimeline_salorder FOREIGN KEY (sal_order_id) REFERENCES sal_order(sal_order_id) ON DELETE CASCADE
) COMMENT 'Hanh trinh don hang theo thoi gian';

CREATE INDEX ix_salordertimeline_salorderid ON sal_order_timeline(sal_order_id);
