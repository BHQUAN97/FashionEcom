-- =============================================
-- Author:      Claude Code
-- Create date: 2026-04-11
-- Description: Seed data cho moi truong dev — admin, categories, products, settings, loyalty
-- Luu y:       Dung INSERT IGNORE de chay lai an toan (khong duplicate)
-- =============================================

USE fashion_ecom;

-- ==============================================================================
-- 1. ADMIN USER — Tai khoan quan tri he thong
-- Role: 1 = SuperAdmin (theo entity sys_user)
-- ==============================================================================

INSERT IGNORE INTO sys_user (
    sys_user_id,
    sys_user_email,
    sys_user_password,
    sys_user_role,
    sys_user_status,
    sys_user_name,
    created_date
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'admin@fashionecom.vn',
    '$2a$10$N9qo8uLOickgx2ZMRZoMye5/Yq8w3T8dLN8X2s7.OYzYE2n/6Kk.O',
    1,
    1,
    'Super Admin',
    NOW()
);

-- ==============================================================================
-- 2. CATEGORIES — 5 danh muc san pham chinh
-- ==============================================================================

INSERT IGNORE INTO cat_category (
    cat_category_id,
    cat_category_parent_id,
    cat_category_code,
    cat_category_name,
    cat_category_slug,
    cat_category_description,
    cat_category_sort,
    cat_category_status
) VALUES
    ('c0000000-0000-0000-0000-000000000001', NULL, 'AO-THUN',   'Ao Thun',    'ao-thun',    'Ao thun nam nu thoi trang, chat lieu cotton thoang mat',  1, 1),
    ('c0000000-0000-0000-0000-000000000002', NULL, 'AO-SOMI',   'Ao So Mi',   'ao-so-mi',   'Ao so mi cong so va casual, da dang mau sac',             2, 1),
    ('c0000000-0000-0000-0000-000000000003', NULL, 'QUAN-JEANS', 'Quan Jeans', 'quan-jeans', 'Quan jeans nam nu, skinny, slim fit, straight',           3, 1),
    ('c0000000-0000-0000-0000-000000000004', NULL, 'AO-KHOAC',  'Ao Khoac',   'ao-khoac',   'Ao khoac gio, ao khoac da, bomber, hoodie',               4, 1),
    ('c0000000-0000-0000-0000-000000000005', NULL, 'PHU-KIEN',  'Phu Kien',   'phu-kien',   'That lung, vi, mu non, kinh mat va phu kien thoi trang',  5, 1);

-- ==============================================================================
-- 3. PRODUCTS — 10 san pham mau (mix across categories)
-- ==============================================================================

