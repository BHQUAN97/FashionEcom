-- =============================================
-- Author:      BHQUAN97
-- Create date: 2026-04-15
-- Description: Seed du lieu san pham thuc tu Torano.vn (48 products, 8 categories)
--              Chuyen tu frontend mock data sang DB thuc
-- =============================================

USE fashion_ecom;

-- ==============================================================================
-- 1. COLORS — Bo sung day du mau sac tu Torano (UPSERT)
-- ==============================================================================

INSERT IGNORE INTO cat_color (cat_color_id, cat_color_name, cat_color_hex, cat_color_sort, cat_color_status) VALUES
(UUID(), 'Đen',        '#1a1a1a', 1, 1),
(UUID(), 'Xanh Navy',  '#1e3a5f', 2, 1),
(UUID(), 'Trắng',      '#f5f5f5', 3, 1),
(UUID(), 'Xám',        '#808080', 4, 1),
(UUID(), 'Be',          '#c8ad7f', 5, 1),
(UUID(), 'Nâu',        '#8b5e3c', 6, 1),
(UUID(), 'Xanh rêu',   '#4a6741', 7, 1),
(UUID(), 'Đỏ đậm',    '#8b2500', 8, 1);

-- ==============================================================================
-- 2. SIZE GROUPS + SIZES — Ao (S-2XL), Quan (29-33), Freesize
-- ==============================================================================

-- Nhom ao: S, M, L, XL, 2XL
INSERT IGNORE INTO cat_size_group (cat_size_group_id, cat_size_group_name, cat_size_group_values, cat_size_group_sort) VALUES
(UUID(), 'Áo Nam', '["S","M","L","XL","2XL"]', 1);

INSERT IGNORE INTO cat_size_group (cat_size_group_id, cat_size_group_name, cat_size_group_values, cat_size_group_sort) VALUES
(UUID(), 'Quần Nam', '["29","30","31","32","33"]', 2);

INSERT IGNORE INTO cat_size_group (cat_size_group_id, cat_size_group_name, cat_size_group_values, cat_size_group_sort) VALUES
(UUID(), 'Freesize', '["Freesize"]', 3);

-- Seed sizes cho nhom Ao Nam
INSERT IGNORE INTO cat_size (cat_size_id, cat_size_group_id, cat_size_value, cat_size_sort, cat_size_status)
SELECT UUID(), sg.cat_size_group_id, s.val, s.ord, 1
FROM cat_size_group sg
CROSS JOIN (
    SELECT 'S' AS val, 1 AS ord UNION ALL
    SELECT 'M', 2 UNION ALL
    SELECT 'L', 3 UNION ALL
    SELECT 'XL', 4 UNION ALL
    SELECT '2XL', 5
) s
WHERE sg.cat_size_group_name = 'Áo Nam'
  AND NOT EXISTS (SELECT 1 FROM cat_size cs WHERE cs.cat_size_group_id = sg.cat_size_group_id AND cs.cat_size_value = s.val);

-- Seed sizes cho nhom Quan Nam
INSERT IGNORE INTO cat_size (cat_size_id, cat_size_group_id, cat_size_value, cat_size_sort, cat_size_status)
SELECT UUID(), sg.cat_size_group_id, s.val, s.ord, 1
FROM cat_size_group sg
CROSS JOIN (
    SELECT '29' AS val, 1 AS ord UNION ALL
    SELECT '30', 2 UNION ALL
    SELECT '31', 3 UNION ALL
    SELECT '32', 4 UNION ALL
    SELECT '33', 5
) s
WHERE sg.cat_size_group_name = 'Quần Nam'
  AND NOT EXISTS (SELECT 1 FROM cat_size cs WHERE cs.cat_size_group_id = sg.cat_size_group_id AND cs.cat_size_value = s.val);

-- Seed Freesize
INSERT IGNORE INTO cat_size (cat_size_id, cat_size_group_id, cat_size_value, cat_size_sort, cat_size_status)
SELECT UUID(), sg.cat_size_group_id, 'Freesize', 1, 1
FROM cat_size_group sg
WHERE sg.cat_size_group_name = 'Freesize'
  AND NOT EXISTS (SELECT 1 FROM cat_size cs WHERE cs.cat_size_group_id = sg.cat_size_group_id AND cs.cat_size_value = 'Freesize');

-- ==============================================================================
-- 3. CATEGORIES — 8 danh muc Torano
-- ==============================================================================

-- Xoa du lieu cu (neu re-run)
DELETE FROM cat_category WHERE cat_category_code IN ('AO-POLO','AO-THUN','QUAN-SHORT','QUAN-AU','AO-KHOAC','AO-SOMI','AO-NI','PHU-KIEN');

INSERT INTO cat_category (cat_category_id, cat_category_code, cat_category_name, cat_category_slug, cat_category_description, cat_category_status, cat_category_sort) VALUES
(UUID(), 'AO-POLO',    'Áo Polo',       'ao-polo',     'Áo polo nam cao cấp nhiều kiểu dáng',          1, 1),
(UUID(), 'AO-THUN',    'Áo Thun',       'ao-thun',     'Áo thun nam thể thao & lifestyle',             1, 2),
(UUID(), 'QUAN-SHORT', 'Quần Short',    'quan-short',   'Quần short nam đũi, gió, khaki',               1, 3),
(UUID(), 'QUAN-AU',    'Quần Âu',       'quan-au',      'Quần âu, jeans, kaki nam cao cấp',             1, 4),
(UUID(), 'AO-KHOAC',   'Áo Khoác',      'ao-khoac',    'Áo khoác gió, bomber, phao, da lộn',           1, 5),
(UUID(), 'AO-SOMI',    'Áo Sơ Mi',      'ao-so-mi',    'Áo sơ mi nam dài tay, ngắn tay',               1, 6),
(UUID(), 'AO-NI',      'Áo Nỉ/Hoodie',  'ao-ni',       'Áo nỉ, hoodie, len nam giữ ấm',                1, 7),
(UUID(), 'PHU-KIEN',   'Phụ Kiện',      'phu-kien',     'Thắt lưng, phụ kiện da Torano',                1, 8);

