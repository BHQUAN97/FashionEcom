-- =============================================
-- Author:      FashionEcom
-- Create date: 2026-04-10
-- Description: Bo sung cot admin reply vao sal_review
-- =============================================

ALTER TABLE sal_review ADD COLUMN IF NOT EXISTS sal_review_admin_reply TEXT NULL COMMENT 'Phan hoi tu Admin (Official Reply)' AFTER sal_review_content;
ALTER TABLE sal_review ADD COLUMN IF NOT EXISTS sal_review_admin_reply_date DATETIME NULL COMMENT 'Ngay admin phan hoi' AFTER sal_review_admin_reply;
ALTER TABLE sal_review ADD COLUMN IF NOT EXISTS sal_review_admin_reply_by CHAR(36) NULL COMMENT 'Admin ID phan hoi' AFTER sal_review_admin_reply_date;
