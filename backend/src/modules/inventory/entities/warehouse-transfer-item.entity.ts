import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { WarehouseTransferEntity } from './warehouse-transfer.entity';

@Entity('inv_warehouse_transfer_item')
export class WarehouseTransferItemEntity {
  @PrimaryColumn('char', { length: 36, name: 'inv_warehouse_transfer_item_id', default: () => '(UUID())' })
  invWarehouseTransferItemId!: string;

  @Column({ name: 'inv_warehouse_transfer_id', type: 'char', length: 36 })
  invWarehouseTransferId!: string;

  @Column({ name: 'cat_product_variant_id', type: 'char', length: 36 })
  catProductVariantId!: string;

  @Column({ name: 'inv_warehouse_transfer_item_qty', type: 'decimal', precision: 18, scale: 4, default: 0 })
  invWarehouseTransferItemQty!: number;

  @Column({ name: 'inv_warehouse_transfer_item_received_qty', type: 'decimal', precision: 18, scale: 4, default: 0 })
  invWarehouseTransferItemReceivedQty!: number;

  @ManyToOne(() => WarehouseTransferEntity, (t) => t.items)
  @JoinColumn({ name: 'inv_warehouse_transfer_id' })
  transfer!: WarehouseTransferEntity;
}
