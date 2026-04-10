import { Entity, Column, PrimaryColumn } from 'typeorm';

/**
 * Entity cat_color — danh muc mau sac san pham (HEX swatch)
 */
@Entity('cat_color')
export class ColorEntity {
  @PrimaryColumn('char', { length: 36, name: 'cat_color_id', default: () => '(UUID())' })
  catColorId!: string;

  @Column({ name: 'cat_color_name', type: 'varchar', length: 50 })
  catColorName!: string;

  @Column({ name: 'cat_color_hex', type: 'varchar', length: 7 })
  catColorHex!: string;

  @Column({ name: 'cat_color_sort', type: 'decimal', precision: 18, scale: 4, default: 0 })
  catColorSort!: number;

  @Column({ name: 'cat_color_status', type: 'tinyint', default: 1 })
  catColorStatus!: number;
}
