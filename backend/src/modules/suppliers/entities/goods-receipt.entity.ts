import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('inv_goods_receipt')
export class GoodsReceiptEntity {
  @PrimaryColumn('char', { length: 36, name: 'inv_goods_receipt_id', default: () => '(UUID())' })
  invGoodsReceiptId!: string;

  @Column({ name: 'inv_purchase_order_id', type: 'char', length: 36 })
  invPurchaseOrderId!: string;

  @Column({ name: 'inv_warehouse_id', type: 'char', length: 36 })
  invWarehouseId!: string;

  @Column({ name: 'inv_goods_receipt_code', type: 'varchar', length: 20 })
  invGoodsReceiptCode!: string;

  @Column({ name: 'inv_goods_receipt_notes', type: 'text', nullable: true })
  invGoodsReceiptNotes!: string | null;

  @Column({ name: 'sys_user_id', type: 'char', length: 36, nullable: true })
  sysUserId!: string | null;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;
}

@Entity('inv_goods_receipt_item')
export class GoodsReceiptItemEntity {
  @PrimaryColumn('char', { length: 36, name: 'inv_goods_receipt_item_id', default: () => '(UUID())' })
  invGoodsReceiptItemId!: string;

  @Column({ name: 'inv_goods_receipt_id', type: 'char', length: 36 })
  invGoodsReceiptId!: string;

  @Column({ name: 'cat_product_variant_id', type: 'char', length: 36 })
  catProductVariantId!: string;

  @Column({ name: 'inv_goods_receipt_item_qty', type: 'decimal', precision: 18, scale: 4, default: 0 })
  invGoodsReceiptItemQty!: number;

  @Column({ name: 'inv_goods_receipt_item_unit_cost', type: 'decimal', precision: 22, scale: 4, default: 0 })
  invGoodsReceiptItemUnitCost!: number;

  @Column({ name: 'inv_goods_receipt_item_notes', type: 'varchar', length: 255, nullable: true })
  invGoodsReceiptItemNotes!: string | null;
}