-- ==============================================================================
-- 4. PRODUCTS — 48 san pham tu Torano (6 per category)
-- ==============================================================================

-- Tao procedure de insert product + variants + media trong 1 transaction
DROP PROCEDURE IF EXISTS proc_seed_product;

DELIMITER //
CREATE PROCEDURE proc_seed_product(
    IN p_cat_code VARCHAR(20),
    IN p_code VARCHAR(20),
    IN p_name VARCHAR(255),
    IN p_slug VARCHAR(255),
    IN p_price DECIMAL(22,4),
    IN p_compare_price DECIMAL(22,4),
    IN p_image VARCHAR(255),
    IN p_image_hover VARCHAR(255),
    IN p_is_new TINYINT,
    IN p_is_bestseller TINYINT,
    IN p_brand VARCHAR(100),
    IN p_colors_csv VARCHAR(500),
    IN p_size_group VARCHAR(100)
)
BEGIN
    DECLARE v_product_id CHAR(36);
    DECLARE v_cat_id CHAR(36);
    DECLARE v_color_id CHAR(36);
    DECLARE v_color_name VARCHAR(50);
    DECLARE v_size_id CHAR(36);
    DECLARE v_size_value VARCHAR(50);
    DECLARE v_variant_sku VARCHAR(20);
    DECLARE v_done_c INT DEFAULT 0;
    DECLARE v_done_s INT DEFAULT 0;
    DECLARE v_stock_qty INT;
    DECLARE v_sort INT DEFAULT 0;

    -- Tim category
    SELECT cat_category_id INTO v_cat_id
    FROM cat_category WHERE cat_category_code = p_cat_code LIMIT 1;

    IF v_cat_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Category not found';
    END IF;

    -- Xoa product cu (neu re-run)
    DELETE FROM cat_product WHERE cat_product_code = p_code;

    -- Tao product
    SET v_product_id = UUID();
    INSERT INTO cat_product (
        cat_product_id, cat_category_id, cat_product_code, cat_product_name,
        cat_product_slug, cat_product_brand, cat_product_status,
        cat_product_is_featured, cat_product_is_new
    ) VALUES (
        v_product_id, v_cat_id, p_code, p_name,
        p_slug, p_brand, 1,
        p_is_bestseller, p_is_new
    );

    -- Insert main image
    INSERT INTO cat_product_media (cat_product_media_id, cat_product_id, cat_product_media_path, cat_product_media_type, cat_product_media_sort) VALUES
    (UUID(), v_product_id, p_image, 1, 1);

    -- Insert hover image
    IF p_image_hover IS NOT NULL AND p_image_hover != '' THEN
        INSERT INTO cat_product_media (cat_product_media_id, cat_product_id, cat_product_media_path, cat_product_media_type, cat_product_media_sort) VALUES
        (UUID(), v_product_id, p_image_hover, 1, 2);
    END IF;

    -- Tao variants: moi color x moi size trong group
    -- Parse colors CSV va loop
    BEGIN
        DECLARE v_remaining VARCHAR(500);
        DECLARE v_current VARCHAR(50);
        DECLARE v_pos INT;

        SET v_remaining = p_colors_csv;

        color_loop: WHILE LENGTH(v_remaining) > 0 DO
            SET v_pos = LOCATE(',', v_remaining);
            IF v_pos > 0 THEN
                SET v_current = TRIM(SUBSTRING(v_remaining, 1, v_pos - 1));
                SET v_remaining = SUBSTRING(v_remaining, v_pos + 1);
            ELSE
                SET v_current = TRIM(v_remaining);
                SET v_remaining = '';
            END IF;

            -- Tim color ID
            SELECT cat_color_id, cat_color_name INTO v_color_id, v_color_name
            FROM cat_color WHERE cat_color_name = v_current LIMIT 1;

            IF v_color_id IS NOT NULL THEN
                -- Loop qua sizes trong group
                BEGIN
                    DECLARE cur_sizes CURSOR FOR
                        SELECT cs.cat_size_id, cs.cat_size_value
                        FROM cat_size cs
                        JOIN cat_size_group sg ON cs.cat_size_group_id = sg.cat_size_group_id
                        WHERE sg.cat_size_group_name = p_size_group
                        ORDER BY cs.cat_size_sort;
                    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done_s = 1;

                    SET v_done_s = 0;
                    OPEN cur_sizes;

                    size_loop: LOOP
                        FETCH cur_sizes INTO v_size_id, v_size_value;
                        IF v_done_s THEN LEAVE size_loop; END IF;

                        SET v_sort = v_sort + 1;
                        SET v_variant_sku = CONCAT(p_code, '-', LEFT(REPLACE(v_color_name, ' ', ''), 3), '-', v_size_value);
                        SET v_stock_qty = FLOOR(5 + RAND() * 20);

                        INSERT INTO cat_product_variant (
                            cat_product_variant_id, cat_product_id,
                            cat_product_variant_sku, cat_product_variant_color, cat_product_variant_size,
                            cat_product_variant_price, cat_product_variant_compare_price,
                            cat_product_variant_status
                        ) VALUES (
                            UUID(), v_product_id,
                            v_variant_sku, v_color_name, v_size_value,
                            p_price, p_compare_price,
                            1
                        );
                    END LOOP size_loop;
                    CLOSE cur_sizes;
                END;
            END IF;

            SET v_color_id = NULL;
        END WHILE color_loop;
    END;

    -- Insert inventory cho moi variant
    INSERT INTO inv_inventory (inv_inventory_id, cat_product_variant_id, inv_inventory_qty)
    SELECT UUID(), cpv.cat_product_variant_id, FLOOR(5 + RAND() * 20)
    FROM cat_product_variant cpv
    WHERE cpv.cat_product_id = v_product_id
      AND NOT EXISTS (
          SELECT 1 FROM inv_inventory ii
          WHERE ii.cat_product_variant_id = cpv.cat_product_variant_id
      );
