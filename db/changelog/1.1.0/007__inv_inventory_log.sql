-- =============================================
-- Author:      Claude Code
-- Create date: 2026-04-10
-- Description: Tao bang lich su thay doi ton kho
-- =============================================

USE fashion_ecom;

CREATE TABLE inv_inventory_log (
    inv_inventory_log_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID log',
    cat_product_variant_id CHAR(36) NOT NULL COMMENT 'FK bien the',
    inv_warehouse_id CHAR(36) NOT NULL COMMENT 'FK kho',
    inv_inventory_log_qty DECIMAL(18,4) NOT NULL DEFAULT 0 COMMENT 'So luong thay doi (+ nhap, - xuat)',
    inv_inventory_log_type VARCHAR(20) NOT NULL COMMENT 'Loai: sale, return, adjustment, import',
    inv_inventory_log_reason VARCHAR(50) NULL COMMENT 'Ly do: import, damage, lost, correction, order',
    inv_inventory_log_note TEXT NULL COMMENT 'Ghi chu chi tiet',
    inv_inventory_log_ref_id CHAR(36) NULL COMMENT 'ID tham chieu (order_id, etc)',
    sys_user_id CHAR(36) NULL COMMENT 'Nguoi thuc hien (null = system)',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Thoi diem',
    CONSTRAINT fk_invinventorylog_catproductvariant FOREIGN KEY (cat_product_variant_id) REFERENCES cat_product_variant(cat_product_variant_id) ON DELETE RESTRICT,
    CONSTRAINT fk_invinventorylog_invwarehouse FOREIGN KEY (inv_warehouse_id) REFERENCES inv_warehouse(inv_warehouse_id) ON DELETE RESTRICT
) COMMENT 'Lich su thay doi ton kho';

CREATE INDEX ix_invinventorylog_catproductvariantid ON inv_inventory_log(cat_product_variant_id);
CREATE INDEX ix_invinventorylog_invwarehouseid ON inv_inventory_log(inv_warehouse_id);
CREATE INDEX ix_invinventorylog_createddate ON inv_inventory_log(created_date);
