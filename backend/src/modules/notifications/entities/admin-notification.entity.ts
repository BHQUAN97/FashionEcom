import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

/**
 * Notification cho admin — don moi, nhac chua duyet, su co
 * Type: new_order, pending_payment, pending_order, shipping_incident, hourly_summary, system
 */
@Entity('sys_admin_notification')
export class AdminNotificationEntity {
  @PrimaryColumn('char', { length: 36, name: 'sys_admin_notification_id', default: () => '(UUID())' })
  sysAdminNotificationId!: string;

  /** NULL = gui cho tat ca admin */
  @Column({ name: 'sys_user_id', type: 'char', length: 36, nullable: true })
  sysUserId!: string | null;

  @Column({ name: 'sys_admin_notification_type', type: 'varchar', length: 30 })
  sysAdminNotificationType!: string;

  @Column({ name: 'sys_admin_notification_title', type: 'varchar', length: 255 })
  sysAdminNotificationTitle!: string;

  @Column({ name: 'sys_admin_notification_body', type: 'text' })
  sysAdminNotificationBody!: string;

  @Column({ name: 'sys_admin_notification_data', type: 'json', nullable: true })
  sysAdminNotificationData!: Record<string, unknown> | null;

  @Column({ name: 'sys_admin_notification_read', type: 'tinyint', default: 0 })
  sysAdminNotificationRead!: number;

  @Column({ name: 'sys_admin_notification_read_at', type: 'datetime', nullable: true })
  sysAdminNotificationReadAt!: Date | null;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;
}