END //
DELIMITER ;

-- ──────────────────────────────────────
-- CAT 1: Áo Polo (6 sản phẩm)
-- ──────────────────────────────────────

CALL proc_seed_product('AO-POLO', 'GSTP068',
    'Áo polo kẻ bo tay GSTP068',
    'ao-polo-ke-bo-tay-3-gstp068',
    550000, 0,
    '/images/products/_o_web_75638124a9704332bada4b2aa10c379b_master.png',
    '/images/products/54629081966_cbaaad4789_k_1ef0ed7dd60e4779afcb8259929ec3b1_master.jpg',
    1, 1, 'Torano', 'Xanh Navy,Đen,Xám', 'Áo Nam');

CALL proc_seed_product('AO-POLO', 'GSTP643',
    'Áo polo trơn bo kẻ thêu logo ngực GSTP643',
    'ao-polo-tron-bo-ke-theu-logo-nguc-4-gstp643',
    550000, 0,
    '/images/products/_o_web_b3095315fbad44439231d69b28c8e420_master.png',
    '/images/products/54629287024_aa453ac2be_k_8bbc8777a0cc43d088864b6588a3cd3f_master.jpg',
    1, 0, 'Torano', 'Xanh Navy,Trắng,Đen', 'Áo Nam');

CALL proc_seed_product('AO-POLO', 'GSTP042',
    'Áo polo kẻ bo tay phối màu GSTP042',
    'ao-polo-ke-bo-tay-phoi-mau-2-gstp042',
    550000, 0,
    '/images/products/_o_web_b2d41e8adb7e4050a404a3ad11696770_master.png',
    '/images/products/54629391780_548de97568_k_e76a147413104a67ab054854afcf4ae1_master.jpg',
    1, 0, 'Torano', 'Đen,Be,Xanh Navy', 'Áo Nam');

CALL proc_seed_product('AO-POLO', 'ESTP038',
    'Áo Polo trơn basic thêu logo ngực ESTP038',
    'ao-polo-tron-basic-den-theu-logo-nguc-estp038',
    249000, 400000,
    '/images/products/1_42b0199a7ff846fb8d066deb10672a81_master.png',
    '/images/products/5_3246ef0319354cdebefa12c46b16df67_master.png',
    1, 0, 'Torano', 'Đen,Nâu,Trắng,Xám', 'Áo Nam');

CALL proc_seed_product('AO-POLO', 'GSTP047',
    'Áo polo can phối thêu logo đại bàng GSTP047',
    'ao-polo-can-phoi-theu-logo-nguc-3-gstp047',
    299000, 480000,
    '/images/products/1_257a3776f6a54b32a5d2612e41582b64_master.png',
    '/images/products/8_3849787218384057ba447b05790935ce_master.png',
    1, 0, 'Torano', 'Xanh Navy,Đen', 'Áo Nam');

CALL proc_seed_product('AO-POLO', 'GWTP502',
    'Áo Polo dài tay basic thêu logo ngực GWTP502',
    'ao-polo-dai-tay-basic-theu-logo-nguc-3-gwtp502',
    699000, 0,
    '/images/products/_o_web__2__85e02af752c1443aa16633aa1ac4076b_master.png',
    '/images/products/_o_web__1__0e9104c64a924e19a8f88bb29b3b5b51_master.png',
    1, 0, 'Torano', 'Đen,Xanh Navy,Xám', 'Áo Nam');

-- ──────────────────────────────────────
-- CAT 2: Áo Thun (6 sản phẩm)
-- ──────────────────────────────────────

CALL proc_seed_product('AO-THUN', 'GSTS018',
    'Áo T shirt trơn in thể thao GSTS018',
    'ao-t-shirt-tron-in-phan-quang-3-gsts018',
    249000, 349000,
    '/images/products/2_c84d08a4d3984392b5b7be8a45e3e16e_master.png',
    '/images/products/54850534122_abd94e6bc4_k_0366700a90854459af974377e28d3a30_master.jpg',
    0, 0, 'Torano', 'Đen,Trắng,Xanh Navy', 'Áo Nam');

CALL proc_seed_product('AO-THUN', 'GSTS017',
    'Áo T shirt trơn in thể thao GSTS017',
    'ao-t-shirt-tron-in-logo-phan-quang-4-gsts017',
    249000, 349000,
    '/images/products/1_457e8f91dae54ba6a9ed2ad64be7ad47_master.png',
    '/images/products/54930091512_12e28ca3bc_c_5c170ac00dee4db195185811ca48e016_master.jpg',
    0, 0, 'Torano', 'Đen,Xám', 'Áo Nam');

