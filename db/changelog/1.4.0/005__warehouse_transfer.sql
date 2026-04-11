-- =============================================
-- Author:      FashionEcom
-- Create date: 2026-04-10
-- Description: Phieu dieu chuyen hang giua cac kho
-- =============================================

CREATE TABLE inv_warehouse_transfer (
    inv_warehouse_transfer_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID phieu dieu chuyen kho',
    inv_warehouse_transfer_code VARCHAR(20) NOT NULL COMMENT 'Ma phieu (VD: WTR-20260410-001)',
    inv_warehouse_from_id CHAR(36) NOT NULL COMMENT 'Kho xuat',
    inv_warehouse_to_id CHAR(36) NOT NULL COMMENT 'Kho nhan',
    inv_warehouse_transfer_status TINYINT NOT NULL DEFAULT 0 COMMENT '0: Draft, 1: Pending Pickup, 2: In Transit, 3: Received, 4: Partially Received, 5: Completed',
    inv_warehouse_transfer_reason VARCHAR(255) NULL COMMENT 'Ly do dieu chuyen',
    sys_user_id CHAR(36) NULL COMMENT 'Nguoi tao phieu',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngay tao',
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Ngay cap nhat'
) COMMENT 'Phieu dieu chuyen hang giua cac kho';

CREATE UNIQUE INDEX uix_invwarehousetransfer_code ON inv_warehouse_transfer(inv_warehouse_transfer_code);
CREATE INDEX ix_invwarehousetransfer_fromid ON inv_warehouse_transfer(inv_warehouse_from_id);
CREATE INDEX ix_invwarehousetransfer_toid ON inv_warehouse_transfer(inv_warehouse_to_id);

CREATE TABLE inv_warehouse_transfer_item (
    inv_warehouse_transfer_item_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID dong dieu chuyen',
    inv_warehouse_transfer_id CHAR(36) NOT NULL COMMENT 'Khoa ngoai phieu dieu chuyen',
    cat_product_variant_id CHAR(36) NOT NULL COMMENT 'Khoa ngoai Variant',
    inv_warehouse_transfer_item_qty DECIMAL(18,4) NOT NULL DEFAULT 0 COMMENT 'So luong dieu chuyen',
    inv_warehouse_transfer_item_received_qty DECIMAL(18,4) NOT NULL DEFAULT 0 COMMENT 'So luong thuc nhan',
    CONSTRAINT fk_invwarehousetransferitem_transfer FOREIGN KEY (inv_warehouse_transfer_id) REFERENCES inv_warehouse_transfer(inv_warehouse_transfer_id) ON DELETE CASCADE
) COMMENT 'Chi tiet dong dieu chuyen kho';

CREATE INDEX ix_invwarehousetransferitem_transferid ON inv_warehouse_transfer_item(inv_warehouse_transfer_id);
