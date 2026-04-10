-- =============================================
-- Author:      FashionEcom Dev
-- Create date: 2026-04-10
-- Description: Tao bang cms_email_template — mau email tu dong
-- =============================================

CREATE TABLE IF NOT EXISTS cms_email_template (
    cms_email_template_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY
        COMMENT 'ID toan cuc cua Email Template',
    cms_email_template_key VARCHAR(50) NOT NULL
        COMMENT 'Key: order_confirmation, welcome, password_reset, ...',
    cms_email_template_subject VARCHAR(255) NOT NULL
        COMMENT 'Subject line email',
    cms_email_template_body TEXT NOT NULL
        COMMENT 'Noi dung HTML body (co the chua {{variables}})',
    cms_email_template_variables JSON NULL
        COMMENT 'Metadata cac variables kha dung: [{key, label, sample}]',
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        COMMENT 'Lan cap nhat cuoi'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  COMMENT 'Mau email tu dong gui theo su kien he thong';

CREATE UNIQUE INDEX uix_cmsemailtemplate_key ON cms_email_template(cms_email_template_key);

-- Seed default email templates
INSERT INTO cms_email_template (cms_email_template_key, cms_email_template_subject, cms_email_template_body, cms_email_template_variables) VALUES
('welcome', 'Chao mung ban den voi FashionEcom!', '<h2>Xin chao {{customer_name}},</h2><p>Cam on ban da dang ky tai khoan tai FashionEcom.</p>', '[{"key":"customer_name","label":"Ten khach hang","sample":"Nguyen Van A"}]'),
('order_confirmation', 'Xac nhan don hang #{{order_code}}', '<h2>Don hang cua ban da duoc tiep nhan</h2><p>Ma don: <strong>{{order_code}}</strong></p><p>Tong tien: {{order_total}}</p>', '[{"key":"order_code","label":"Ma don hang","sample":"ORD-001"},{"key":"order_total","label":"Tong tien","sample":"500,000đ"}]'),
('order_shipped', 'Don hang #{{order_code}} dang duoc giao', '<h2>Don hang cua ban da duoc gui di</h2><p>Ma van don: <strong>{{tracking_code}}</strong></p>', '[{"key":"order_code","label":"Ma don hang","sample":"ORD-001"},{"key":"tracking_code","label":"Ma van don","sample":"GHN123456"}]'),
('order_delivered', 'Don hang #{{order_code}} da giao thanh cong', '<h2>Don hang cua ban da giao thanh cong!</h2><p>Hay danh gia san pham de nhan diem thuong.</p>', '[{"key":"order_code","label":"Ma don hang","sample":"ORD-001"}]'),
('password_reset', 'Dat lai mat khau FashionEcom', '<h2>Dat lai mat khau</h2><p>Click vao link ben duoi de dat lai mat khau:</p><p><a href="{{reset_link}}">Dat lai mat khau</a></p>', '[{"key":"reset_link","label":"Link dat lai","sample":"https://fashionecom.vn/reset?token=xxx"}]'),
('order_cancelled', 'Don hang #{{order_code}} da bi huy', '<h2>Don hang cua ban da bi huy</h2><p>Ly do: {{cancel_reason}}</p>', '[{"key":"order_code","label":"Ma don hang","sample":"ORD-001"},{"key":"cancel_reason","label":"Ly do huy","sample":"Khach yeu cau huy"}]'),
('flash_sale_notify', 'Flash Sale bat dau!', '<h2>{{sale_title}}</h2><p>Giam den {{max_discount}}% — chi tu {{start_time}} den {{end_time}}!</p>', '[{"key":"sale_title","label":"Ten flash sale","sample":"Flash Sale Thu 6"},{"key":"max_discount","label":"% giam toi da","sample":"50"},{"key":"start_time","label":"Gio bat dau","sample":"12:00"},{"key":"end_time","label":"Gio ket thuc","sample":"14:00"}]'),
('discount_code', 'Ma giam gia danh rieng cho ban!', '<h2>Ban nhan duoc ma giam gia!</h2><p>Ma: <strong>{{discount_code}}</strong></p><p>Giam {{discount_value}} — het han {{expiry_date}}</p>', '[{"key":"discount_code","label":"Ma giam gia","sample":"SALE50"},{"key":"discount_value","label":"Gia tri giam","sample":"50%"},{"key":"expiry_date","label":"Ngay het han","sample":"30/04/2026"}]');
