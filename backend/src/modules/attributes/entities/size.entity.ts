import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SizeGroupEntity } from './size-group.entity';

/**
 * Entity cat_size — gia tri kich thuoc cu the (S, M, L, XL, 39, 40...)
 * Normalize tu cat_size_group JSON values
 */
@Entity('cat_size')
export class SizeEntity {
  @PrimaryColumn('char', { length: 36, name: 'cat_size_id', default: () => '(UUID())' })
  catSizeId!: string;

  @Column({ name: 'cat_size_group_id', type: 'char', length: 36 })
  catSizeGroupId!: string;

  @Column({ name: 'cat_size_value', type: 'varchar', length: 50 })
  catSizeValue!: string;

  @Column({ name: 'cat_size_sort', type: 'decimal', precision: 18, scale: 4, default: 0 })
  catSizeSort!: number;

  @Column({ name: 'cat_size_status', type: 'tinyint', default: 1 })
  catSizeStatus!: number;

  // Relations
  @ManyToOne(() => SizeGroupEntity, (g) => g.sizes)
  @JoinColumn({ name: 'cat_size_group_id' })
  sizeGroup!: SizeGroupEntity;
}
