import { Entity, Column, PrimaryColumn } from 'typeorm';

/**
 * Entity log_inventory_snapshot — chot ton kho daily de tinh turnover
 */
@Entity('log_inventory_snapshot')
export class InventorySnapshotEntity {
  @PrimaryColumn('char', { length: 36, name: 'log_inventory_snapshot_id', default: () => '(UUID())' })
  logInventorySnapshotId!: string;

  @Column({ name: 'cat_product_variant_id', type: 'char', length: 36 })
  catProductVariantId!: string;

  @Column({ name: 'inv_warehouse_id', type: 'char', length: 36 })
  invWarehouseId!: string;

  @Column({ name: 'log_inventory_snapshot_available', type: 'decimal', precision: 18, scale: 4, default: 0 })
  logInventorySnapshotAvailable!: number;

  @Column({ name: 'log_inventory_snapshot_cost', type: 'decimal', precision: 22, scale: 4, default: 0 })
  logInventorySnapshotCost!: number;

  @Column({ name: 'snapshot_date', type: 'date' })
  snapshotDate!: string;
}
