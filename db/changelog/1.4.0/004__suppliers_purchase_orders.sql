-- =============================================
-- Author:      FashionEcom
-- Create date: 2026-04-10
-- Description: Nha cung cap, lien ket NCC-SP, Don dat hang NCC, Phieu nhap kho
-- =============================================

CREATE TABLE inv_supplier (
    inv_supplier_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID nha cung cap',
    inv_supplier_code VARCHAR(20) NOT NULL COMMENT 'Ma NCC (VD: NCC-001)',
    inv_supplier_name VARCHAR(255) NOT NULL COMMENT 'Ten NCC',
    inv_supplier_tax_code VARCHAR(50) NULL COMMENT 'Ma so thue',
    inv_supplier_address VARCHAR(255) NULL COMMENT 'Dia chi',
    inv_supplier_contact_name VARCHAR(100) NULL COMMENT 'Nguoi lien he',
    inv_supplier_phone VARCHAR(50) NULL COMMENT 'SDT lien he',
    inv_supplier_email VARCHAR(100) NULL COMMENT 'Email lien he',
    inv_supplier_payment_terms VARCHAR(50) NULL COMMENT 'Dieu khoan TT (Net 30, COD...)',
    inv_supplier_status TINYINT NOT NULL DEFAULT 1 COMMENT '0: Ngung hop tac, 1: Dang hop tac',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngay tao',
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Ngay cap nhat'
) COMMENT 'Danh sach Nha cung cap';

CREATE UNIQUE INDEX uix_invsupplier_code ON inv_supplier(inv_supplier_code);

CREATE TABLE inv_supplier_product (
    inv_supplier_product_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID lien ket NCC-SP',
    inv_supplier_id CHAR(36) NOT NULL COMMENT 'Khoa ngoai NCC',
    cat_product_variant_id CHAR(36) NOT NULL COMMENT 'Khoa ngoai Variant',
    inv_supplier_product_sku VARCHAR(50) NULL COMMENT 'Ma SKU cua NCC',
    inv_supplier_product_cost DECIMAL(22,4) NOT NULL DEFAULT 0 COMMENT 'Gia mua tu NCC',
    inv_supplier_product_lead_days DECIMAL(18,4) NOT NULL DEFAULT 0 COMMENT 'So ngay giao hang trung binh',
    inv_supplier_product_is_primary TINYINT NOT NULL DEFAULT 0 COMMENT '1: NCC mac dinh cho variant nay',
    CONSTRAINT fk_invsupplierproduct_invsupplier FOREIGN KEY (inv_supplier_id) REFERENCES inv_supplier(inv_supplier_id) ON DELETE CASCADE,
    CONSTRAINT fk_invsupplierproduct_variant FOREIGN KEY (cat_product_variant_id) REFERENCES cat_product_variant(cat_product_variant_id) ON DELETE RESTRICT
) COMMENT 'Lien ket NCC voi Variant san pham';

CREATE INDEX ix_invsupplierproduct_invsupplierid ON inv_supplier_product(inv_supplier_id);
CREATE INDEX ix_invsupplierproduct_variantid ON inv_supplier_product(cat_product_variant_id);
CREATE UNIQUE INDEX uix_invsupplierproduct_supplier_variant ON inv_supplier_product(inv_supplier_id, cat_product_variant_id);

CREATE TABLE inv_purchase_order (
    inv_purchase_order_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID Don dat hang NCC',
    inv_purchase_order_code VARCHAR(20) NOT NULL COMMENT 'Ma PO (VD: PO-20260410-001)',
    inv_supplier_id CHAR(36) NOT NULL COMMENT 'Khoa ngoai NCC',
    inv_warehouse_id CHAR(36) NOT NULL COMMENT 'Kho nhan hang',
    inv_purchase_order_status TINYINT NOT NULL DEFAULT 0 COMMENT '0: Draft, 1: Pending Approval, 2: Ordered, 3: Partially Received, 4: Received, 5: Completed, 6: Cancelled',
    inv_purchase_order_total DECIMAL(22,4) NOT NULL DEFAULT 0 COMMENT 'Tong gia tri PO',
    inv_purchase_order_shipping_cost DECIMAL(22,4) NOT NULL DEFAULT 0 COMMENT 'Chi phi van chuyen lo hang',
    inv_purchase_order_notes TEXT NULL COMMENT 'Ghi chu',
    inv_purchase_order_expected_date DATE NULL COMMENT 'Ngay du kien nhan hang',
    inv_purchase_order_tracking_number VARCHAR(100) NULL COMMENT 'Ma van don (neu co)',
    sys_user_id CHAR(36) NULL COMMENT 'Nguoi tao PO',
    sys_user_approved_id CHAR(36) NULL COMMENT 'Nguoi duyet PO',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngay tao',
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Ngay cap nhat'
) COMMENT 'Don dat hang tu Nha cung cap (Purchase Order)';

