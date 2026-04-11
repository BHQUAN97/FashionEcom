import { Entity, Column, PrimaryColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { PurchaseOrderItemEntity } from './purchase-order-item.entity';

/**
 * Entity inv_purchase_order — don dat hang NCC
 * Status: 0=Draft, 1=PendingApproval, 2=Ordered, 3=PartiallyReceived, 4=Received, 5=Completed, 6=Cancelled
 */
@Entity('inv_purchase_order')
export class PurchaseOrderEntity {
  @PrimaryColumn('char', { length: 36, name: 'inv_purchase_order_id', default: () => '(UUID())' })
  invPurchaseOrderId!: string;

  @Column({ name: 'inv_purchase_order_code', type: 'varchar', length: 20 })
  invPurchaseOrderCode!: string;

  @Column({ name: 'inv_supplier_id', type: 'char', length: 36 })
  invSupplierId!: string;

  @Column({ name: 'inv_warehouse_id', type: 'char', length: 36 })
  invWarehouseId!: string;

  @Column({ name: 'inv_purchase_order_status', type: 'tinyint', default: 0 })
  invPurchaseOrderStatus!: number;

  @Column({ name: 'inv_purchase_order_total', type: 'decimal', precision: 22, scale: 4, default: 0 })
  invPurchaseOrderTotal!: number;

  @Column({ name: 'inv_purchase_order_shipping_cost', type: 'decimal', precision: 22, scale: 4, default: 0 })
  invPurchaseOrderShippingCost!: number;

  @Column({ name: 'inv_purchase_order_notes', type: 'text', nullable: true })
  invPurchaseOrderNotes!: string | null;

  @Column({ name: 'inv_purchase_order_expected_date', type: 'date', nullable: true })
  invPurchaseOrderExpectedDate!: string | null;

  @Column({ name: 'inv_purchase_order_tracking_number', type: 'varchar', length: 100, nullable: true })
  invPurchaseOrderTrackingNumber!: string | null;

  @Column({ name: 'sys_user_id', type: 'char', length: 36, nullable: true })
  sysUserId!: string | null;

  @Column({ name: 'sys_user_approved_id', type: 'char', length: 36, nullable: true })
  sysUserApprovedId!: string | null;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;

  @Column({ name: 'updated_date', type: 'datetime', nullable: true })
  updatedDate!: Date | null;

  @OneToMany(() => PurchaseOrderItemEntity, (i) => i.purchaseOrder)
  items!: PurchaseOrderItemEntity[];
}
