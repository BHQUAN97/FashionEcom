import { Entity, Column, PrimaryColumn, CreateDateColumn, Index } from 'typeorm';

/**
 * Entity log_system — nhat ky HTTP request/response + errors
 * Luu tat ca 4xx/5xx va sample 2xx (theo config)
 * Tuong tu NLog: level, timestamp, method, url, status, duration, error
 */
@Entity('log_system')
@Index('ix_log_system_level', ['logSystemLevel'])
@Index('ix_log_system_status', ['logSystemStatus'])
@Index('ix_log_system_created', ['createdDate'])
@Index('ix_log_system_method_url', ['logSystemMethod', 'logSystemUrl'])
export class SystemLogEntity {
  @PrimaryColumn('char', { length: 36, name: 'log_system_id', default: () => '(UUID())' })
  logSystemId!: string;

  /** Log level: DEBUG, INFO, WARN, ERROR, FATAL */
  @Column({ name: 'log_system_level', type: 'varchar', length: 10 })
  logSystemLevel!: string;

  /** HTTP method: GET, POST, PUT, DELETE, PATCH */
  @Column({ name: 'log_system_method', type: 'varchar', length: 10 })
  logSystemMethod!: string;

  /** URL path (khong bao gom host) */
  @Column({ name: 'log_system_url', type: 'varchar', length: 500 })
  logSystemUrl!: string;

  /** HTTP status code */
  @Column({ name: 'log_system_status', type: 'smallint' })
  logSystemStatus!: number;

  /** Response time (ms) */
  @Column({ name: 'log_system_duration', type: 'int', default: 0 })
  logSystemDuration!: number;

  /** Request body (truncated, chi ghi cho POST/PUT, bo password) */
  @Column({ name: 'log_system_request_body', type: 'text', nullable: true })
  logSystemRequestBody!: string | null;

  /** Error message (cho 4xx/5xx) */
  @Column({ name: 'log_system_error', type: 'text', nullable: true })
  logSystemError!: string | null;

  /** Stack trace (cho 5xx) */
  @Column({ name: 'log_system_stack', type: 'text', nullable: true })
  logSystemStack!: string | null;

  /** User ID (neu da dang nhap) */
  @Column({ name: 'sys_user_id', type: 'char', length: 36, nullable: true })
  sysUserId!: string | null;

  /** Client IP */
  @Column({ name: 'log_system_ip', type: 'varchar', length: 45, nullable: true })
  logSystemIp!: string | null;

  /** User Agent */
  @Column({ name: 'log_system_user_agent', type: 'varchar', length: 500, nullable: true })
  logSystemUserAgent!: string | null;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;
}
