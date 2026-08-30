-- Thiết lập Database với Charset và Collation chuẩn
CREATE DATABASE IF NOT EXISTS fashion_ecom
CHARACTER SET utf8mb4 
COLLATE utf8mb4_0900_ai_ci;

USE fashion_ecom;

-- ==============================================================================
-- PHÂN HỆ 1: SYSTEM (sys_) - Quản trị Hệ thống & Người dùng
-- ==============================================================================

CREATE TABLE sys_user (
    sys_user_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID toàn cục của User',
    sys_user_email VARCHAR(100) NOT NULL COMMENT 'Email đăng nhập hệ thống',
    sys_user_password VARCHAR(255) NOT NULL COMMENT 'Mật khẩu đã mã hóa',
    sys_user_role TINYINT NOT NULL DEFAULT 0 COMMENT 'Nghiệp vụ: 0: Khách hàng, 1: Admin, 2: Cửa hàng trưởng, 3: CSKH',
    sys_user_status TINYINT NOT NULL DEFAULT 1 COMMENT 'Trạng thái: 0: Khóa, 1: Hoạt động',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày giờ tạo tài khoản'
) COMMENT 'Danh sách tài khoản đăng nhập hệ thống';

CREATE UNIQUE INDEX uix_sysuser_sysuseremail ON sys_user(sys_user_email);

CREATE TABLE sys_customer (
    sys_customer_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID toàn cục của Khách hàng',
    sys_user_id CHAR(36) NOT NULL COMMENT 'Khóa ngoại trỏ tới tài khoản đăng nhập',
    sys_customer_name VARCHAR(100) NOT NULL COMMENT 'Họ và tên khách hàng',
    sys_customer_mobile VARCHAR(50) NOT NULL COMMENT 'Số điện thoại di động',
    sys_customer_dob DATE NULL COMMENT 'Ngày tháng năm sinh',
    sys_customer_loyalty_point DECIMAL(18,4) NOT NULL DEFAULT 0 COMMENT 'Tổng điểm thưởng Loyalty hiện có',
    sys_customer_tier TINYINT NOT NULL DEFAULT 1 COMMENT 'Phân hạng: 1: Member, 2: Silver, 3: Gold, 4: Platinum',
    CONSTRAINT fk_syscustomer_sysuser FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id) ON DELETE RESTRICT
) COMMENT 'Hồ sơ thông tin chi tiết Khách hàng';

CREATE INDEX ix_syscustomer_sysuserid ON sys_customer(sys_user_id);
CREATE UNIQUE INDEX uix_syscustomer_syscustomermobile ON sys_customer(sys_customer_mobile);


-- ==============================================================================
-- PHÂN HỆ 2: CATALOG (cat_) - Quản lý Sản phẩm & Media
-- ==============================================================================

CREATE TABLE cat_category (
    cat_category_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID toàn cục của Danh mục',
    cat_category_parent_id CHAR(36) NULL COMMENT 'Khóa ngoại trỏ về chính bảng này để tạo cấu trúc cây 3 cấp',
    cat_category_code VARCHAR(20) NOT NULL COMMENT 'Mã danh mục dùng cho SEO hoặc tìm kiếm nhanh',
    cat_category_name VARCHAR(255) NOT NULL COMMENT 'Tên danh mục (Ví dụ: Áo Sơ Mi Nam)',
    cat_category_status TINYINT NOT NULL DEFAULT 1 COMMENT 'Trạng thái: 0: Ẩn, 1: Hiển thị',
    CONSTRAINT fk_catcategory_parent FOREIGN KEY (cat_category_parent_id) REFERENCES cat_category(cat_category_id) ON DELETE RESTRICT
) COMMENT 'Danh mục phân loại sản phẩm đa cấp';

CREATE INDEX ix_catcategory_catcategoryparentid ON cat_category(cat_category_parent_id);
CREATE UNIQUE INDEX uix_catcategory_catcategorycode ON cat_category(cat_category_code);

CREATE TABLE cat_product (
    cat_product_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID toàn cục của Sản phẩm gốc',
    cat_category_id CHAR(36) NOT NULL COMMENT 'Khóa ngoại trỏ tới danh mục chính',
    cat_product_code VARCHAR(20) NOT NULL COMMENT 'Mã sản phẩm dùng nội bộ',
    cat_product_name VARCHAR(255) NOT NULL COMMENT 'Tên sản phẩm hiển thị trên Web',
    cat_product_description TEXT NULL COMMENT 'Mô tả chi tiết sản phẩm (Lưu HTML Rich Text)',
    cat_product_status TINYINT NOT NULL DEFAULT 1 COMMENT 'Trạng thái: 0: Nháp, 1: Đang bán, 2: Ẩn/Ngừng bán',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày giờ tạo sản phẩm',
    CONSTRAINT fk_catproduct_catcategory FOREIGN KEY (cat_category_id) REFERENCES cat_category(cat_category_id) ON DELETE RESTRICT
) COMMENT 'Danh mục Sản phẩm gốc (chưa phân loại màu/size)';

