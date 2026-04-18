# FashionEcom ERD

> Source of truth: `backend/src/modules/*/entities/*.entity.ts`. ERD la derived view, update cung commit khi sua entity. Ref: CROSS-0007

**Tong**: 63 entities, 21 modules
**Last sync**: 2026-04-18

## Module: Auth & Users

```mermaid
erDiagram
    USER ||--o{ REFRESH_TOKEN : issues
    USER ||--o{ PASSWORD_HISTORY : keeps
    USER ||--o| CUSTOMER : "is (role=0)"
    CUSTOMER ||--o{ CUSTOMER_ADDRESS : owns
    USER {
        char36 sys_user_id PK
        varchar sys_user_email UK
        tinyint sys_user_role
        tinyint sys_user_status
    }
    REFRESH_TOKEN {
        char36 sys_refresh_token_id PK
        char36 sys_user_id FK
        varchar sys_refresh_token_hash
        datetime sys_refresh_token_expires
    }
    PASSWORD_HISTORY {
        char36 sys_password_history_id PK
        char36 sys_user_id FK
        varchar sys_password_history_hash
    }
    CUSTOMER {
        char36 sys_customer_id PK
        char36 sys_user_id FK
        varchar sys_customer_mobile
        decimal sys_customer_loyalty_point
        tinyint sys_customer_tier
    }
    CUSTOMER_ADDRESS {
        char36 sys_customer_address_id PK
        char36 sys_customer_id FK
        varchar sys_customer_address_phone
        tinyint sys_customer_address_is_default
    }
```

## Module: Catalog (Products + Categories + Attributes)

```mermaid
erDiagram
    CATEGORY ||--o{ CATEGORY : parent
    CATEGORY ||--o{ PRODUCT : contains
    PRODUCT ||--o{ PRODUCT_VARIANT : has
    PRODUCT ||--o{ PRODUCT_MEDIA : "has gallery"
    PRODUCT_VARIANT }o--o| COLOR : "color FK"
    PRODUCT_VARIANT }o--o| SIZE : "size FK"
    SIZE_GROUP ||--o{ SIZE : groups
    CATEGORY {
        char36 cat_category_id PK
        char36 cat_category_parent_id FK
        varchar cat_category_code
        varchar cat_category_slug
    }
    PRODUCT {
        char36 cat_product_id PK
        char36 cat_category_id FK
        varchar cat_product_code
        varchar cat_product_slug
        tinyint cat_product_status
    }
    PRODUCT_VARIANT {
        char36 cat_product_variant_id PK
        char36 cat_product_id FK
        char36 cat_color_id FK
        char36 cat_size_id FK
        varchar cat_product_variant_sku UK
        decimal cat_product_variant_price
    }
    PRODUCT_MEDIA {
        char36 cat_product_media_id PK
        char36 cat_product_id FK
        char36 cat_product_variant_id FK
        varchar cat_product_media_path
    }
    COLOR {
        char36 cat_color_id PK
        varchar cat_color_name
        varchar cat_color_hex
    }
    SIZE_GROUP {
        char36 cat_size_group_id PK
        varchar cat_size_group_name
    }
    SIZE {
        char36 cat_size_id PK
        char36 cat_size_group_id FK
        varchar cat_size_value
    }
    MEDIA {
        char36 sys_media_id PK
        varchar sys_media_path
        char36 sys_user_id FK
    }
```

## Module: Order & Payment

```mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--o{ ORDER_ITEM : "contains lines"
    ORDER ||--o{ ORDER_TIMELINE : tracks
    ORDER ||--o{ PAYMENT : settled_by
    ORDER ||--o{ SHIPPING_INCIDENT : "may have"
    ORDER_ITEM }o--|| PRODUCT_VARIANT : "of variant"
    ORDER {
        char36 sal_order_id PK
        varchar sal_order_code
        char36 sys_customer_id FK
        decimal sal_order_total
        tinyint sal_order_status
        tinyint sal_order_payment_status
        tinyint sal_order_shipping_status
    }
    ORDER_ITEM {
        char36 sal_order_item_id PK
        char36 sal_order_id FK
        char36 cat_product_variant_id FK
        decimal sal_order_item_qty
        decimal sal_order_item_price
    }
    ORDER_TIMELINE {
        char36 sal_order_timeline_id PK
        char36 sal_order_id FK
        tinyint sal_order_timeline_step
        varchar sal_order_timeline_status
    }
    PAYMENT {
        char36 sal_payment_id PK
        char36 sal_order_id FK
        tinyint sal_payment_method
        decimal sal_payment_amount
        tinyint sal_payment_status
        varchar sal_payment_proof_image
    }
    PAYMENT_METHOD_CONFIG {
        char36 sal_payment_method_config_id PK
        tinyint sal_payment_method_config_method
        varchar sal_payment_method_config_qr_image
        varchar sal_payment_method_config_account_number
    }
    SHIPPING_CONFIG {
        char36 sal_shipping_config_id PK
        varchar sal_shipping_config_provider
        decimal sal_shipping_config_flat_rate
        decimal sal_shipping_config_actual_cost
    }
    SHIPPING_INCIDENT {
        char36 sal_shipping_incident_id PK
        char36 sal_order_id FK
        tinyint sal_shipping_incident_type
        decimal sal_shipping_incident_extra_cost
        decimal sal_shipping_incident_refund_amount
    }
```

## Module: Inventory & Suppliers

```mermaid
erDiagram
    WAREHOUSE ||--o{ INVENTORY_LEVEL : stocks
    WAREHOUSE ||--o{ INVENTORY_LOG : logs
    WAREHOUSE ||--o{ WAREHOUSE_TRANSFER : "from/to"
    WAREHOUSE_TRANSFER ||--o{ WAREHOUSE_TRANSFER_ITEM : contains
    INVENTORY_LEVEL }o--|| PRODUCT_VARIANT : "for variant"
    SUPPLIER ||--o{ PURCHASE_ORDER : supplies
    PURCHASE_ORDER ||--o{ PURCHASE_ORDER_ITEM : contains
    PURCHASE_ORDER ||--o{ GOODS_RECEIPT : "received as"
    GOODS_RECEIPT ||--o{ GOODS_RECEIPT_ITEM : contains
    WAREHOUSE {
        char36 inv_warehouse_id PK
        varchar inv_warehouse_code
        varchar inv_warehouse_name
    }
    INVENTORY_LEVEL {
        char36 inv_inventory_level_id PK
        char36 cat_product_variant_id FK
        char36 inv_warehouse_id FK
        decimal inv_inventory_level_available
        decimal inv_inventory_level_locked
    }
    INVENTORY_LOG {
        char36 inv_inventory_log_id PK
        char36 cat_product_variant_id FK
        char36 inv_warehouse_id FK
        decimal inv_inventory_log_qty
        varchar inv_inventory_log_type
    }
    WAREHOUSE_TRANSFER {
        char36 inv_warehouse_transfer_id PK
        char36 inv_warehouse_from_id FK
        char36 inv_warehouse_to_id FK
        tinyint inv_warehouse_transfer_status
    }
    WAREHOUSE_TRANSFER_ITEM {
        char36 inv_warehouse_transfer_item_id PK
        char36 inv_warehouse_transfer_id FK
        char36 cat_product_variant_id FK
        decimal inv_warehouse_transfer_item_qty
    }
    SUPPLIER {
        char36 inv_supplier_id PK
        varchar inv_supplier_code
        varchar inv_supplier_name
    }
    PURCHASE_ORDER {
        char36 inv_purchase_order_id PK
        char36 inv_supplier_id FK
        char36 inv_warehouse_id FK
        tinyint inv_purchase_order_status
        decimal inv_purchase_order_total
    }
    PURCHASE_ORDER_ITEM {
        char36 inv_purchase_order_item_id PK
        char36 inv_purchase_order_id FK
        char36 cat_product_variant_id FK
        decimal inv_purchase_order_item_qty
        decimal inv_purchase_order_item_unit_cost
    }
    GOODS_RECEIPT {
        char36 inv_goods_receipt_id PK
        char36 inv_purchase_order_id FK
        char36 inv_warehouse_id FK
        varchar inv_goods_receipt_code
    }
    GOODS_RECEIPT_ITEM {
        char36 inv_goods_receipt_item_id PK
        char36 inv_goods_receipt_id FK
        char36 cat_product_variant_id FK
        decimal inv_goods_receipt_item_qty
    }
```

