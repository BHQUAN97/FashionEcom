import { Entity, Column, PrimaryColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { FlashSaleItemEntity } from './flash-sale-item.entity';

/**
 * Entity prm_flash_sale — chuong trinh flash sale
 */
@Entity('prm_flash_sale')
export class FlashSaleEntity {
  @PrimaryColumn('char', { length: 36, name: 'prm_flash_sale_id', default: () => '(UUID())' })
  prmFlashSaleId!: string;

  @Column({ name: 'prm_flash_sale_title', type: 'varchar', length: 255 })
  prmFlashSaleTitle!: string;

  @Column({ name: 'prm_flash_sale_start_date', type: 'datetime' })
  prmFlashSaleStartDate!: Date;

  @Column({ name: 'prm_flash_sale_end_date', type: 'datetime' })
  prmFlashSaleEndDate!: Date;

  @Column({ name: 'prm_flash_sale_status', type: 'tinyint', default: 0 })
  prmFlashSaleStatus!: number;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;

  @OneToMany(() => FlashSaleItemEntity, (item) => item.flashSale)
  items!: FlashSaleItemEntity[];
}