CALL proc_seed_product('AO-THUN', 'GSTS006',
    'Áo T shirt trơn in logo ngực GSTS006',
    'ao-t-shirt-tron-in-logo-nguc-2-gsts006',
    279000, 0,
    '/images/products/_o_web_afc4f5e440bf4e9988e93da9d021a203_master.png',
    '/images/products/54947149811_02e5e698a8_k_e943f1095ba846f0b97468759adf3318_master.jpg',
    0, 0, 'Torano', 'Đen,Trắng,Xám', 'Áo Nam');

CALL proc_seed_product('AO-THUN', 'FSTS002',
    'Áo T shirt thể thao basic FSTS002',
    'ao-t-shirt-the-thao-basic-5-fsts002',
    149000, 250000,
    '/images/products/tp038-1_f8e3fadea4364cbda92fa58a7b38aac7_master.png',
    '/images/products/576869033_1252460493594196_3116353017788408982_n_356619ed176d4bdc8b7284fdcc8c782b_master.jpg',
    0, 0, 'Torano', 'Đen,Trắng', 'Áo Nam');

CALL proc_seed_product('AO-THUN', 'FSTS001',
    'Áo T shirt trơn in logo ngực FSTS001',
    'ao-t-shirt-tron-in-logo-nguc-8-fsts001',
    169000, 250000,
    '/images/products/thiet_ke_chua_co_ten__5__ed54b4168e6f4f3f92e24f6ebd4961f7_master.png',
    '/images/products/577038858_1255218279985084_5252201006724013030_n_a50bbe37fade4c44ae5774983b5dd3fe_master.jpg',
    0, 0, 'Torano', 'Đen,Xanh Navy,Trắng', 'Áo Nam');

CALL proc_seed_product('AO-THUN', 'FSTS026',
    'Áo T shirt họa tiết in logo Horse ngực FSTS026',
    'ao-t-shirt-hoa-tiet-in-logo-horse-nguc-6-fsts026',
    300000, 0,
    '/images/products/tp038-1_12784231360b4e619e47e59ee28981c6_master.png',
    '/images/products/590729306_1268920281948217_8370921118819506715_n_07f456a575194ceca632fcdc9f6fcc47_master.jpg',
    0, 0, 'Torano', 'Đen,Trắng,Be', 'Áo Nam');

-- ──────────────────────────────────────
-- CAT 3: Quần Short (6 sản phẩm)
-- ──────────────────────────────────────

CALL proc_seed_product('QUAN-SHORT', 'FSBI001',
    'Quần short đũi cạp chun basic FSBI001',
    'quan-short-dui-cap-chun-basic-gap-gau-fsbi001',
    299000, 450000,
    '/images/products/fsbi001-9_53586798344_o_d2e78b3de56d4b098fe40d3310c7f996_master.jpg',
    '/images/products/595913189_1278756820964563_6438612972851276560_n_c14be49bb87e437f951df031135d2c60_master.jpg',
    0, 0, 'Torano', 'Đen,Be,Xám', 'Quần Nam');

CALL proc_seed_product('QUAN-SHORT', 'FSBK012',
    'Quần short khaki cạp thường basic FSBK012',
    'quan-short-khaki-cap-thuong-basic-fsbk012',
    299000, 450000,
    '/images/products/fsbk012-2_53626901061_o_60d9ea3be5a44c31ac15ba401a919896_master.jpg',
    '/images/products/600532210_1285691930271052_7217001211690083350_n_4f122840c25e45779b311cf4929e9544_master.jpg',
    0, 0, 'Torano', 'Be,Đen,Xanh Navy', 'Quần Nam');

CALL proc_seed_product('QUAN-SHORT', 'BW600',
    'Quần Short gió thể thao đục lỗ sườn BW600',
    'quan-short-gio-the-thao-duc-lo-suon-bw600',
    169000, 249000,
    '/images/products/bw600_82451b6d03bc40ada574ce3f8401df2f_master.jpg',
    '/images/products/497728757_1107401171433463_2464759818378874823_n_e1e65cfc022749f7afe99b9960de023c_master.jpg',
    0, 0, 'Torano', 'Đen,Xanh Navy,Xám', 'Quần Nam');

CALL proc_seed_product('QUAN-SHORT', 'FSBW001',
    'Quần short gió basic phối chun cạp FSBW001',
    'quan-short-gio-basic-phoi-chun-cap-fsbw001',
    169000, 249000,
    '/images/products/avt_web_1150_x_1475_px__3592e7567bb24ab4bf2f4e467b2e48d3_master.png',
    '/images/products/514694025_1144505567723023_2229080463376009636_n_2fc8f4d493e544a78e71b085a26bfbdb_master.jpg',
    0, 0, 'Torano', 'Đen,Xanh Navy', 'Quần Nam');

CALL proc_seed_product('QUAN-SHORT', 'FSBK015',
    'Quần Short Khaki chiết eo gấu LV FSBK015',
    'quan-short-khaki-chiet-eo-gau-lv-fsbk015',
    350000, 0,
    '/images/products/tp038-1_2e954120db914978b420e969f044a0cd_master.png',
    '/images/products/517136676_1147676020739311_4226858427086245361_n_0ebde8dbb9e64dc5959b35bbdd2a394c_master.jpg',
    0, 0, 'Torano', 'Be,Đen,Xám', 'Quần Nam');

CALL proc_seed_product('QUAN-SHORT', 'FSBK010',
    'Quần short khaki cạp chun basic FSBK010',
    'quan-short-khaki-cap-chun-basic-fsbk010',
    299000, 450000,
    '/images/products/53569696867_539e007d35_b_f6c9571bb6684f7cbcc39a3f20adc933_master.jpg',
    '/images/products/img_0232_54976947321_o_c42f07dcd0bc43fd84a484ee8cf1abcf_master.jpg',
    0, 0, 'Torano', 'Be,Đen,Xanh Navy', 'Quần Nam');

