import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

/**
 * Entity inv_inventory_log — lich su thay doi ton kho
 */
@Entity('inv_inventory_log')
export class InventoryLogEntity {
  @PrimaryColumn('char', { length: 36, name: 'inv_inventory_log_id', default: () => '(UUID())' })
  invInventoryLogId!: string;

  @Column({ name: 'cat_product_variant_id', type: 'char', length: 36 })
  catProductVariantId!: string;

  @Column({ name: 'inv_warehouse_id', type: 'char', length: 36 })
  invWarehouseId!: string;

  @Column({ name: 'inv_inventory_log_qty', type: 'decimal', precision: 18, scale: 4, default: 0 })
  invInventoryLogQty!: number;

  @Column({ name: 'inv_inventory_log_type', type: 'varchar', length: 20 })
  invInventoryLogType!: string;

  @Column({ name: 'inv_inventory_log_reason', type: 'varchar', length: 50, nullable: true })
  invInventoryLogReason!: string | null;

  @Column({ name: 'inv_inventory_log_note', type: 'text', nullable: true })
  invInventoryLogNote!: string | null;

  @Column({ name: 'inv_inventory_log_ref_id', type: 'char', length: 36, nullable: true })
  invInventoryLogRefId!: string | null;

  @Column({ name: 'sys_user_id', type: 'char', length: 36, nullable: true })
  sysUserId!: string | null;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;
}