CREATE INDEX ix_catproduct_catcategoryid ON cat_product(cat_category_id);
CREATE UNIQUE INDEX uix_catproduct_catproductcode ON cat_product(cat_product_code);

CREATE TABLE cat_product_variant (
    cat_product_variant_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID toàn cục của Biến thể (SKU)',
    cat_product_id CHAR(36) NOT NULL COMMENT 'Khóa ngoại trỏ tới Sản phẩm gốc',
    cat_product_variant_sku VARCHAR(20) NOT NULL COMMENT 'Mã SKU thực tế của biến thể (Ví dụ: POLO-BLACK-XL)',
    cat_product_variant_color VARCHAR(50) NULL COMMENT 'Tên màu sắc (Ví dụ: Đen, Trắng)',
    cat_product_variant_size VARCHAR(50) NULL COMMENT 'Kích cỡ (Ví dụ: S, M, L, XL, 39, 40)',
    cat_product_variant_price DECIMAL(22,4) NOT NULL DEFAULT 0 COMMENT 'Giá bán lẻ hiện tại',
    cat_product_variant_cost DECIMAL(22,4) NOT NULL DEFAULT 0 COMMENT 'Giá vốn (Tính toán P&L)',
    cat_product_variant_weight DECIMAL(18,4) NOT NULL DEFAULT 0 COMMENT 'Trọng lượng (Grams) dùng tính phí vận chuyển',
    CONSTRAINT fk_catproductvariant_catproduct FOREIGN KEY (cat_product_id) REFERENCES cat_product(cat_product_id) ON DELETE RESTRICT
) COMMENT 'Danh sách Biến thể sản phẩm (SKU) thực tế giao dịch';

CREATE INDEX ix_catproductvariant_catproductid ON cat_product_variant(cat_product_id);
CREATE UNIQUE INDEX uix_catproductvariant_catproductvariantsku ON cat_product_variant(cat_product_variant_sku);

CREATE TABLE cat_product_media (
    cat_product_media_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID toàn cục của Media sản phẩm',
    cat_product_id CHAR(36) NOT NULL COMMENT 'Khóa ngoại trỏ tới Sản phẩm',
    cat_product_variant_id CHAR(36) NULL COMMENT 'Khóa ngoại Biến thể (NULL nếu là ảnh chung cho cả SP, có giá trị nếu là ảnh riêng của từng màu)',
    cat_product_media_path VARCHAR(255) NOT NULL COMMENT 'Đường dẫn thư mục vật lý (VD: /products/2024/05/abc.webp)',
    cat_product_media_type TINYINT NOT NULL DEFAULT 1 COMMENT 'Loại file: 1: Image, 2: Video',
    cat_product_media_sort DECIMAL(18,4) NOT NULL DEFAULT 0 COMMENT 'Thứ tự sắp xếp hiển thị trên Gallery',
    CONSTRAINT fk_catproductmedia_catproduct FOREIGN KEY (cat_product_id) REFERENCES cat_product(cat_product_id) ON DELETE CASCADE,
    CONSTRAINT fk_catproductmedia_catproductvariant FOREIGN KEY (cat_product_variant_id) REFERENCES cat_product_variant(cat_product_variant_id) ON DELETE CASCADE
) COMMENT 'Lưu trữ đường dẫn Hình ảnh, Video của Sản phẩm (Local Storage)';

CREATE INDEX ix_catproductmedia_catproductid ON cat_product_media(cat_product_id);
CREATE INDEX ix_catproductmedia_catproductvariantid ON cat_product_media(cat_product_variant_id);


-- ==============================================================================
-- PHÂN HỆ 3: INVENTORY (inv_) - Quản lý Tồn kho đa điểm
-- ==============================================================================