CREATE UNIQUE INDEX uix_invpurchaseorder_code ON inv_purchase_order(inv_purchase_order_code);
CREATE INDEX ix_invpurchaseorder_invsupplierid ON inv_purchase_order(inv_supplier_id);
CREATE INDEX ix_invpurchaseorder_status ON inv_purchase_order(inv_purchase_order_status);

CREATE TABLE inv_purchase_order_item (
    inv_purchase_order_item_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID dong PO',
    inv_purchase_order_id CHAR(36) NOT NULL COMMENT 'Khoa ngoai PO',
    cat_product_variant_id CHAR(36) NOT NULL COMMENT 'Khoa ngoai Variant',
    inv_purchase_order_item_qty DECIMAL(18,4) NOT NULL DEFAULT 0 COMMENT 'So luong dat',
    inv_purchase_order_item_received_qty DECIMAL(18,4) NOT NULL DEFAULT 0 COMMENT 'So luong da nhan',
    inv_purchase_order_item_unit_cost DECIMAL(22,4) NOT NULL DEFAULT 0 COMMENT 'Don gia mua',
    inv_purchase_order_item_supplier_sku VARCHAR(50) NULL COMMENT 'Ma SKU NCC',
    CONSTRAINT fk_invpurchaseorderitem_invpurchaseorder FOREIGN KEY (inv_purchase_order_id) REFERENCES inv_purchase_order(inv_purchase_order_id) ON DELETE CASCADE,
    CONSTRAINT fk_invpurchaseorderitem_variant FOREIGN KEY (cat_product_variant_id) REFERENCES cat_product_variant(cat_product_variant_id) ON DELETE RESTRICT
) COMMENT 'Chi tiet dong san pham trong PO';

CREATE INDEX ix_invpurchaseorderitem_poid ON inv_purchase_order_item(inv_purchase_order_id);
CREATE INDEX ix_invpurchaseorderitem_variantid ON inv_purchase_order_item(cat_product_variant_id);

CREATE TABLE inv_goods_receipt (
    inv_goods_receipt_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID phieu nhap kho',
    inv_purchase_order_id CHAR(36) NOT NULL COMMENT 'Khoa ngoai PO',
    inv_warehouse_id CHAR(36) NOT NULL COMMENT 'Kho nhan hang',
    inv_goods_receipt_code VARCHAR(20) NOT NULL COMMENT 'Ma phieu nhap (VD: GRN-20260410-001)',
    inv_goods_receipt_notes TEXT NULL COMMENT 'Ghi chu',
    sys_user_id CHAR(36) NULL COMMENT 'Nguoi nhap kho',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngay nhap',
    CONSTRAINT fk_invgoodsreceipt_po FOREIGN KEY (inv_purchase_order_id) REFERENCES inv_purchase_order(inv_purchase_order_id) ON DELETE RESTRICT
) COMMENT 'Phieu nhap kho tu PO';

CREATE UNIQUE INDEX uix_invgoodsreceipt_code ON inv_goods_receipt(inv_goods_receipt_code);
CREATE INDEX ix_invgoodsreceipt_poid ON inv_goods_receipt(inv_purchase_order_id);

CREATE TABLE inv_goods_receipt_item (
    inv_goods_receipt_item_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID dong phieu nhap',
    inv_goods_receipt_id CHAR(36) NOT NULL COMMENT 'Khoa ngoai phieu nhap',
    cat_product_variant_id CHAR(36) NOT NULL COMMENT 'Khoa ngoai Variant',
    inv_goods_receipt_item_qty DECIMAL(18,4) NOT NULL DEFAULT 0 COMMENT 'So luong thuc nhan',
    inv_goods_receipt_item_unit_cost DECIMAL(22,4) NOT NULL DEFAULT 0 COMMENT 'Don gia thuc te',
    inv_goods_receipt_item_notes VARCHAR(255) NULL COMMENT 'Ghi chu dong (VD: 5 cai loi)',
    CONSTRAINT fk_invgoodsreceiptitem_receipt FOREIGN KEY (inv_goods_receipt_id) REFERENCES inv_goods_receipt(inv_goods_receipt_id) ON DELETE CASCADE
) COMMENT 'Chi tiet dong phieu nhap kho';

CREATE INDEX ix_invgoodsreceiptitem_receiptid ON inv_goods_receipt_item(inv_goods_receipt_id);
