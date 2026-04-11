import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('sys_notification')
export class NotificationEntity {
  @PrimaryColumn('char', { length: 36, name: 'sys_notification_id', default: () => '(UUID())' })
  sysNotificationId!: string;

  @Column({ name: 'sys_customer_id', type: 'char', length: 36, nullable: true })
  sysCustomerId!: string | null;

  @Column({ name: 'sys_notification_type', type: 'varchar', length: 50 })
  sysNotificationType!: string;

  @Column({ name: 'sys_notification_title', type: 'varchar', length: 255 })
  sysNotificationTitle!: string;

  @Column({ name: 'sys_notification_body', type: 'text' })
  sysNotificationBody!: string;

  @Column({ name: 'sys_notification_data', type: 'json', nullable: true })
  sysNotificationData!: Record<string, unknown> | null;

  @Column({ name: 'sys_notification_channel', type: 'tinyint', default: 0 })
  sysNotificationChannel!: number;

  @Column({ name: 'sys_notification_status', type: 'tinyint', default: 0 })
  sysNotificationStatus!: number;

  @Column({ name: 'sys_notification_sent_at', type: 'datetime', nullable: true })
  sysNotificationSentAt!: Date | null;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;
}

@Entity('sys_push_subscription')
export class PushSubscriptionEntity {
  @PrimaryColumn('char', { length: 36, name: 'sys_push_subscription_id', default: () => '(UUID())' })
  sysPushSubscriptionId!: string;

  @Column({ name: 'sys_customer_id', type: 'char', length: 36 })
  sysCustomerId!: string;

  @Column({ name: 'sys_push_subscription_endpoint', type: 'varchar', length: 500 })
  sysPushSubscriptionEndpoint!: string;

  @Column({ name: 'sys_push_subscription_keys', type: 'json' })
  sysPushSubscriptionKeys!: { p256dh: string; auth: string };

  @Column({ name: 'sys_push_subscription_user_agent', type: 'varchar', length: 255, nullable: true })
  sysPushSubscriptionUserAgent!: string | null;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;
}