-- ──────────────────────────────────────
-- CAT 4: Quần Âu / Jeans / Kaki (6 sản phẩm)
-- ──────────────────────────────────────

CALL proc_seed_product('QUAN-AU', 'GABT892',
    'Quần âu slimfit trơn cạp chun gấu LV GABT892',
    'quan-au-slimfit-tron-cap-chun-tui-cheo-theu-logo-5-gabt892',
    649000, 0,
    '/images/products/t892_eb23ce8e51714572b03a1fbe52f91dfe_master.png',
    '/images/products/54629081966_cbaaad4789_k_1ef0ed7dd60e4779afcb8259929ec3b1_master.jpg',
    0, 0, 'Torano', 'Đen,Xám,Xanh Navy', 'Quần Nam');

CALL proc_seed_product('QUAN-AU', 'GABT891',
    'Quần âu regularfit trơn túi chéo thêu logo GABT891',
    'quan-au-regularfit-tron-tui-cheo-theu-logo-3-gabt891',
    649000, 0,
    '/images/products/t891_3eead5a7f97e4c649b40221367f517f5_master.png',
    '/images/products/54629287024_aa453ac2be_k_8bbc8777a0cc43d088864b6588a3cd3f_master.jpg',
    0, 0, 'Torano', 'Đen,Xám,Be', 'Quần Nam');

CALL proc_seed_product('QUAN-AU', 'DABT900',
    'Quần âu slim-fit cạp trơn DABT900',
    'quan-au-slimfit-cap-tron-5-dabt900',
    449000, 650000,
    '/images/products/bt900_afe890ccab214119b1fcb9b0340878f9_master.jpg',
    '/images/products/54629391780_548de97568_k_e76a147413104a67ab054854afcf4ae1_master.jpg',
    0, 0, 'Torano', 'Đen,Xám', 'Quần Nam');

CALL proc_seed_product('QUAN-AU', 'EABJ012',
    'Quần Jeans basic slim EABJ012',
    'quan-jeans-basic-slim-eabj012',
    449000, 650000,
    '/images/products/bj012_972f5893a3c14a8f8d4c71e8a453f23e_master.jpg',
    '/images/products/5_3246ef0319354cdebefa12c46b16df67_master.png',
    0, 0, 'Torano', 'Đen,Xanh Navy', 'Quần Nam');

CALL proc_seed_product('QUAN-AU', 'FABK001',
    'Quần kaki dài basic cạp tender FABK001',
    'quan-kaki-dai-basic-cap-tender-5-fabk001',
    399000, 650000,
    '/images/products/qu_n_web_c166306cb69142db901aceaf3883c1c9_master.png',
    '/images/products/8_3849787218384057ba447b05790935ce_master.png',
    0, 0, 'Torano', 'Be,Đen,Xám', 'Quần Nam');

CALL proc_seed_product('QUAN-AU', 'GABJ302',
    'Quần Jeans basic relaxedfit GABJ302',
    'quan-jeans-basic-relaxedfit-1-gabj302',
    699000, 0,
    '/images/products/qu_n_web_fc8dbced49084e6e986c7b2134fd9de9_master.png',
    '/images/products/_o_web__1__0e9104c64a924e19a8f88bb29b3b5b51_master.png',
    0, 1, 'Torano', 'Đen,Xanh Navy', 'Quần Nam');

-- ──────────────────────────────────────
-- CAT 5: Áo Khoác (6 sản phẩm)
-- ──────────────────────────────────────

CALL proc_seed_product('AO-KHOAC', 'GWCW505',
    'Áo khoác gió 2 lớp cổ bẻ thêu logo GWCW505',
    'ao-khoac-gio-2-lop-co-be-theu-logo-1-gwcw505',
    899000, 0,
    '/images/products/_o_web_3b2942fceadc46408ee21184550cccd8_master.png',
    '/images/products/54850534122_abd94e6bc4_k_0366700a90854459af974377e28d3a30_master.jpg',
    0, 1, 'Torano', 'Đen,Xanh Navy,Xám', 'Áo Nam');

CALL proc_seed_product('AO-KHOAC', 'GWCW051',
    'Áo khoác bộ gió 2 lớp can phối mũ liền GWCW051',
    'ao-khoac-gio-2-lop-can-phoi-mu-lien-3-gwcw051',
    399000, 699000,
    '/images/products/5_3246ef0319354cdebefa12c46b16df67_master.png',
    '/images/products/54930091512_12e28ca3bc_c_5c170ac00dee4db195185811ca48e016_master.jpg',
    0, 0, 'Torano', 'Đen,Xanh Navy', 'Áo Nam');

CALL proc_seed_product('AO-KHOAC', 'GWCU051',
    'Áo khoác bomber lót lông thêu logo ngực GWCU051',
    'ao-khoac-bomber-lot-long-theu-logo-nguc-5-gwcu051',
    599000, 899000,
    '/images/products/8_3849787218384057ba447b05790935ce_master.png',
    '/images/products/54947149811_02e5e698a8_k_e943f1095ba846f0b97468759adf3318_master.jpg',
    0, 0, 'Torano', 'Đen,Nâu,Xanh rêu', 'Áo Nam');

