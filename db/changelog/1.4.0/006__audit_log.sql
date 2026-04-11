-- =============================================
-- Author:      FashionEcom
-- Create date: 2026-04-10
-- Description: Bang audit log nang cao — them entity_name, user_agent
-- =============================================

-- Them cot vao bang log_audit hien co (neu chua co)
ALTER TABLE log_audit ADD COLUMN IF NOT EXISTS log_audit_entity_name VARCHAR(255) NULL COMMENT 'Ten doi tuong (de doc log khong can join)' AFTER log_audit_entity_id;
ALTER TABLE log_audit ADD COLUMN IF NOT EXISTS log_audit_user_agent VARCHAR(500) NULL COMMENT 'Browser User-Agent' AFTER log_audit_ip;
