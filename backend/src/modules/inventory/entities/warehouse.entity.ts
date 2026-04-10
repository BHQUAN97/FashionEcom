import { Entity, Column, PrimaryColumn } from 'typeorm';

/**
 * Entity inv_warehouse — kho hang / cua hang vat ly
 */
@Entity('inv_warehouse')
export class WarehouseEntity {
  @PrimaryColumn('char', { length: 36, name: 'inv_warehouse_id', default: () => '(UUID())' })
  invWarehouseId!: string;

  @Column({ name: 'inv_warehouse_code', type: 'varchar', length: 20 })
  invWarehouseCode!: string;

  @Column({ name: 'inv_warehouse_name', type: 'varchar', length: 255 })
  invWarehouseName!: string;

  @Column({ name: 'inv_warehouse_address', type: 'varchar', length: 255, nullable: true })
  invWarehouseAddress!: string | null;

  @Column({ name: 'inv_warehouse_status', type: 'tinyint', default: 1 })
  invWarehouseStatus!: number;
}
