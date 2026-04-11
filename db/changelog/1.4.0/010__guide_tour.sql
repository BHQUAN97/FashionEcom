-- =============================================
-- Author:      FashionEcom
-- Create date: 2026-04-10
-- Description: Guided Tour cho Admin UI — cau hinh + trang thai hoan thanh
-- =============================================

CREATE TABLE sys_guide_tour (
    sys_guide_tour_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID guide tour',
    sys_guide_tour_screen_id VARCHAR(50) NOT NULL COMMENT 'Screen identifier (VD: admin.orders, admin.products.create)',
    sys_guide_tour_title VARCHAR(255) NOT NULL COMMENT 'Tieu de tour',
    sys_guide_tour_roles JSON NOT NULL COMMENT 'Danh sach role duoc hien thi: [1, 2, 3]',
    sys_guide_tour_steps JSON NOT NULL COMMENT 'Cac buoc: [{ title, description, selector, position }]',
    sys_guide_tour_status TINYINT NOT NULL DEFAULT 1 COMMENT '0: Tat, 1: Bat',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngay tao',
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Ngay cap nhat'
) COMMENT 'Cau hinh Guided Tour cho tung man hinh Admin';

CREATE UNIQUE INDEX uix_sysguidetour_screenid ON sys_guide_tour(sys_guide_tour_screen_id);

CREATE TABLE sys_guide_tour_completion (
    sys_guide_tour_completion_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID da xem tour',
    sys_user_id CHAR(36) NOT NULL COMMENT 'Admin da xem',
    sys_guide_tour_screen_id VARCHAR(50) NOT NULL COMMENT 'Man hinh da xem',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngay hoan thanh/skip',
    CONSTRAINT fk_sysguidetourcompletion_sysuser FOREIGN KEY (sys_user_id) REFERENCES sys_user(sys_user_id) ON DELETE CASCADE
) COMMENT 'Trang thai hoan thanh Guide Tour cua tung admin user';

CREATE UNIQUE INDEX uix_sysguidetourcompletion_user_screen ON sys_guide_tour_completion(sys_user_id, sys_guide_tour_screen_id);
