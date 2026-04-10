import { Entity, Column, PrimaryColumn, CreateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { OrderItemEntity } from './order-item.entity';
import { OrderTimelineEntity } from './order-timeline.entity';

/**
 * Entity sal_order — header don hang ban ra
 * Status: 0=ChoXacNhan, 1=DaXacNhan, 2=DangDongGoi, 3=DangGiao, 4=HoanThanh, 5=DaHuy, 6=DoiTra
 */
@Entity('sal_order')
export class OrderEntity {
  @PrimaryColumn('char', { length: 36, name: 'sal_order_id', default: () => '(UUID())' })
  salOrderId!: string;

  @Column({ name: 'sal_order_code', type: 'varchar', length: 20 })
  salOrderCode!: string;

  @Column({ name: 'sys_customer_id', type: 'char', length: 36 })
  sysCustomerId!: string;

  @Column({ name: 'sal_order_subtotal', type: 'decimal', precision: 22, scale: 4, default: 0 })
  salOrderSubtotal!: number;

  @Column({ name: 'sal_order_discount', type: 'decimal', precision: 22, scale: 4, default: 0 })
  salOrderDiscount!: number;

  @Column({ name: 'sal_order_shipping_fee', type: 'decimal', precision: 22, scale: 4, default: 0 })
  salOrderShippingFee!: number;

  @Column({ name: 'sal_order_total', type: 'decimal', precision: 22, scale: 4, default: 0 })
  salOrderTotal!: number;

  @Column({ name: 'sal_order_payment_type', type: 'tinyint', default: 0 })
  salOrderPaymentType!: number;

  @Column({ name: 'sal_order_status', type: 'tinyint', default: 0 })
  salOrderStatus!: number;

  @Column({ name: 'sal_order_payment_status', type: 'tinyint', default: 0 })
  salOrderPaymentStatus!: number;

  @Column({ name: 'sal_order_shipping_name', type: 'varchar', length: 100, nullable: true })
  salOrderShippingName!: string | null;

  @Column({ name: 'sal_order_shipping_phone', type: 'varchar', length: 50, nullable: true })
  salOrderShippingPhone!: string | null;

  @Column({ name: 'sal_order_shipping_province', type: 'varchar', length: 100, nullable: true })
  salOrderShippingProvince!: string | null;

  @Column({ name: 'sal_order_shipping_district', type: 'varchar', length: 100, nullable: true })
  salOrderShippingDistrict!: string | null;

  @Column({ name: 'sal_order_shipping_ward', type: 'varchar', length: 100, nullable: true })
  salOrderShippingWard!: string | null;

  @Column({ name: 'sal_order_shipping_address', type: 'varchar', length: 255, nullable: true })
  salOrderShippingAddress!: string | null;

  @Column({ name: 'sal_order_note', type: 'text', nullable: true })
  salOrderNote!: string | null;

  @Column({ name: 'sal_order_tracking_code', type: 'varchar', length: 50, nullable: true })
  salOrderTrackingCode!: string | null;

  @Column({ name: 'sal_order_internal_note', type: 'text', nullable: true })
  salOrderInternalNote!: string | null;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;

  @Column({ name: 'modified_date', type: 'datetime', nullable: true })
  modifiedDate!: Date | null;

  // Relations
  @OneToMany(() => OrderItemEntity, (i) => i.order)
  items!: OrderItemEntity[];

  @OneToMany(() => OrderTimelineEntity, (t) => t.order)
  timeline!: OrderTimelineEntity[];
}
