import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

/**
 * Entity log_analytics_event — raw events tu FE (page views, cart, checkout, search)
 */
@Entity('log_analytics_event')
export class AnalyticsEventEntity {
  @PrimaryColumn('char', { length: 36, name: 'log_analytics_event_id', default: () => '(UUID())' })
  logAnalyticsEventId!: string;

  @Column({ name: 'log_analytics_event_type', type: 'varchar', length: 50 })
  logAnalyticsEventType!: string;

  @Column({ name: 'log_analytics_event_data', type: 'json', nullable: true })
  logAnalyticsEventData!: Record<string, unknown> | null;

  @Column({ name: 'log_analytics_event_session_id', type: 'varchar', length: 100 })
  logAnalyticsEventSessionId!: string;

  @Column({ name: 'sys_customer_id', type: 'char', length: 36, nullable: true })
  sysCustomerId!: string | null;

  @Column({ name: 'log_analytics_event_device', type: 'varchar', length: 20, nullable: true })
  logAnalyticsEventDevice!: string | null;

  @Column({ name: 'log_analytics_event_source', type: 'varchar', length: 50, nullable: true })
  logAnalyticsEventSource!: string | null;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;
}
