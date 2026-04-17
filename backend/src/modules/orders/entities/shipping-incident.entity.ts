import { Entity, Column, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { OrderEntity } from './order.entity';

/**
 * Su co van chuyen — theo doi mat hang, hu hong, hoan tra, giao lai
 *
 * Type: 1=hu_hong, 2=mat_hang, 3=khach_tu_choi, 4=giao_lai, 5=dia_chi_sai, 6=khac
 * Status: 0=open, 1=investigating, 2=resolved, 3=closed
 * Revenue impact: 0=binh_thuong, 1=mat_toan_bo, 2=giam_1_phan
 */
@Entity('sal_shipping_incident')
export class ShippingIncidentEntity {
  @PrimaryColumn('char', { length: 36, name: 'sal_shipping_incident_id', default: () => '(UUID())' })
  salShippingIncidentId!: string;

  @Column({ name: 'sal_order_id', type: 'char', length: 36 })
  salOrderId!: string;

  @Column({ name: 'sal_shipping_incident_type', type: 'tinyint' })
  salShippingIncidentType!: number;

  @Column({ name: 'sal_shipping_incident_status', type: 'tinyint', default: 0 })
  salShippingIncidentStatus!: number;

  @Column({ name: 'sal_shipping_incident_delivery_attempts', type: 'int', default: 1 })
  salShippingIncidentDeliveryAttempts!: number;

  /** Phu phi phat sinh (giao lai, luu kho) */
  @Column({ name: 'sal_shipping_incident_extra_cost', type: 'decimal', precision: 22, scale: 4, default: 0 })
  salShippingIncidentExtraCost!: number;

  /** Gia tri hang hu hong / mat (COGS) */
  @Column({ name: 'sal_shipping_incident_product_loss', type: 'decimal', precision: 22, scale: 4, default: 0 })
  salShippingIncidentProductLoss!: number;

  /** So tien hoan tra KH */
  @Column({ name: 'sal_shipping_incident_refund_amount', type: 'decimal', precision: 22, scale: 4, default: 0 })
  salShippingIncidentRefundAmount!: number;

  /** So tien DVVC boi thuong */
  @Column({ name: 'sal_shipping_incident_carrier_compensation', type: 'decimal', precision: 22, scale: 4, default: 0 })
  salShippingIncidentCarrierCompensation!: number;

  /** 0=binh thuong, 1=mat toan bo DT, 2=giam 1 phan */
  @Column({ name: 'sal_shipping_incident_revenue_impact', type: 'tinyint', default: 0 })
  salShippingIncidentRevenueImpact!: number;

  @Column({ name: 'sal_shipping_incident_note', type: 'text', nullable: true })
  salShippingIncidentNote!: string | null;

  @Column({ name: 'sal_shipping_incident_photos', type: 'json', nullable: true })
  salShippingIncidentPhotos!: string[] | null;

  @Column({ name: 'sal_shipping_incident_resolved_date', type: 'datetime', nullable: true })
  salShippingIncidentResolvedDate!: Date | null;

  @Column({ name: 'sys_user_id', type: 'char', length: 36, nullable: true })
  sysUserId!: string | null;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;

  @Column({ name: 'modified_date', type: 'datetime', nullable: true })
  modifiedDate!: Date | null;

  // Relations
  @ManyToOne(() => OrderEntity)
  @JoinColumn({ name: 'sal_order_id' })
  order!: OrderEntity;
}
