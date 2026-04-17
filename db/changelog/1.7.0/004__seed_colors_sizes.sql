-- =============================================
-- Author:      Claude Code
-- Create date: 2026-04-15
-- Description: Seed mau sac va kich thuoc tu data variant hien co
-- =============================================

USE fashion_ecom;

-- Seed colors tu variant text hien co
INSERT IGNORE INTO cat_color (cat_color_id, cat_color_name, cat_color_hex, cat_color_sort, cat_color_status) VALUES
(UUID(), 'Den',         '#1a1a1a', 1, 1),
(UUID(), 'Trang',       '#ffffff', 2, 1),
(UUID(), 'Kem',         '#f5f0e1', 3, 1),
(UUID(), 'Do Ca Ro',    '#c0392b', 4, 1),
(UUID(), 'Xanh Ca Ro',  '#2980b9', 5, 1),
(UUID(), 'Xanh Dam',    '#1a3c5e', 6, 1),
(UUID(), 'Xanh Nhe',    '#5dade2', 7, 1),
(UUID(), 'Nau',         '#6d4c41', 8, 1),
(UUID(), 'Xam',         '#808080', 9, 1);

-- Tao 2 nhom size: Quan ao (S/M/L/XL) va Quan so (26-32) va Ao dai (cm)
INSERT INTO cat_size_group (cat_size_group_id, cat_size_group_name, cat_size_group_values, cat_size_group_sort) VALUES
(UUID(), 'Quan Ao', '["M","L","XL"]', 1),
(UUID(), 'Quan So', '["26","28","30","32"]', 2),
(UUID(), 'Ao Dai', '["110cm"]', 3);

-- Seed cat_size tu cac nhom
-- Nhom Quan Ao
INSERT INTO cat_size (cat_size_id, cat_size_group_id, cat_size_value, cat_size_sort, cat_size_status)
SELECT UUID(), sg.cat_size_group_id, 'M', 1, 1 FROM cat_size_group sg WHERE sg.cat_size_group_name = 'Quan Ao'
UNION ALL
SELECT UUID(), sg.cat_size_group_id, 'L', 2, 1 FROM cat_size_group sg WHERE sg.cat_size_group_name = 'Quan Ao'
UNION ALL
SELECT UUID(), sg.cat_size_group_id, 'XL', 3, 1 FROM cat_size_group sg WHERE sg.cat_size_group_name = 'Quan Ao';

-- Nhom Quan So
INSERT INTO cat_size (cat_size_id, cat_size_group_id, cat_size_value, cat_size_sort, cat_size_status)
SELECT UUID(), sg.cat_size_group_id, '26', 1, 1 FROM cat_size_group sg WHERE sg.cat_size_group_name = 'Quan So'
UNION ALL
SELECT UUID(), sg.cat_size_group_id, '28', 2, 1 FROM cat_size_group sg WHERE sg.cat_size_group_name = 'Quan So'
UNION ALL
SELECT UUID(), sg.cat_size_group_id, '30', 3, 1 FROM cat_size_group sg WHERE sg.cat_size_group_name = 'Quan So'
UNION ALL
SELECT UUID(), sg.cat_size_group_id, '32', 4, 1 FROM cat_size_group sg WHERE sg.cat_size_group_name = 'Quan So';

-- Nhom Ao Dai
INSERT INTO cat_size (cat_size_id, cat_size_group_id, cat_size_value, cat_size_sort, cat_size_status)
SELECT UUID(), sg.cat_size_group_id, '110cm', 1, 1 FROM cat_size_group sg WHERE sg.cat_size_group_name = 'Ao Dai';
