-- =============================================
-- Author:      Claude Code
-- Create date: 2026-04-15
-- Description: Tables for import/sync with Google Sheets & file upload
-- =============================================

-- Bang cau hinh dong bo Google Sheets
CREATE TABLE IF NOT EXISTS `sys_sync_config` (
  `sys_sync_config_id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `sys_sync_config_name` VARCHAR(255) NOT NULL COMMENT 'Ten cau hinh, VD: "Catalog chinh"',
  `sys_sync_config_type` VARCHAR(20) NOT NULL DEFAULT 'google_sheets' COMMENT 'google_sheets | google_drive | manual',
  `sys_sync_config_source_url` VARCHAR(500) NULL COMMENT 'URL Google Sheet hoac folder Drive',
  `sys_sync_config_sheet_id` VARCHAR(100) NULL COMMENT 'Google Sheet ID (trich tu URL)',
  `sys_sync_config_sheet_name` VARCHAR(100) NULL DEFAULT 'Sheet1' COMMENT 'Ten tab sheet',
  `sys_sync_config_target` VARCHAR(50) NOT NULL DEFAULT 'product' COMMENT 'product | inventory | customer | price',
  `sys_sync_config_column_mapping` JSON NULL COMMENT 'Map cot sheet → field DB, VD: {"A":"product_name","B":"sku"}',
  `sys_sync_config_auto_sync` TINYINT NOT NULL DEFAULT 0 COMMENT 'Bat/tat tu dong sync',
  `sys_sync_config_interval_minutes` INT NOT NULL DEFAULT 30 COMMENT 'Khoang cach giua cac lan sync (phut)',
  `sys_sync_config_last_sync_at` DATETIME NULL COMMENT 'Lan sync cuoi',
  `sys_sync_config_status` VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT 'active | paused | error',
  `sys_sync_config_error_message` TEXT NULL COMMENT 'Loi gan nhat neu co',
  `created_by` CHAR(36) NULL,
  `created_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`sys_sync_config_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_ci
COMMENT='Cau hinh dong bo du lieu tu Google Sheets/Drive';

-- Bang lich su import
CREATE TABLE IF NOT EXISTS `sys_import_job` (
  `sys_import_job_id` CHAR(36) NOT NULL DEFAULT (UUID()),
  `sys_sync_config_id` CHAR(36) NULL COMMENT 'FK toi sync_config (NULL neu upload file thu cong)',
  `sys_import_job_source` VARCHAR(20) NOT NULL COMMENT 'file_upload | google_sheets | google_drive',
  `sys_import_job_target` VARCHAR(50) NOT NULL DEFAULT 'product' COMMENT 'product | inventory | customer | price',
  `sys_import_job_file_name` VARCHAR(255) NULL COMMENT 'Ten file goc (neu upload)',
  `sys_import_job_status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'pending | processing | completed | failed | cancelled',
  `sys_import_job_total_rows` INT NOT NULL DEFAULT 0 COMMENT 'Tong so dong',
  `sys_import_job_created` INT NOT NULL DEFAULT 0 COMMENT 'So dong tao moi',
  `sys_import_job_updated` INT NOT NULL DEFAULT 0 COMMENT 'So dong cap nhat',
  `sys_import_job_skipped` INT NOT NULL DEFAULT 0 COMMENT 'So dong bo qua',
  `sys_import_job_errors` INT NOT NULL DEFAULT 0 COMMENT 'So dong loi',
  `sys_import_job_error_details` JSON NULL COMMENT 'Chi tiet loi tung dong [{row, field, message}]',
  `sys_import_job_started_at` DATETIME NULL,
  `sys_import_job_finished_at` DATETIME NULL,
  `created_by` CHAR(36) NULL,
  `created_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`sys_import_job_id`),
  INDEX `ix_sys_import_job_config` (`sys_sync_config_id`),
  INDEX `ix_sys_import_job_status` (`sys_import_job_status`),
  INDEX `ix_sys_import_job_created` (`created_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_as_ci
COMMENT='Lich su cac lan import/sync du lieu';
