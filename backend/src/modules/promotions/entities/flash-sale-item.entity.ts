import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { FlashSaleEntity } from './flash-sale.entity';

/**
 * Entity prm_flash_sale_item — san pham trong flash sale
 */
@Entity('prm_flash_sale_item')
export class FlashSaleItemEntity {
  @PrimaryColumn('char', { length: 36, name: 'prm_flash_sale_item_id', default: () => '(UUID())' })
  prmFlashSaleItemId!: string;

  @Column({ name: 'prm_flash_sale_id', type: 'char', length: 36 })
  prmFlashSaleId!: string;

  @Column({ name: 'cat_product_id', type: 'char', length: 36 })
  catProductId!: string;

  @Column({ name: 'prm_flash_sale_item_discount_pct', type: 'decimal', precision: 18, scale: 4, default: 0 })
  prmFlashSaleItemDiscountPct!: number;

  @Column({ name: 'prm_flash_sale_item_max_qty', type: 'int', default: 0 })
  prmFlashSaleItemMaxQty!: number;

  @Column({ name: 'prm_flash_sale_item_sold_qty', type: 'int', default: 0 })
  prmFlashSaleItemSoldQty!: number;

  @ManyToOne(() => FlashSaleEntity, (fs) => fs.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'prm_flash_sale_id' })
  flashSale!: FlashSaleEntity;
}
