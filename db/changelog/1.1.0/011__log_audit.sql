-- =============================================
-- Author:      Claude Code
-- Create date: 2026-04-10
-- Description: Tao bang nhat ky hanh dong admin
-- =============================================

USE fashion_ecom;

CREATE TABLE log_audit (
    log_audit_id CHAR(36) DEFAULT (UUID()) PRIMARY KEY COMMENT 'ID audit log',
    log_audit_action VARCHAR(20) NOT NULL COMMENT 'create, update, delete',
    log_audit_entity_type VARCHAR(50) NOT NULL COMMENT 'product, order, customer, user, category, inventory',
    log_audit_entity_id CHAR(36) NOT NULL COMMENT 'ID cua entity bi thay doi',
    log_audit_changes TEXT NULL COMMENT 'JSON diff { field: { old, new } }',
    log_audit_ip VARCHAR(45) NULL COMMENT 'IP nguoi thuc hien',
    sys_user_id CHAR(36) NOT NULL COMMENT 'Admin user thuc hien',
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP
) COMMENT 'Nhat ky hanh dong admin';

CREATE INDEX ix_logaudit_entitytype_entityid ON log_audit(log_audit_entity_type, log_audit_entity_id);
CREATE INDEX ix_logaudit_sysuserid ON log_audit(sys_user_id);
CREATE INDEX ix_logaudit_createddate ON log_audit(created_date);