INSERT IGNORE INTO cat_product (
    cat_product_id,
    cat_category_id,
    cat_product_code,
    cat_product_name,
    cat_product_slug,
    cat_product_description,
    cat_product_short_desc,
    cat_product_brand,
    cat_product_is_featured,
    cat_product_is_new,
    cat_product_status,
    created_date
) VALUES
    -- Ao Thun (2 SP)
    ('p0000000-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000001',
     'AT-001', 'Ao Thun Polo Nam Co Ban',
     'ao-thun-polo-nam-co-ban',
     '<p>Ao thun polo nam chat lieu cotton 100%, thoang mat, co dan, phu hop mac hang ngay va di lam casual.</p>',
     'Ao thun polo nam cotton co ban, nhieu mau',
     'FashionEcom', 1, 1, 1, NOW()),

    ('p0000000-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000001',
     'AT-002', 'Ao Thun Oversize Unisex In Hinh',
     'ao-thun-oversize-unisex-in-hinh',
     '<p>Ao thun oversize form rong, unisex, chat lieu cotton pha spandex, in hinh trendy.</p>',
     'Ao thun oversize unisex, in hinh doc dao',
     'FashionEcom', 0, 1, 1, NOW()),

    -- Ao So Mi (2 SP)
    ('p0000000-0000-0000-0000-000000000003',
     'c0000000-0000-0000-0000-000000000002',
     'SM-001', 'Ao So Mi Trang Cong So Nam',
     'ao-so-mi-trang-cong-so-nam',
     '<p>Ao so mi trang slim fit, vai khong nhan, phu hop cong so va su kien trang trong.</p>',
     'Ao so mi trang slim fit nam, khong nhan',
     'FashionEcom', 1, 1, 1, NOW()),

    ('p0000000-0000-0000-0000-000000000004',
     'c0000000-0000-0000-0000-000000000002',
     'SM-002', 'Ao So Mi Ca Ro Flannel',
     'ao-so-mi-ca-ro-flannel',
     '<p>Ao so mi flannel ca ro, chat lieu day dan, giu am tot, phong cach casual.</p>',
     'So mi flannel ca ro, am ap mua dong',
     'FashionEcom', 0, 1, 1, NOW()),

    -- Quan Jeans (2 SP)
    ('p0000000-0000-0000-0000-000000000005',
     'c0000000-0000-0000-0000-000000000003',
     'QJ-001', 'Quan Jeans Slim Fit Nam Xanh Dam',
     'quan-jeans-slim-fit-nam-xanh-dam',
     '<p>Quan jeans nam slim fit, co gian nhe, mau xanh dam co dien, de phoi do.</p>',
     'Jeans slim fit nam, xanh dam co dien',
     'FashionEcom', 1, 1, 1, NOW()),

    ('p0000000-0000-0000-0000-000000000006',
     'c0000000-0000-0000-0000-000000000003',
     'QJ-002', 'Quan Jeans Skinny Nu Wash Nhe',
     'quan-jeans-skinny-nu-wash-nhe',
     '<p>Quan jeans nu skinny, wash nhe, co gian cao, ton dang, thoai mai van dong.</p>',
     'Jeans skinny nu, wash nhe, co gian cao',
     'FashionEcom', 0, 1, 1, NOW()),

    -- Ao Khoac (2 SP)
    ('p0000000-0000-0000-0000-000000000007',
     'c0000000-0000-0000-0000-000000000004',
     'AK-001', 'Ao Khoac Bomber Nam Da PU',
     'ao-khoac-bomber-nam-da-pu',
     '<p>Ao khoac bomber chat lieu da PU cao cap, phong cach manh me, chong gio nhe.</p>',
     'Bomber da PU nam, phong cach manh me',
     'FashionEcom', 1, 0, 1, NOW()),

    ('p0000000-0000-0000-0000-000000000008',
     'c0000000-0000-0000-0000-000000000004',
     'AK-002', 'Ao Hoodie Unisex Noi Tay',
     'ao-hoodie-unisex-noi-tay',
     '<p>Ao hoodie unisex, noi cotton day, giu am tot, form rong thoai mai.</p>',
     'Hoodie unisex noi cotton, giu am tot',
     'FashionEcom', 0, 1, 1, NOW()),

    -- Phu Kien (2 SP)
    ('p0000000-0000-0000-0000-000000000009',
     'c0000000-0000-0000-0000-000000000005',
     'PK-001', 'That Lung Da Bo Nam Khoa Tu Dong',
     'that-lung-da-bo-nam-khoa-tu-dong',
     '<p>That lung da bo that, khoa tu dong cao cap, be rong 3.5cm, phu hop cong so.</p>',
     'That lung da bo that, khoa tu dong',
     'FashionEcom', 0, 0, 1, NOW()),

    ('p0000000-0000-0000-0000-000000000010',
     'c0000000-0000-0000-0000-000000000005',
     'PK-002', 'Vi Da Nam Card Holder Mini',
     'vi-da-nam-card-holder-mini',
     '<p>Vi da nam nho gon, card holder, nhieu ngan, chat lieu da PU chong tray.</p>',
     'Vi da nam mini, nhieu ngan tien loi',
     'FashionEcom', 0, 1, 1, NOW());

-- ==============================================================================
-- 3b. PRODUCT VARIANTS — Moi SP co 2-3 variant (mau/size) de test
-- ==============================================================================