CREATE TABLE inv_warehouse (
    inv_warehouse_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID toàn cục của Kho hàng/Cửa hàng',
    inv_warehouse_code VARCHAR(20) NOT NULL COMMENT 'Mã kho (Ví dụ: KHO-HCM-01)',
    inv_warehouse_name VARCHAR(255) NOT NULL COMMENT 'Tên gọi Kho hoặc Cửa hàng vật lý',
    inv_warehouse_address VARCHAR(255) NULL COMMENT 'Địa chỉ chi tiết của điểm lưu trữ',
    inv_warehouse_status TINYINT NOT NULL DEFAULT 1 COMMENT 'Trạng thái: 0: Đóng cửa, 1: Đang hoạt động'
) COMMENT 'Danh sách Kho chứa hàng và Cửa hàng Offline';

CREATE UNIQUE INDEX uix_invwarehouse_invwarehousecode ON inv_warehouse(inv_warehouse_code);

CREATE TABLE inv_inventory_level (
    inv_inventory_level_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID toàn cục dòng Tồn kho',
    cat_product_variant_id CHAR(36) NOT NULL COMMENT 'Khóa ngoại trỏ tới Biến thể SKU',
    inv_warehouse_id CHAR(36) NOT NULL COMMENT 'Khóa ngoại trỏ tới Kho chứa',
    inv_inventory_level_available DECIMAL(18,4) NOT NULL DEFAULT 0 COMMENT 'Tồn khả dụng (Số lượng có thể bán ngay lập tức)',
    inv_inventory_level_locked DECIMAL(18,4) NOT NULL DEFAULT 0 COMMENT 'Tồn đang khóa (Khách đã lên đơn nhưng chưa đóng gói/xuất kho)',
    CONSTRAINT fk_invinventorylevel_catproductvariant FOREIGN KEY (cat_product_variant_id) REFERENCES cat_product_variant(cat_product_variant_id) ON DELETE RESTRICT,
    CONSTRAINT fk_invinventorylevel_invwarehouse FOREIGN KEY (inv_warehouse_id) REFERENCES inv_warehouse(inv_warehouse_id) ON DELETE RESTRICT
) COMMENT 'Bảng chốt số Tồn kho của từng SKU tại từng Kho cụ thể';

-- Index cực kỳ quan trọng để chống bán vượt tồn kho và tra cứu nhanh
CREATE INDEX ix_invinventorylevel_invwarehouseid ON inv_inventory_level(inv_warehouse_id);
CREATE UNIQUE INDEX uix_invinventorylevel_catproductvariantid_invwarehouseid ON inv_inventory_level(cat_product_variant_id, inv_warehouse_id);


-- ==============================================================================
-- PHÂN HỆ 4: SALES (sal_) - Đơn hàng, Đánh giá & Hình ảnh Comment
-- ==============================================================================

CREATE TABLE sal_order (
    sal_order_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID toàn cục của Đơn hàng',
    sal_order_code VARCHAR(20) NOT NULL COMMENT 'Mã đơn hàng hiển thị (Ví dụ: ORD-20240501-001)',
    sys_customer_id CHAR(36) NOT NULL COMMENT 'Khóa ngoại trỏ tới người mua',
    sal_order_subtotal DECIMAL(22,4) NOT NULL DEFAULT 0 COMMENT 'Tổng tiền hàng trước chiết khấu',
    sal_order_discount DECIMAL(22,4) NOT NULL DEFAULT 0 COMMENT 'Số tiền được giảm giá (Voucher/Flash Sale)',
    sal_order_shipping_fee DECIMAL(22,4) NOT NULL DEFAULT 0 COMMENT 'Chi phí vận chuyển báo khách',
    sal_order_total DECIMAL(22,4) NOT NULL DEFAULT 0 COMMENT 'Tổng tiền cuối cùng khách phải thanh toán',
    sal_order_payment_type TINYINT NOT NULL DEFAULT 0 COMMENT 'Loại thanh toán: 0: COD, 1: Chuyển khoản, 2: MoMo/VNPay',
    sal_order_status TINYINT NOT NULL DEFAULT 0 COMMENT 'Trạng thái đơn: 0: Chờ xác nhận, 1: Đã xác nhận, 2: Đang đóng gói, 3: Đang giao, 4: Hoàn thành, 5: Đã hủy, 6: Đổi trả',
    sal_order_payment_status TINYINT NOT NULL DEFAULT 0 COMMENT 'Trạng thái thanh toán: 0: Chưa thanh toán, 1: Đã thanh toán, 2: Đã hoàn tiền',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày giờ phát sinh đơn hàng',
    CONSTRAINT fk_salorder_syscustomer FOREIGN KEY (sys_customer_id) REFERENCES sys_customer(sys_customer_id) ON DELETE RESTRICT
) COMMENT 'Thông tin Header của Đơn hàng bán ra';

