import { Entity, Column, PrimaryColumn } from 'typeorm';

/**
 * Entity cat_size_group — nhom kich thuoc san pham
 * cat_size_group_values la JSON array: ["S","M","L","XL"]
 */
@Entity('cat_size_group')
export class SizeGroupEntity {
  @PrimaryColumn('char', { length: 36, name: 'cat_size_group_id', default: () => '(UUID())' })
  catSizeGroupId!: string;

  @Column({ name: 'cat_size_group_name', type: 'varchar', length: 100 })
  catSizeGroupName!: string;

  @Column({ name: 'cat_size_group_values', type: 'text' })
  catSizeGroupValues!: string;

  @Column({ name: 'cat_size_group_guide', type: 'text', nullable: true })
  catSizeGroupGuide!: string | null;

  @Column({ name: 'cat_size_group_sort', type: 'decimal', precision: 18, scale: 4, default: 0 })
  catSizeGroupSort!: number;
}