CALL proc_seed_product('AO-KHOAC', 'GWCJ503',
    'Áo khoác khaki 2 lớp chần bông cổ bomber GWCJ503',
    'ao-khoac-khaki-2-lop-chan-bong-co-bomber-theu-logo-mat-sau-4-gwcj503',
    999000, 1299000,
    '/images/products/_o_web_fd9680326d1d47e5b772a6defbd19237_master.png',
    '/images/products/576869033_1252460493594196_3116353017788408982_n_356619ed176d4bdc8b7284fdcc8c782b_master.jpg',
    0, 0, 'Torano', 'Đen,Be', 'Áo Nam');

CALL proc_seed_product('AO-KHOAC', 'GWCL902',
    'Áo khoác da lộn basic cổ bẻ lót lông GWCL902',
    'ao-khoac-da-lon-basic-co-be-theu-logo-nguc-4-gwcl902',
    799000, 1099000,
    '/images/products/_o_web_6885a311ce9940899082e6aaac6555e9_master.png',
    '/images/products/577038858_1255218279985084_5252201006724013030_n_a50bbe37fade4c44ae5774983b5dd3fe_master.jpg',
    0, 0, 'Torano', 'Đen,Nâu,Be', 'Áo Nam');

CALL proc_seed_product('AO-KHOAC', 'GWCF004',
    'Áo khoác phao 3 lớp lót bông regularfit GWCF004',
    'ao-khoac-phao-3-lop-lot-bong-co-cao-regularfit-tron-gwcf004',
    699000, 1199000,
    '/images/products/_o_web_f03fa12180374293b18c50f93c3dd3fd_master.png',
    '/images/products/590729306_1268920281948217_8370921118819506715_n_07f456a575194ceca632fcdc9f6fcc47_master.jpg',
    0, 0, 'Torano', 'Đen,Xanh Navy,Xám', 'Áo Nam');

-- ──────────────────────────────────────
-- CAT 6: Áo Sơ Mi (6 sản phẩm)
-- ──────────────────────────────────────

CALL proc_seed_product('AO-SOMI', 'GATB011',
    'Áo sơ mi dài tay trơn GATB011',
    'so-mi-dai-tay-tron-1-gatb011',
    550000, 0,
    '/images/products/thiet_ke_chua_co_ten__5__c43044e163cf44329b0c081ddaff1e5c_master.png',
    '/images/products/595913189_1278756820964563_6438612972851276560_n_c14be49bb87e437f951df031135d2c60_master.jpg',
    0, 0, 'Torano', 'Trắng,Đen,Xanh Navy', 'Áo Nam');

CALL proc_seed_product('AO-SOMI', 'DATB920',
    'Áo sơ mi dài tay trơn Bamboo DATB920',
    'ao-so-mi-dai-tay-tron-bamboo-datb920',
    210000, 420000,
    '/images/products/tb920_a04cd3c42ae9458e9207fdccaf7bed48_master.png',
    '/images/products/600532210_1285691930271052_7217001211690083350_n_4f122840c25e45779b311cf4929e9544_master.jpg',
    0, 0, 'Torano', 'Trắng,Xám', 'Áo Nam');

CALL proc_seed_product('AO-SOMI', 'FATB001',
    'Sơ mi dài tay trơn dệt kim FATB001',
    'so-mi-dai-tay-tron-det-kim-3-fatb001',
    329000, 450000,
    '/images/products/tb001_c0675ef2b3a7434696f12bd8905d98e4_master.png',
    '/images/products/497728757_1107401171433463_2464759818378874823_n_e1e65cfc022749f7afe99b9960de023c_master.jpg',
    0, 0, 'Torano', 'Trắng,Đen,Be', 'Áo Nam');

CALL proc_seed_product('AO-SOMI', 'FATB002',
    'Sơ mi dài tay trơn FATB002',
    'so-mi-dai-tay-tron-5-fatb002',
    349000, 500000,
    '/images/products/tb002_de80d5dec15646a49b16d689b0873ac1_master.png',
    '/images/products/514694025_1144505567723023_2229080463376009636_n_2fc8f4d493e544a78e71b085a26bfbdb_master.jpg',
    0, 0, 'Torano', 'Trắng,Xanh Navy', 'Áo Nam');

CALL proc_seed_product('AO-SOMI', 'FSTP056',
    'Áo Polo trơn bề mặt hiệu ứng FSTP056',
    'ao-polo-tron-be-mat-hieu-ung-3-fstp056',
    380000, 0,
    '/images/products/thiet_ke_chua_co_ten__4__e085a9db930d492a9783a68d45d4d534_master.png',
    '/images/products/517136676_1147676020739311_4226858427086245361_n_0ebde8dbb9e64dc5959b35bbdd2a394c_master.jpg',
    0, 0, 'Torano', 'Đen,Xám,Xanh Navy', 'Áo Nam');

CALL proc_seed_product('AO-SOMI', 'FSTP046',
    'Áo Polo trơn bo kẻ FSTP046',
    'ao-polo-tron-bo-ke-1-fstp046',
    380000, 0,
    '/images/products/thiet_ke_chua_co_ten__4__2efaf64af4c942c4a3711b6f14fe808a_master.png',
    '/images/products/img_0232_54976947321_o_c42f07dcd0bc43fd84a484ee8cf1abcf_master.jpg',
    0, 0, 'Torano', 'Đen,Xanh Navy', 'Áo Nam');

-- ──────────────────────────────────────
-- CAT 7: Áo Nỉ / Hoodie (6 sản phẩm)
-- ──────────────────────────────────────

