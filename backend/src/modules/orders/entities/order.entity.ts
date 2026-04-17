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

  /** Chi phi ship thuc te tra DVVC — dung de tinh loi nhuan */
  @Column({ name: 'sal_order_shipping_cost_actual', type: 'decimal', precision: 22, scale: 4, default: 0 })
  salOrderShippingCostActual!: number;

  /** 1 = don duoc mien phi ship */
  @Column({ name: 'sal_order_free_ship', type: 'tinyint', default: 0 })
  salOrderFreeShip!: number;

  /** So lan giao hang (1=binh thuong, 2+=giao lai) */
  @Column({ name: 'sal_order_delivery_attempts', type: 'int', default: 1 })
  salOrderDeliveryAttempts!: number;

  /** Tong phu phi ship phat sinh (giao lai, luu kho) */
  @Column({ name: 'sal_order_shipping_extra_cost', type: 'decimal', precision: 22, scale: 4, default: 0 })
  salOrderShippingExtraCost!: number;

  /** 1 = don co su co van chuyen */
  @Column({ name: 'sal_order_has_incident', type: 'tinyint', default: 0 })
  salOrderHasIncident!: number;

  /**
   * Trang thai van chuyen — tach biet voi order status (business flow)
   * 0=chua_giao, 1=cho_lay_hang, 2=da_lay_hang, 3=dang_van_chuyen,
   * 4=dang_giao, 5=giao_thanh_cong, 6=giao_that_bai, 7=dang_giao_lai,
   * 8=hoan_hang, 9=mat_hang, 10=hu_hong
   */
  @Column({ name: 'sal_order_shipping_status', type: 'tinyint', default: 0 })
  salOrderShippingStatus!: number;

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

  /** Don vi van chuyen: GHN, GHTK, NINJA_VAN, JT */
  @Column({ name: 'sal_order_shipping_provider', type: 'varchar', length: 20, nullable: true })
  salOrderShippingProvider!: string | null;

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