## Module: Promotions (Discount + Flash Sale + Sale Campaign)

```mermaid
erDiagram
    DISCOUNT_CODE ||--o{ DISCOUNT_USAGE : "tracked by"
    DISCOUNT_USAGE }o--|| ORDER : "applied on"
    DISCOUNT_USAGE }o--|| CUSTOMER : "by customer"
    FLASH_SALE ||--o{ FLASH_SALE_ITEM : contains
    FLASH_SALE_ITEM }o--|| PRODUCT : "for product"
    FLASH_SALE_ITEM }o--o| PRODUCT_VARIANT : "for variant"
    SALE_CAMPAIGN ||--o{ SALE_CAMPAIGN_VARIANT : contains
    SALE_CAMPAIGN_VARIANT }o--|| PRODUCT_VARIANT : "for variant"
    DISCOUNT_CODE {
        char36 prm_discount_id PK
        varchar prm_discount_code
        tinyint prm_discount_type
        decimal prm_discount_value
        tinyint prm_discount_status
    }
    DISCOUNT_USAGE {
        char36 prm_discount_usage_id PK
        char36 prm_discount_id FK
        char36 sys_customer_id FK
        char36 sal_order_id FK
        decimal prm_discount_usage_amount
    }
    FLASH_SALE {
        char36 prm_flash_sale_id PK
        varchar prm_flash_sale_title
        datetime prm_flash_sale_start_date
        datetime prm_flash_sale_end_date
    }
    FLASH_SALE_ITEM {
        char36 prm_flash_sale_item_id PK
        char36 prm_flash_sale_id FK
        char36 cat_product_id FK
        char36 cat_product_variant_id FK
        decimal prm_flash_sale_item_discount_pct
        int prm_flash_sale_item_max_qty
    }
    SALE_CAMPAIGN {
        char36 prm_sale_campaign_id PK
        varchar prm_sale_campaign_name
        datetime prm_sale_campaign_start_date
        datetime prm_sale_campaign_end_date
        tinyint prm_sale_campaign_status
    }
    SALE_CAMPAIGN_VARIANT {
        char36 prm_sale_campaign_variant_id PK
        char36 prm_sale_campaign_id FK
        char36 cat_product_variant_id FK
        decimal prm_sale_cv_sale_price
    }
```

## Module: Returns (RMA)

```mermaid
erDiagram
    ORDER ||--o{ RETURN_REQUEST : "may return"
    RETURN_REQUEST ||--o{ RETURN_REQUEST_ITEM : contains
    RETURN_REQUEST ||--o{ RETURN_REQUEST_MEDIA : "has photos"
    RETURN_REQUEST_ITEM }o--|| ORDER_ITEM : "ref item"
    RETURN_REQUEST_ITEM }o--|| PRODUCT_VARIANT : "of variant"
    RETURN_REQUEST }o--|| CUSTOMER : "by customer"
    RETURN_REQUEST {
        char36 sal_return_request_id PK
        varchar sal_return_request_code
        char36 sal_order_id FK
        char36 sys_customer_id FK
        tinyint sal_return_request_type
        tinyint sal_return_request_status
        decimal sal_return_request_refund_amount
    }
    RETURN_REQUEST_ITEM {
        char36 sal_return_request_item_id PK
        char36 sal_return_request_id FK
        char36 sal_order_item_id FK
        char36 cat_product_variant_id FK
        decimal sal_return_request_item_qty
    }
    RETURN_REQUEST_MEDIA {
        char36 sal_return_request_media_id PK
        char36 sal_return_request_id FK
        varchar sal_return_request_media_path
    }
```

## Module: Loyalty & Reviews

