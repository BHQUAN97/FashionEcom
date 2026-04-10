-- =============================================
-- Author:      Developer
-- Create date: 2026-04-10
-- Description: Bang chot ton kho daily — de tinh gia tri ton kho trung binh (turnover)
-- =============================================

CREATE TABLE IF NOT EXISTS `log_inventory_snapshot` (
    `log_inventory_snapshot_id`         CHAR(36) NOT NULL DEFAULT (UUID()) COMMENT 'PK — UUID',
    `cat_product_variant_id`            CHAR(36) NOT NULL COMMENT 'FK → cat_product_variant (SKU)',
    `inv_warehouse_id`                  CHAR(36) NOT NULL COMMENT 'FK → inv_warehouse (Kho)',
    `log_inventory_snapshot_available`  DECIMAL(18,4) NOT NULL DEFAULT 0 COMMENT 'Ton kha dung tai thoi diem chot',
    `log_inventory_snapshot_cost`       DECIMAL(22,4) NOT NULL DEFAULT 0 COMMENT 'Gia von tai thoi diem chot',
    `snapshot_date`                     DATE NOT NULL COMMENT 'Ngay chot',
    PRIMARY KEY (`log_inventory_snapshot_id`),
    UNIQUE INDEX `uix_loginventorysnapshot_variant_warehouse_date` (`cat_product_variant_id`, `inv_warehouse_id`, `snapshot_date`),
    INDEX `ix_loginventorysnapshot_snapshotdate` (`snapshot_date`),
    CONSTRAINT `fk_loginventorysnapshot_catproductvariant`
        FOREIGN KEY (`cat_product_variant_id`) REFERENCES `cat_product_variant` (`cat_product_variant_id`) ON DELETE CASCADE,
    CONSTRAINT `fk_loginventorysnapshot_invwarehouse`
        FOREIGN KEY (`inv_warehouse_id`) REFERENCES `inv_warehouse` (`inv_warehouse_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
COMMENT='Chot ton kho daily 00:05 — de tinh turnover rate. Retention: 6 thang';
