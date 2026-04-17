import { Entity, Column, PrimaryColumn } from 'typeorm';

/**
 * Entity sys_sync_config — cau hinh dong bo Google Sheets/Drive
 */
@Entity('sys_sync_config')
export class SyncConfigEntity {
  @PrimaryColumn('char', { length: 36, name: 'sys_sync_config_id', default: () => '(UUID())' })
  sysSyncConfigId!: string;

  @Column({ name: 'sys_sync_config_name', type: 'varchar', length: 255 })
  sysSyncConfigName!: string;

  @Column({ name: 'sys_sync_config_type', type: 'varchar', length: 20, default: 'google_sheets' })
  sysSyncConfigType!: string;

  @Column({ name: 'sys_sync_config_source_url', type: 'varchar', length: 500, nullable: true })
  sysSyncConfigSourceUrl!: string | null;

  @Column({ name: 'sys_sync_config_sheet_id', type: 'varchar', length: 100, nullable: true })
  sysSyncConfigSheetId!: string | null;

  @Column({ name: 'sys_sync_config_sheet_name', type: 'varchar', length: 100, default: 'Sheet1' })
  sysSyncConfigSheetName!: string;

  @Column({ name: 'sys_sync_config_target', type: 'varchar', length: 50, default: 'product' })
  sysSyncConfigTarget!: string;

  @Column({ name: 'sys_sync_config_column_mapping', type: 'json', nullable: true })
  sysSyncConfigColumnMapping!: Record<string, string> | null;

  @Column({ name: 'sys_sync_config_auto_sync', type: 'tinyint', default: 0 })
  sysSyncConfigAutoSync!: number;

  @Column({ name: 'sys_sync_config_interval_minutes', type: 'int', default: 30 })
  sysSyncConfigIntervalMinutes!: number;

  @Column({ name: 'sys_sync_config_last_sync_at', type: 'datetime', nullable: true })
  sysSyncConfigLastSyncAt!: Date | null;

  @Column({ name: 'sys_sync_config_status', type: 'varchar', length: 20, default: 'active' })
  sysSyncConfigStatus!: string;

  @Column({ name: 'sys_sync_config_error_message', type: 'text', nullable: true })
  sysSyncConfigErrorMessage!: string | null;

  @Column({ name: 'created_by', type: 'char', length: 36, nullable: true })
  createdBy!: string | null;

  @Column({ name: 'created_date', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdDate!: Date;

  @Column({ name: 'modified_date', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  modifiedDate!: Date;
}
