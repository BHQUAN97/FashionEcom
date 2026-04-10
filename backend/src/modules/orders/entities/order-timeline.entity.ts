import { Entity, Column, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { OrderEntity } from './order.entity';

/**
 * Entity sal_order_timeline — hanh trinh don hang theo thoi gian
 */
@Entity('sal_order_timeline')
export class OrderTimelineEntity {
  @PrimaryColumn('char', { length: 36, name: 'sal_order_timeline_id', default: () => '(UUID())' })
  salOrderTimelineId!: string;

  @Column({ name: 'sal_order_id', type: 'char', length: 36 })
  salOrderId!: string;

  @Column({ name: 'sal_order_timeline_step', type: 'tinyint' })
  salOrderTimelineStep!: number;

  @Column({ name: 'sal_order_timeline_status', type: 'varchar', length: 30 })
  salOrderTimelineStatus!: string;

  @Column({ name: 'sal_order_timeline_label', type: 'varchar', length: 100 })
  salOrderTimelineLabel!: string;

  @Column({ name: 'sal_order_timeline_note', type: 'text', nullable: true })
  salOrderTimelineNote!: string | null;

  @Column({ name: 'sal_order_timeline_actor', type: 'varchar', length: 100, nullable: true })
  salOrderTimelineActor!: string | null;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;

  // Relations
  @ManyToOne(() => OrderEntity, (o) => o.timeline)
  @JoinColumn({ name: 'sal_order_id' })
  order!: OrderEntity;
}
