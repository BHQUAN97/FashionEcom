import { Entity, Column, PrimaryColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { WarehouseTransferItemEntity } from './warehouse-transfer-item.entity';

/**
 * Entity inv_warehouse_transfer — phieu dieu chuyen kho
 * Status: 0=Draft, 1=PendingPickup, 2=InTransit, 3=Received, 4=PartiallyReceived, 5=Completed
 */
@Entity('inv_warehouse_transfer')
export class WarehouseTransferEntity {
  @PrimaryColumn('char', { length: 36, name: 'inv_warehouse_transfer_id', default: () => '(UUID())' })
  invWarehouseTransferId!: string;

  @Column({ name: 'inv_warehouse_transfer_code', type: 'varchar', length: 20 })
  invWarehouseTransferCode!: string;

  @Column({ name: 'inv_warehouse_from_id', type: 'char', length: 36 })
  invWarehouseFromId!: string;

  @Column({ name: 'inv_warehouse_to_id', type: 'char', length: 36 })
  invWarehouseToId!: string;

  @Column({ name: 'inv_warehouse_transfer_status', type: 'tinyint', default: 0 })
  invWarehouseTransferStatus!: number;

  @Column({ name: 'inv_warehouse_transfer_reason', type: 'varchar', length: 255, nullable: true })
  invWarehouseTransferReason!: string | null;

  @Column({ name: 'sys_user_id', type: 'char', length: 36, nullable: true })
  sysUserId!: string | null;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;

  @Column({ name: 'updated_date', type: 'datetime', nullable: true })
  updatedDate!: Date | null;

  @OneToMany(() => WarehouseTransferItemEntity, (i) => i.transfer)
  items!: WarehouseTransferItemEntity[];
}
