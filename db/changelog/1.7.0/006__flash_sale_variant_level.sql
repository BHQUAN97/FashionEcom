-- =============================================
-- Author:      Claude Code
-- Create date: 2026-04-15
-- Description: Nang cap flash sale — them variant-level pricing
--              Them cat_product_variant_id vao flash_sale_item (optional)
--              Neu NULL = ap dung cho tat ca variant cua product
-- =============================================

USE fashion_ecom;

ALTER TABLE prm_flash_sale_item
    ADD COLUMN cat_product_variant_id CHAR(36) NULL
        COMMENT 'FK variant cu the. NULL = ap dung tat ca variant cua product'
        AFTER cat_product_id,
    ADD COLUMN prm_flash_sale_item_sale_price DECIMAL(22,4) NULL
        COMMENT 'Gia sale co dinh (override discount_pct). NULL = tinh tu %'
        AFTER prm_flash_sale_item_discount_pct;

CREATE INDEX ix_prmflashsaleitem_variantid ON prm_flash_sale_item(cat_product_variant_id);