INSERT IGNORE INTO cat_product_variant (
    cat_product_variant_id,
    cat_product_id,
    cat_product_variant_sku,
    cat_product_variant_color,
    cat_product_variant_size,
    cat_product_variant_price,
    cat_product_variant_cost,
    cat_product_variant_weight
) VALUES
    -- AT-001: Ao Thun Polo (299K)
    ('v0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'AT001-DEN-M',   'Den',   'M',  299000, 120000, 250),
    ('v0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000001', 'AT001-DEN-L',   'Den',   'L',  299000, 120000, 260),
    ('v0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000001', 'AT001-TRANG-M', 'Trang', 'M',  299000, 120000, 250),

    -- AT-002: Ao Thun Oversize (250K)
    ('v0000000-0000-0000-0000-000000000004', 'p0000000-0000-0000-0000-000000000002', 'AT002-DEN-XL',  'Den',   'XL', 250000, 100000, 280),
    ('v0000000-0000-0000-0000-000000000005', 'p0000000-0000-0000-0000-000000000002', 'AT002-KEM-XL',  'Kem',   'XL', 250000, 100000, 280),

    -- SM-001: So Mi Trang (450K)
    ('v0000000-0000-0000-0000-000000000006', 'p0000000-0000-0000-0000-000000000003', 'SM001-TRANG-M', 'Trang', 'M',  450000, 180000, 200),
    ('v0000000-0000-0000-0000-000000000007', 'p0000000-0000-0000-0000-000000000003', 'SM001-TRANG-L', 'Trang', 'L',  450000, 180000, 210),

    -- SM-002: So Mi Flannel (380K)
    ('v0000000-0000-0000-0000-000000000008', 'p0000000-0000-0000-0000-000000000004', 'SM002-DO-M',    'Do Ca Ro', 'M', 380000, 150000, 300),
    ('v0000000-0000-0000-0000-000000000009', 'p0000000-0000-0000-0000-000000000004', 'SM002-XANH-L',  'Xanh Ca Ro', 'L', 380000, 150000, 310),

    -- QJ-001: Jeans Slim Nam (550K)
    ('v0000000-0000-0000-0000-000000000010', 'p0000000-0000-0000-0000-000000000005', 'QJ001-XDAM-30', 'Xanh Dam', '30', 550000, 220000, 500),
    ('v0000000-0000-0000-0000-000000000011', 'p0000000-0000-0000-0000-000000000005', 'QJ001-XDAM-32', 'Xanh Dam', '32', 550000, 220000, 520),

    -- QJ-002: Jeans Skinny Nu (490K)
    ('v0000000-0000-0000-0000-000000000012', 'p0000000-0000-0000-0000-000000000006', 'QJ002-XNHE-26', 'Xanh Nhe', '26', 490000, 200000, 460),
    ('v0000000-0000-0000-0000-000000000013', 'p0000000-0000-0000-0000-000000000006', 'QJ002-XNHE-28', 'Xanh Nhe', '28', 490000, 200000, 470),

    -- AK-001: Bomber Da PU (890K)
    ('v0000000-0000-0000-0000-000000000014', 'p0000000-0000-0000-0000-000000000007', 'AK001-DEN-L',   'Den',   'L',  890000, 350000, 650),
    ('v0000000-0000-0000-0000-000000000015', 'p0000000-0000-0000-0000-000000000007', 'AK001-NAU-L',   'Nau',   'L',  890000, 350000, 650),

    -- AK-002: Hoodie (350K)
    ('v0000000-0000-0000-0000-000000000016', 'p0000000-0000-0000-0000-000000000008', 'AK002-XAM-M',   'Xam',   'M',  350000, 140000, 400),
    ('v0000000-0000-0000-0000-000000000017', 'p0000000-0000-0000-0000-000000000008', 'AK002-DEN-L',   'Den',   'L',  350000, 140000, 420),

    -- PK-001: That Lung (320K)
    ('v0000000-0000-0000-0000-000000000018', 'p0000000-0000-0000-0000-000000000009', 'PK001-DEN-110', 'Den',   '110cm', 320000, 130000, 200),
    ('v0000000-0000-0000-0000-000000000019', 'p0000000-0000-0000-0000-000000000009', 'PK001-NAU-110', 'Nau',   '110cm', 320000, 130000, 200),

    -- PK-002: Vi Da (200K)
    ('v0000000-0000-0000-0000-000000000020', 'p0000000-0000-0000-0000-000000000010', 'PK002-DEN',     'Den',   NULL, 200000, 80000, 100),
    ('v0000000-0000-0000-0000-000000000021', 'p0000000-0000-0000-0000-000000000010', 'PK002-NAU',     'Nau',   NULL, 200000, 80000, 100);

-- ==============================================================================
-- 4. SETTINGS — Cau hinh he thong key-value
-- ==============================================================================

INSERT IGNORE INTO sys_setting (
    sys_setting_id,
    sys_setting_group,
    sys_setting_key,
    sys_setting_value
) VALUES
    ('s0000000-0000-0000-0000-000000000001', 'shop',     'site_name',           'Fashion Ecom'),
    ('s0000000-0000-0000-0000-000000000002', 'shop',     'site_phone',          '0901234567'),
    ('s0000000-0000-0000-0000-000000000003', 'shipping', 'shipping_fee',        '30000'),
    ('s0000000-0000-0000-0000-000000000004', 'shipping', 'free_ship_threshold', '500000');

-- ==============================================================================
-- 5. LOYALTY CONFIG — Cau hinh chuong trinh tich diem
-- earn_rate=10000 (1 diem/10K VND), redeem_rate=100, max_redeem_percent=50%
-- Nguong hang: Silver=2M, Gold=5M, Platinum=10M
-- ==============================================================================

-- Xoa default row (neu co) de INSERT row voi UUID co dinh
DELETE FROM prm_loyalty_config WHERE prm_loyalty_config_id != 'l0000000-0000-0000-0000-000000000001';

INSERT IGNORE INTO prm_loyalty_config (
    prm_loyalty_config_id,
    prm_loyalty_config_earn_rate,
    prm_loyalty_config_redeem_rate,
    prm_loyalty_config_max_redeem_percent,
    prm_loyalty_config_min_redeem_points,
    prm_loyalty_config_expiry_months,
    prm_loyalty_config_pending_days,
    prm_loyalty_config_silver_threshold,
    prm_loyalty_config_gold_threshold,
    prm_loyalty_config_platinum_threshold
) VALUES (
    'l0000000-0000-0000-0000-000000000001',
    10000.0000,
    100.0000,
    50.0000,
    50.0000,
    12.0000,
    7.0000,
    2000000.0000,
    5000000.0000,
    10000000.0000
);

-- =============================================
-- DONE — Seed dev data loaded
-- Admin login: admin@fashionecom.vn / Admin@123
-- =============================================