```mermaid
erDiagram
    CUSTOMER ||--o{ LOYALTY_TRANSACTION : earns
    CUSTOMER ||--o{ REVIEW : writes
    PRODUCT ||--o{ REVIEW : "reviewed by"
    ORDER_ITEM ||--o| REVIEW : "produces"
    LOYALTY_CONFIG {
        char36 prm_loyalty_config_id PK
        decimal prm_loyalty_config_earn_rate
        decimal prm_loyalty_config_redeem_rate
        decimal prm_loyalty_config_silver_threshold
        decimal prm_loyalty_config_gold_threshold
    }
    LOYALTY_TRANSACTION {
        char36 prm_loyalty_transaction_id PK
        char36 sys_customer_id FK
        tinyint prm_loyalty_transaction_type
        decimal prm_loyalty_transaction_points
        decimal prm_loyalty_transaction_balance
    }
    REVIEW {
        char36 sal_review_id PK
        char36 cat_product_id FK
        char36 sal_order_item_id FK
        char36 sys_customer_id FK
        tinyint sal_review_rating
        tinyint sal_review_status
    }
```

## Module: CMS / Layout

```mermaid
erDiagram
    MENU ||--o{ MENU_ITEM : contains
    MENU_ITEM ||--o{ MENU_ITEM : parent
    LAYOUT_SECTION {
        char36 cms_layout_section_id PK
        varchar cms_layout_section_page
        varchar cms_layout_section_type
        json cms_layout_section_config
    }
    BANNER {
        char36 cms_banner_id PK
        varchar cms_banner_image_desktop
        varchar cms_banner_image_mobile
        char36 cms_banner_ab_group_id
    }
    MENU {
        char36 cms_menu_id PK
        varchar cms_menu_type
        varchar cms_menu_name
    }
    MENU_ITEM {
        char36 cms_menu_item_id PK
        char36 cms_menu_id FK
        char36 cms_menu_item_parent_id FK
        varchar cms_menu_item_label
    }
    THEME_CONFIG {
        char36 cms_theme_config_id PK
        varchar cms_theme_config_key
        varchar cms_theme_config_group
    }
    EMAIL_TEMPLATE {
        char36 cms_email_template_id PK
        varchar cms_email_template_key
        varchar cms_email_template_subject
    }
    PAGE {
        char36 cms_page_id PK
        varchar cms_page_slug UK
        varchar cms_page_title
    }
```

## Module: Notifications & Push

```mermaid
erDiagram
    CUSTOMER ||--o{ NOTIFICATION : receives
    CUSTOMER ||--o{ PUSH_SUBSCRIPTION : "subscribes via"
    USER ||--o{ ADMIN_NOTIFICATION : receives
    NOTIFICATION {
        char36 sys_notification_id PK
        char36 sys_customer_id FK
        varchar sys_notification_type
        tinyint sys_notification_channel
        tinyint sys_notification_status
    }
    PUSH_SUBSCRIPTION {
        char36 sys_push_subscription_id PK
        char36 sys_customer_id FK
        varchar sys_push_subscription_endpoint
    }
    ADMIN_NOTIFICATION {
        char36 sys_admin_notification_id PK
        char36 sys_user_id FK
        varchar sys_admin_notification_type
        tinyint sys_admin_notification_read
    }
```

## Module: Analytics & Reports

```mermaid
erDiagram
    CUSTOMER ||--o{ ANALYTICS_EVENT : "may trigger"
    CUSTOMER ||--o| CUSTOMER_RFM : scored
    PRODUCT_VARIANT ||--o{ INVENTORY_SNAPSHOT : "snapshot daily"
    ANALYTICS_EVENT {
        char36 log_analytics_event_id PK
        varchar log_analytics_event_type
        char36 sys_customer_id FK
        varchar log_analytics_event_session_id
    }
    CUSTOMER_RFM {
        char36 log_customer_rfm_id PK
        char36 sys_customer_id FK
        decimal log_customer_rfm_recency
        decimal log_customer_rfm_frequency
        decimal log_customer_rfm_monetary
        varchar log_customer_rfm_segment
    }
    INVENTORY_SNAPSHOT {
        char36 log_inventory_snapshot_id PK
        char36 cat_product_variant_id FK
        char36 inv_warehouse_id FK
        decimal log_inventory_snapshot_available
        date snapshot_date
    }
    PAYMENT_FEE_CONFIG {
        char36 log_payment_fee_config_id PK
        tinyint log_payment_fee_config_payment_type
        decimal log_payment_fee_config_rate
        date effective_from
    }
```

## Module: Logs & Audit & Security