CREATE INDEX ix_salorder_syscustomerid ON sal_order(sys_customer_id);
CREATE INDEX ix_salorder_createddate ON sal_order(created_date);
CREATE UNIQUE INDEX uix_salorder_salordercode ON sal_order(sal_order_code);

CREATE TABLE sal_order_item (
    sal_order_item_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID toàn cục của Chi tiết Đơn hàng',
    sal_order_id CHAR(36) NOT NULL COMMENT 'Khóa ngoại trỏ tới Đơn hàng gốc',
    cat_product_variant_id CHAR(36) NOT NULL COMMENT 'Khóa ngoại trỏ tới Biến thể SKU đã mua',
    sal_order_item_qty DECIMAL(18,4) NOT NULL DEFAULT 0 COMMENT 'Số lượng sản phẩm khách mua',
    sal_order_item_price DECIMAL(22,4) NOT NULL DEFAULT 0 COMMENT 'Đơn giá lúc chốt đơn (Bảo toàn lịch sử giá)',
    sal_order_item_cost DECIMAL(22,4) NOT NULL DEFAULT 0 COMMENT 'Giá vốn COGS lúc chốt đơn (Dùng tính Lỗ/Lãi chính xác)',
    CONSTRAINT fk_salorderitem_salorder FOREIGN KEY (sal_order_id) REFERENCES sal_order(sal_order_id) ON DELETE RESTRICT,
    CONSTRAINT fk_salorderitem_catproductvariant FOREIGN KEY (cat_product_variant_id) REFERENCES cat_product_variant(cat_product_variant_id) ON DELETE RESTRICT
) COMMENT 'Chi tiết Sản phẩm trong Đơn hàng (Dòng đơn)';

CREATE INDEX ix_salorderitem_salorderid ON sal_order_item(sal_order_id);
CREATE INDEX ix_salorderitem_catproductvariantid ON sal_order_item(cat_product_variant_id);

CREATE TABLE sal_review (
    sal_review_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID toàn cục Đánh giá sản phẩm',
    sal_order_item_id CHAR(36) NOT NULL COMMENT 'Khóa ngoại trỏ tới Dòng Đơn hàng (Đảm bảo khách đã mua mới được Review)',
    sys_customer_id CHAR(36) NOT NULL COMMENT 'Khóa ngoại trỏ tới Khách hàng',
    sal_review_rating DECIMAL(18,4) NOT NULL DEFAULT 5 COMMENT 'Số điểm sao đánh giá (Từ 1 đến 5)',
    sal_review_content TEXT NULL COMMENT 'Nội dung bình luận của khách',
    sal_review_status TINYINT NOT NULL DEFAULT 0 COMMENT 'Trạng thái kiểm duyệt: 0: Chờ duyệt, 1: Đã duyệt hiện lên Web, 2: Đã ẩn (Từ chối)',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày giờ khách gửi đánh giá',
    CONSTRAINT fk_salreview_salorderitem FOREIGN KEY (sal_order_item_id) REFERENCES sal_order_item(sal_order_item_id) ON DELETE RESTRICT,
    CONSTRAINT fk_salreview_syscustomer FOREIGN KEY (sys_customer_id) REFERENCES sys_customer(sys_customer_id) ON DELETE RESTRICT
) COMMENT 'Bảng lưu trữ thông tin Đánh giá, Bình luận (Comment) của khách hàng';

CREATE INDEX ix_salreview_salorderitemid ON sal_review(sal_order_item_id);
CREATE INDEX ix_salreview_syscustomerid ON sal_review(sys_customer_id);

CREATE TABLE sal_review_media (
    sal_review_media_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID toàn cục Hình ảnh của Đánh giá',
    sal_review_id CHAR(36) NOT NULL COMMENT 'Khóa ngoại trỏ tới Đánh giá gốc',
    sal_review_media_path VARCHAR(255) NOT NULL COMMENT 'Đường dẫn thư mục vật lý (VD: /reviews/2024/05/xyz.webp)',
    cat_product_media_type TINYINT NOT NULL DEFAULT 1 COMMENT 'Loại file đính kèm: 1: Image, 2: Video ngắn',
    CONSTRAINT fk_salreviewmedia_salreview FOREIGN KEY (sal_review_id) REFERENCES sal_review(sal_review_id) ON DELETE CASCADE
) COMMENT 'Bảng lưu trữ hình ảnh/video khách hàng Upload khi Comment';

CREATE INDEX ix_salreviewmedia_salreviewid ON sal_review_media(sal_review_id);