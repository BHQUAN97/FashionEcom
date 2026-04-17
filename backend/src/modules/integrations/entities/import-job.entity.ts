import { Entity, Column, PrimaryColumn } from 'typeorm';

/**
 * Entity sys_import_job — lich su cac lan import/sync du lieu
 */
@Entity('sys_import_job')
export class ImportJobEntity {
  @PrimaryColumn('char', { length: 36, name: 'sys_import_job_id', default: () => '(UUID())' })
  sysImportJobId!: string;

  @Column({ name: 'sys_sync_config_id', type: 'char', length: 36, nullable: true })
  sysSyncConfigId!: string | null;

  @Column({ name: 'sys_import_job_source', type: 'varchar', length: 20 })
  sysImportJobSource!: string;

  @Column({ name: 'sys_import_job_target', type: 'varchar', length: 50, default: 'product' })
  sysImportJobTarget!: string;

  @Column({ name: 'sys_import_job_file_name', type: 'varchar', length: 255, nullable: true })
  sysImportJobFileName!: string | null;

  @Column({ name: 'sys_import_job_status', type: 'varchar', length: 20, default: 'pending' })
  sysImportJobStatus!: string;

  @Column({ name: 'sys_import_job_total_rows', type: 'int', default: 0 })
  sysImportJobTotalRows!: number;

  @Column({ name: 'sys_import_job_created', type: 'int', default: 0 })
  sysImportJobCreated!: number;

  @Column({ name: 'sys_import_job_updated', type: 'int', default: 0 })
  sysImportJobUpdated!: number;

  @Column({ name: 'sys_import_job_skipped', type: 'int', default: 0 })
  sysImportJobSkipped!: number;

  @Column({ name: 'sys_import_job_errors', type: 'int', default: 0 })
  sysImportJobErrors!: number;

  @Column({ name: 'sys_import_job_error_details', type: 'json', nullable: true })
  sysImportJobErrorDetails!: Array<{ row: number; field: string; message: string }> | null;

  @Column({ name: 'sys_import_job_started_at', type: 'datetime', nullable: true })
  sysImportJobStartedAt!: Date | null;

  @Column({ name: 'sys_import_job_finished_at', type: 'datetime', nullable: true })
  sysImportJobFinishedAt!: Date | null;

  @Column({ name: 'created_by', type: 'char', length: 36, nullable: true })
  createdBy!: string | null;

  @Column({ name: 'created_date', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  createdDate!: Date;
}
