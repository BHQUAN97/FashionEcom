import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PurchaseOrderEntity } from './purchase-order.entity';

@Entity('inv_purchase_order_item')
export class PurchaseOrderItemEntity {
  @PrimaryColumn('char', { length: 36, name: 'inv_purchase_order_item_id', default: () => '(UUID())' })
  invPurchaseOrderItemId!: string;

  @Column({ name: 'inv_purchase_order_id', type: 'char', length: 36 })
  invPurchaseOrderId!: string;

  @Column({ name: 'cat_product_variant_id', type: 'char', length: 36 })
  catProductVariantId!: string;

  @Column({ name: 'inv_purchase_order_item_qty', type: 'decimal', precision: 18, scale: 4, default: 0 })
  invPurchaseOrderItemQty!: number;

  @Column({ name: 'inv_purchase_order_item_received_qty', type: 'decimal', precision: 18, scale: 4, default: 0 })
  invPurchaseOrderItemReceivedQty!: number;

  @Column({ name: 'inv_purchase_order_item_unit_cost', type: 'decimal', precision: 22, scale: 4, default: 0 })
  invPurchaseOrderItemUnitCost!: number;

  @Column({ name: 'inv_purchase_order_item_supplier_sku', type: 'varchar', length: 50, nullable: true })
  invPurchaseOrderItemSupplierSku!: string | null;

  @ManyToOne(() => PurchaseOrderEntity, (po) => po.items)
  @JoinColumn({ name: 'inv_purchase_order_id' })
  purchaseOrder!: PurchaseOrderEntity;
}