CALL proc_seed_product('AO-NI', 'GWTW823',
    'Áo nỉ họa tiết thêu logo ngựa GWTW823',
    'ao-ni-hoa-tiet-theu-logo-ngua-2-gwtw823',
    599000, 0,
    '/images/products/25_585e2dd08dfc4392b986ec1b3d115d74_master.png',
    '/images/products/54629081966_cbaaad4789_k_1ef0ed7dd60e4779afcb8259929ec3b1_master.jpg',
    0, 0, 'Torano', 'Đen,Xám,Xanh Navy', 'Áo Nam');

CALL proc_seed_product('AO-NI', 'GWTW824',
    'Áo nỉ họa tiết in tràn GWTW824',
    'ao-ni-hoa-tiet-in-tran-3-gwtw824',
    599000, 0,
    '/images/products/26_48c6beb5acd546ae860c015fe19dc154_master.png',
    '/images/products/54629287024_aa453ac2be_k_8bbc8777a0cc43d088864b6588a3cd3f_master.jpg',
    0, 0, 'Torano', 'Đen,Xanh Navy', 'Áo Nam');

CALL proc_seed_product('AO-NI', 'GWTW826',
    'Áo nỉ họa tiết thêu hình Unbridled ambition GWTW826',
    'ao-ni-hoa-tiet-theu-hinh-unbridled-ambition-3-gwtw826',
    599000, 0,
    '/images/products/27_3aa82df04f8b4f8788b4488d4c08f881_master.png',
    '/images/products/54629391780_548de97568_k_e76a147413104a67ab054854afcf4ae1_master.jpg',
    0, 0, 'Torano', 'Đen,Xám', 'Áo Nam');

CALL proc_seed_product('AO-NI', 'GWTW901',
    'Áo nỉ bộ can phối tay GWTW901',
    'ao-ni-can-phoi-tay-ao-basic-slimfit-5-gwtw901',
    399000, 599000,
    '/images/products/_o_web_500d269f1d9d4aafb2dbf9db640f63bd_master.png',
    '/images/products/5_3246ef0319354cdebefa12c46b16df67_master.png',
    0, 0, 'Torano', 'Đen,Xám,Xanh Navy', 'Áo Nam');

CALL proc_seed_product('AO-NI', 'FWTW001',
    'Áo nỉ bộ can phối tay FWTW001',
    'ao-ni-bo-can-phoi-tay-6-fwtw001',
    319000, 420000,
    '/images/products/19334a78-6cbb-4bbb-abeb-31088b5578ff_ea4d8d95d7fe424297ad95179a26f18b_master.jpg',
    '/images/products/8_3849787218384057ba447b05790935ce_master.png',
    0, 0, 'Torano', 'Đen,Xám', 'Áo Nam');

CALL proc_seed_product('AO-NI', 'FWTW002',
    'Áo nỉ Hoodie in tràn họa tiết TRN FWTW002',
    'ao-hoodie-in-tran-hoa-tiet-trn-1-fwtw002',
    650000, 0,
    '/images/products/thiet_ke_chua_co_ten__4__5f0ad70259c1470fbd5e51709ae99bd5_master.png',
    '/images/products/_o_web__1__0e9104c64a924e19a8f88bb29b3b5b51_master.png',
    0, 1, 'Torano', 'Đen,Xanh Navy', 'Áo Nam');

-- ──────────────────────────────────────
-- CAT 8: Phụ Kiện — Thắt lưng (6 sản phẩm)
-- ──────────────────────────────────────

CALL proc_seed_product('PHU-KIEN', 'GAAL002',
    'Thắt lưng da Torano GAAL002',
    'that-lung-da-torano-1-gaal002',
    599000, 0,
    '/images/products/al002_4e1ff963227346adafb51ca0e87efe27_master.png',
    '/images/products/54850534122_abd94e6bc4_k_0366700a90854459af974377e28d3a30_master.jpg',
    0, 0, 'Torano', 'Đen,Nâu', 'Freesize');

CALL proc_seed_product('PHU-KIEN', 'GAAL003',
    'Thắt lưng đầu xoay 2 màu Torano GAAL003',
    'that-lung-dau-xoay-2-mau-torano-1-gaal003',
    599000, 0,
    '/images/products/al003_6bbbf5c157ab4eefae2ddae428b4f01c_master.png',
    '/images/products/54930091512_12e28ca3bc_c_5c170ac00dee4db195185811ca48e016_master.jpg',
    0, 0, 'Torano', 'Đen,Nâu', 'Freesize');

CALL proc_seed_product('PHU-KIEN', 'GAAL007',
    'Thắt lưng đầu xoay 2 hiệu ứng Torano GAAL007',
    'that-lung-dau-xoay-2-hieu-ung-torano-1-gaal007',
    699000, 0,
    '/images/products/al007_378e77d4f8244c68897fc748d4665b3a_master.png',
    '/images/products/54947149811_02e5e698a8_k_e943f1095ba846f0b97468759adf3318_master.jpg',
    0, 0, 'Torano', 'Đen', 'Freesize');

CALL proc_seed_product('PHU-KIEN', 'GAAL015',
    'Thắt lưng da Torano GAAL015',
    'that-lung-da-torano-1-gaal015',
    799000, 0,
    '/images/products/al010_aa92a95073b0446e86a1d050436111d2_master.png',
    '/images/products/576869033_1252460493594196_3116353017788408982_n_356619ed176d4bdc8b7284fdcc8c782b_master.jpg',
    0, 0, 'Torano', 'Đen,Nâu', 'Freesize');

