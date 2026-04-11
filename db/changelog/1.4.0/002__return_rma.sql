-- =============================================
-- Author:      FashionEcom
-- Create date: 2026-04-10
-- Description: Bang yeu cau doi tra hang (RMA) — state machine
-- =============================================

CREATE TABLE sal_return_request (
    sal_return_request_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID yeu cau doi tra',
    sal_return_request_code VARCHAR(20) NOT NULL COMMENT 'Ma RMA hien thi (VD: RMA-20260410-001)',
    sal_order_id CHAR(36) NOT NULL COMMENT 'Khoa ngoai tro toi Don hang goc',
    sys_customer_id CHAR(36) NOT NULL COMMENT 'Khoa ngoai tro toi Khach hang',
    sal_return_request_type TINYINT NOT NULL DEFAULT 0 COMMENT 'Loai: 0: Doi hang, 1: Hoan tien, 2: Doi size',
    sal_return_request_reason TINYINT NOT NULL DEFAULT 0 COMMENT 'Ly do: 0: Loi hang, 1: Sai SP, 2: Khong vua, 3: Doi y, 4: Khac',
    sal_return_request_reason_detail VARCHAR(500) NULL COMMENT 'Mo ta chi tiet ly do',
    sal_return_request_status TINYINT NOT NULL DEFAULT 0 COMMENT 'Trang thai: 0: Requested, 1: Reviewing, 2: Approved, 3: Rejected, 4: Refunding, 5: Refunded, 6: Exchanging, 7: Exchanged',
    sal_return_request_refund_amount DECIMAL(22,4) NOT NULL DEFAULT 0 COMMENT 'So tien hoan (neu type=refund)',
    sal_return_request_staff_notes TEXT NULL COMMENT 'Ghi chu noi bo (KH khong thay)',
    sal_return_request_customer_notes TEXT NULL COMMENT 'Ghi chu tu KH',
    sys_user_id CHAR(36) NULL COMMENT 'Nhan vien xu ly',
    sal_exchange_order_id CHAR(36) NULL COMMENT 'Don hang moi (neu type=exchange)',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngay tao yeu cau',
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Ngay cap nhat cuoi',
    CONSTRAINT fk_salreturnrequest_salorder FOREIGN KEY (sal_order_id) REFERENCES sal_order(sal_order_id) ON DELETE RESTRICT,
    CONSTRAINT fk_salreturnrequest_syscustomer FOREIGN KEY (sys_customer_id) REFERENCES sys_customer(sys_customer_id) ON DELETE RESTRICT
) COMMENT 'Yeu cau doi tra hang (RMA)';

CREATE UNIQUE INDEX uix_salreturnrequest_code ON sal_return_request(sal_return_request_code);
CREATE INDEX ix_salreturnrequest_salorderid ON sal_return_request(sal_order_id);
CREATE INDEX ix_salreturnrequest_syscustomerid ON sal_return_request(sys_customer_id);
CREATE INDEX ix_salreturnrequest_status ON sal_return_request(sal_return_request_status);

CREATE TABLE sal_return_request_item (
    sal_return_request_item_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID chi tiet RMA',
    sal_return_request_id CHAR(36) NOT NULL COMMENT 'Khoa ngoai tro toi RMA',
    sal_order_item_id CHAR(36) NOT NULL COMMENT 'Dong don hang goc',
    cat_product_variant_id CHAR(36) NOT NULL COMMENT 'Variant tra ve',
    sal_return_request_item_qty DECIMAL(18,4) NOT NULL DEFAULT 0 COMMENT 'So luong tra',
    sal_return_request_item_exchange_variant_id CHAR(36) NULL COMMENT 'Variant doi sang (neu exchange)',
    CONSTRAINT fk_salreturnrequestitem_salreturnrequest FOREIGN KEY (sal_return_request_id) REFERENCES sal_return_request(sal_return_request_id) ON DELETE CASCADE,
    CONSTRAINT fk_salreturnrequestitem_salorderitem FOREIGN KEY (sal_order_item_id) REFERENCES sal_order_item(sal_order_item_id) ON DELETE RESTRICT
) COMMENT 'Chi tiet san pham trong yeu cau doi tra';

CREATE INDEX ix_salreturnrequestitem_salreturnrequestid ON sal_return_request_item(sal_return_request_id);

CREATE TABLE sal_return_request_media (
    sal_return_request_media_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID anh minh chung RMA',
    sal_return_request_id CHAR(36) NOT NULL COMMENT 'Khoa ngoai tro toi RMA',
    sal_return_request_media_path VARCHAR(255) NOT NULL COMMENT 'Duong dan file',
    sal_return_request_media_type TINYINT NOT NULL DEFAULT 1 COMMENT '1: Image, 2: Video',
    CONSTRAINT fk_salreturnrequestmedia_salreturnrequest FOREIGN KEY (sal_return_request_id) REFERENCES sal_return_request(sal_return_request_id) ON DELETE CASCADE
) COMMENT 'Anh/video minh chung RMA';

CREATE INDEX ix_salreturnrequestmedia_salreturnrequestid ON sal_return_request_media(sal_return_request_id);
