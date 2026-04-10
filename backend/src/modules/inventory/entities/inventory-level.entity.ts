import { Entity, Column, PrimaryColumn } from 'typeorm';

/**
 * Entity inv_inventory_level — so ton kho cua tung SKU tai tung kho
 */
@Entity('inv_inventory_level')
export class InventoryLevelEntity {
  @PrimaryColumn('char', { length: 36, name: 'inv_inventory_level_id', default: () => '(UUID())' })
  invInventoryLevelId!: string;

  @Column({ name: 'cat_product_variant_id', type: 'char', length: 36 })
  catProductVariantId!: string;

  @Column({ name: 'inv_warehouse_id', type: 'char', length: 36 })
  invWarehouseId!: string;

  @Column({ name: 'inv_inventory_level_available', type: 'decimal', precision: 18, scale: 4, default: 0 })
  invInventoryLevelAvailable!: number;

  @Column({ name: 'inv_inventory_level_locked', type: 'decimal', precision: 18, scale: 4, default: 0 })
  invInventoryLevelLocked!: number;
}
