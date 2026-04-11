import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('log_access')
export class AccessLogEntity {
  @PrimaryColumn('char', { length: 36, name: 'log_access_id', default: () => '(UUID())' })
  logAccessId!: string;

  @Column({ name: 'sys_user_id', type: 'char', length: 36, nullable: true })
  sysUserId!: string | null;

  @Column({ name: 'log_access_email', type: 'varchar', length: 100 })
  logAccessEmail!: string;

  @Column({ name: 'log_access_success', type: 'tinyint', default: 0 })
  logAccessSuccess!: number;

  @Column({ name: 'log_access_ip', type: 'varchar', length: 50 })
  logAccessIp!: string;

  @Column({ name: 'log_access_user_agent', type: 'varchar', length: 500, nullable: true })
  logAccessUserAgent!: string | null;

  @Column({ name: 'log_access_geo', type: 'varchar', length: 100, nullable: true })
  logAccessGeo!: string | null;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;
}

@Entity('sys_password_history')
export class PasswordHistoryEntity {
  @PrimaryColumn('char', { length: 36, name: 'sys_password_history_id', default: () => '(UUID())' })
  sysPasswordHistoryId!: string;

  @Column({ name: 'sys_user_id', type: 'char', length: 36 })
  sysUserId!: string;

  @Column({ name: 'sys_password_history_hash', type: 'varchar', length: 255 })
  sysPasswordHistoryHash!: string;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;
}
