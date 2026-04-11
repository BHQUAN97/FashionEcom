import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

/**
 * Entity log_audit — nhat ky hanh dong admin (who/when/what/diff)
 * Enhanced Phase 5: them entity_name, user_agent
 */
@Entity('log_audit')
export class AuditLogEntity {
  @PrimaryColumn('char', { length: 36, name: 'log_audit_id', default: () => '(UUID())' })
  logAuditId!: string;

  @Column({ name: 'log_audit_action', type: 'varchar', length: 20 })
  logAuditAction!: string;

  @Column({ name: 'log_audit_entity_type', type: 'varchar', length: 50 })
  logAuditEntityType!: string;

  @Column({ name: 'log_audit_entity_id', type: 'char', length: 36 })
  logAuditEntityId!: string;

  @Column({ name: 'log_audit_entity_name', type: 'varchar', length: 255, nullable: true })
  logAuditEntityName!: string | null;

  @Column({ name: 'log_audit_changes', type: 'text', nullable: true })
  logAuditChanges!: string | null;

  @Column({ name: 'log_audit_ip', type: 'varchar', length: 45, nullable: true })
  logAuditIp!: string | null;

  @Column({ name: 'log_audit_user_agent', type: 'varchar', length: 500, nullable: true })
  logAuditUserAgent!: string | null;

  @Column({ name: 'sys_user_id', type: 'char', length: 36 })
  sysUserId!: string;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;
}