CALL proc_seed_product('PHU-KIEN', 'GAAL016',
    'Thắt lưng da Torano GAAL016',
    'that-lung-da-torano-1-gaal016',
    799000, 0,
    '/images/products/al011_63e4d647752348dfb69f2538e4e13982_master.png',
    '/images/products/577038858_1255218279985084_5252201006724013030_n_a50bbe37fade4c44ae5774983b5dd3fe_master.jpg',
    0, 0, 'Torano', 'Đen', 'Freesize');

CALL proc_seed_product('PHU-KIEN', 'GAAL012',
    'Thắt lưng da Torano GAAL012',
    'that-lung-da-torano-1-gaal012',
    699000, 0,
    '/images/products/al014_a9aad068cdb34d94b21abbbf81c6bbff_master.png',
    '/images/products/590729306_1268920281948217_8370921118819506715_n_07f456a575194ceca632fcdc9f6fcc47_master.jpg',
    0, 0, 'Torano', 'Đen,Nâu', 'Freesize');

-- ==============================================================================
-- 5. HERO BANNER SLIDES — seed vao cms_banner
-- ==============================================================================

INSERT IGNORE INTO cms_banner (cms_banner_id, cms_banner_title, cms_banner_subtitle, cms_banner_image, cms_banner_image_mobile, cms_banner_link, cms_banner_cta_text, cms_banner_position, cms_banner_sort, cms_banner_status) VALUES
(UUID(), 'Back In Form',       'Not just back to work — back with presence', '/images/theme/slide_1_img.jpg', '/images/theme/slide_1_mb.jpg', '/san-pham',           'KHÁM PHÁ NGAY', 'hero', 1, 1),
(UUID(), 'Embrace Holiday',    'FW Collection 2026',                         '/images/theme/slide_2_img.jpg', '/images/theme/slide_2_mb.jpg', '/danh-muc/ao-khoac',  'XEM BST',        'hero', 2, 1),
(UUID(), 'Sale Lên Đến 50%',   'Ưu đãi có hạn — chỉ trong tuần này',       '/images/theme/slide_3_img.jpg', '/images/theme/slide_3_mb.jpg', '/danh-muc/ao-polo',   'MUA NGAY',       'hero', 3, 1),
(UUID(), 'Lookbook For Men',   'Phong cách — Lịch lãm — Đẳng cấp',        '/images/theme/slide_4_img.jpg', '/images/theme/slide_4_mb.jpg', '/san-pham',           'KHÁM PHÁ',      'hero', 4, 1);

-- ==============================================================================
-- 6. REVIEWS — seed vao sal_review
-- ==============================================================================

-- Tim product GSTP068 de gan review
INSERT INTO sal_review (sal_review_id, cat_product_id, sal_review_customer_name, sal_review_rating, sal_review_content, sal_review_is_verified, created_date)
SELECT UUID(), cp.cat_product_id, 'Nguyễn Văn Minh', 5,
    'Chất vải rất đẹp, mặc thoáng mát. Form đúng size, không cần đổi. Rất hài lòng!',
    1, '2026-04-10 08:00:00'
FROM cat_product cp WHERE cp.cat_product_code = 'GSTP068';

INSERT INTO sal_review (sal_review_id, cat_product_id, sal_review_customer_name, sal_review_rating, sal_review_content, sal_review_is_verified, created_date)
SELECT UUID(), cp.cat_product_id, 'Trần Thị Hồng', 4,
    'Mua tặng chồng, anh ấy rất thích. Trừ 1 sao vì giao hàng hơi chậm.',
    1, '2026-04-05 12:00:00'
FROM cat_product cp WHERE cp.cat_product_code = 'GSTP068';

INSERT INTO sal_review (sal_review_id, cat_product_id, sal_review_customer_name, sal_review_rating, sal_review_content, sal_review_is_verified, created_date)
SELECT UUID(), cp.cat_product_id, 'Lê Quốc Anh', 5,
    'Mua lần 2 rồi. Cổ áo cứng cáp, giặt nhiều lần vẫn giữ form. Đáng tiền!',
    1, '2026-03-28 15:00:00'
FROM cat_product cp WHERE cp.cat_product_code = 'GSTP068';

INSERT INTO sal_review (sal_review_id, cat_product_id, sal_review_customer_name, sal_review_rating, sal_review_content, sal_review_is_verified, created_date)
SELECT UUID(), cp.cat_product_id, 'Phạm Đức Huy', 4,
    'Áo đẹp, đường may tỉ mỉ. Màu navy rất sang. Sẽ mua thêm màu đen.',
    0, '2026-03-20 09:30:00'
FROM cat_product cp WHERE cp.cat_product_code = 'GSTP068';

INSERT INTO sal_review (sal_review_id, cat_product_id, sal_review_customer_name, sal_review_rating, sal_review_content, sal_review_is_verified, created_date)
SELECT UUID(), cp.cat_product_id, 'Hoàng Thế Vinh', 5,
    'Torano chất lượng ổn định. Mua 3 cái cho 3 anh em, ai cũng khen.',
    1, '2026-03-15 16:00:00'
FROM cat_product cp WHERE cp.cat_product_code = 'GSTP068';

-- ==============================================================================
-- 7. Cleanup: xoa procedure sau khi seed xong
-- ==============================================================================

DROP PROCEDURE IF EXISTS proc_seed_product;

-- Thong ke sau seed
SELECT 'Categories' AS entity, COUNT(*) AS total FROM cat_category
UNION ALL
SELECT 'Products', COUNT(*) FROM cat_product
UNION ALL
SELECT 'Variants', COUNT(*) FROM cat_product_variant
UNION ALL
SELECT 'Media', COUNT(*) FROM cat_product_media
UNION ALL
SELECT 'Reviews', COUNT(*) FROM sal_review;