```mermaid
erDiagram
    USER ||--o{ ACCESS_LOG : "auth attempts"
    USER ||--o{ AUDIT_LOG : performs
    USER ||--o{ SYSTEM_LOG : "may trigger"
    ACCESS_LOG {
        char36 log_access_id PK
        char36 sys_user_id FK
        varchar log_access_email
        tinyint log_access_success
        varchar log_access_ip
    }
    AUDIT_LOG {
        char36 log_audit_id PK
        char36 sys_user_id FK
        varchar log_audit_action
        varchar log_audit_entity_type
        char36 log_audit_entity_id
    }
    SYSTEM_LOG {
        char36 log_system_id PK
        varchar log_system_level
        varchar log_system_method
        varchar log_system_url
        smallint log_system_status
        int log_system_duration
    }
```

## Module: Settings / Integrations / Guides

```mermaid
erDiagram
    SYNC_CONFIG ||--o{ IMPORT_JOB : "fires job"
    USER ||--o{ GUIDE_TOUR_COMPLETION : completed
    SETTING {
        char36 sys_setting_id PK
        varchar sys_setting_group
        varchar sys_setting_key
        text sys_setting_value
    }
    SYNC_CONFIG {
        char36 sys_sync_config_id PK
        varchar sys_sync_config_type
        varchar sys_sync_config_target
        tinyint sys_sync_config_auto_sync
    }
    IMPORT_JOB {
        char36 sys_import_job_id PK
        char36 sys_sync_config_id FK
        varchar sys_import_job_status
        int sys_import_job_total_rows
        int sys_import_job_errors
    }
    GUIDE_TOUR {
        char36 sys_guide_tour_id PK
        varchar sys_guide_tour_screen_id
        json sys_guide_tour_roles
        json sys_guide_tour_steps
    }
    GUIDE_TOUR_COMPLETION {
        char36 sys_guide_tour_completion_id PK
        char36 sys_user_id FK
        varchar sys_guide_tour_screen_id
    }
```

## Cross-module relationships (tom tat)

- `ORDER.sys_customer_id` → CUSTOMER (Auth)
- `ORDER_ITEM.cat_product_variant_id` → PRODUCT_VARIANT (Catalog)
- `INVENTORY_LEVEL.cat_product_variant_id` → PRODUCT_VARIANT
- `PURCHASE_ORDER_ITEM.cat_product_variant_id` → PRODUCT_VARIANT
- `WAREHOUSE_TRANSFER_ITEM.cat_product_variant_id` → PRODUCT_VARIANT
- `DISCOUNT_USAGE.sal_order_id` → ORDER, `.sys_customer_id` → CUSTOMER
- `FLASH_SALE_ITEM.cat_product_id` → PRODUCT, `.cat_product_variant_id` → PRODUCT_VARIANT
- `SALE_CAMPAIGN_VARIANT.cat_product_variant_id` → PRODUCT_VARIANT
- `RETURN_REQUEST.sal_order_id` → ORDER, `.sys_customer_id` → CUSTOMER
- `RETURN_REQUEST_ITEM.sal_order_item_id` → ORDER_ITEM
- `REVIEW.cat_product_id` → PRODUCT, `.sal_order_item_id` → ORDER_ITEM, `.sys_customer_id` → CUSTOMER
- `LOYALTY_TRANSACTION.sys_customer_id` → CUSTOMER
- `INVENTORY_SNAPSHOT.cat_product_variant_id` → PRODUCT_VARIANT, `.inv_warehouse_id` → WAREHOUSE
- `CUSTOMER_RFM.sys_customer_id` → CUSTOMER
- `SHIPPING_INCIDENT.sal_order_id` → ORDER

## Conventions

- Tat ca PK la `char(36)` UUID (sinh boi MySQL `UUID()`).
- Prefix bang theo domain:
  - `sys_*` — auth, user, customer, settings, notifications, media
  - `cat_*` — catalog (product, category, color, size)
  - `inv_*` — inventory, supplier, warehouse
  - `sal_*` — sales (order, payment, shipping, review, return)
  - `prm_*` — promotions (discount, flash sale, sale campaign, loyalty)
  - `cms_*` — content management (banner, menu, page, theme, email)
  - `log_*` — analytics, audit, access, system, RFM, snapshot
- Audit columns chuan: `created_date`, `modified_date` / `updated_date`.
- Status: tinyint enum (0=inactive/draft, 1=active, ...)
