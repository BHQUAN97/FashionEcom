import { Entity, Column, PrimaryColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

/**
 * Entity cat_category — danh muc phan loai san pham da cap (max 3 cap)
 */
@Entity('cat_category')
export class CategoryEntity {
  @PrimaryColumn('char', { length: 36, name: 'cat_category_id', default: () => '(UUID())' })
  catCategoryId!: string;

  @Column({ name: 'cat_category_parent_id', type: 'char', length: 36, nullable: true })
  catCategoryParentId!: string | null;

  @Column({ name: 'cat_category_code', type: 'varchar', length: 20 })
  catCategoryCode!: string;

  @Column({ name: 'cat_category_name', type: 'varchar', length: 255 })
  catCategoryName!: string;

  @Column({ name: 'cat_category_slug', type: 'varchar', length: 255, nullable: true })
  catCategorySlug!: string | null;

  @Column({ name: 'cat_category_description', type: 'text', nullable: true })
  catCategoryDescription!: string | null;

  @Column({ name: 'cat_category_icon', type: 'varchar', length: 255, nullable: true })
  catCategoryIcon!: string | null;

  @Column({ name: 'cat_category_banner', type: 'varchar', length: 255, nullable: true })
  catCategoryBanner!: string | null;

  @Column({ name: 'cat_category_sort', type: 'decimal', precision: 18, scale: 4, default: 0 })
  catCategorySort!: number;

  @Column({ name: 'cat_category_status', type: 'tinyint', default: 1 })
  catCategoryStatus!: number;

  // Relations — self-referencing tree
  @ManyToOne(() => CategoryEntity, (c) => c.children)
  @JoinColumn({ name: 'cat_category_parent_id' })
  parent!: CategoryEntity | null;

  @OneToMany(() => CategoryEntity, (c) => c.parent)
  children!: CategoryEntity[];
}
