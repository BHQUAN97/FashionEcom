import { Entity, Column, PrimaryColumn, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { CategoryEntity } from '../../categories/entities/category.entity';
import { ProductVariantEntity } from './product-variant.entity';
import { ProductMediaEntity } from './product-media.entity';

/**
 * Entity cat_product — san pham goc (chua phan loai mau/size)
 */
@Entity('cat_product')
export class ProductEntity {
  @PrimaryColumn('char', { length: 36, name: 'cat_product_id', default: () => '(UUID())' })
  catProductId!: string;

  @Column({ name: 'cat_category_id', type: 'char', length: 36 })
  catCategoryId!: string;

  @Column({ name: 'cat_product_code', type: 'varchar', length: 20 })
  catProductCode!: string;

  @Column({ name: 'cat_product_name', type: 'varchar', length: 255 })
  catProductName!: string;

  @Column({ name: 'cat_product_slug', type: 'varchar', length: 255, nullable: true })
  catProductSlug!: string | null;

  @Column({ name: 'cat_product_description', type: 'text', nullable: true })
  catProductDescription!: string | null;

  @Column({ name: 'cat_product_short_desc', type: 'text', nullable: true })
  catProductShortDesc!: string | null;

  @Column({ name: 'cat_product_seo_title', type: 'varchar', length: 60, nullable: true })
  catProductSeoTitle!: string | null;

  @Column({ name: 'cat_product_seo_desc', type: 'varchar', length: 160, nullable: true })
  catProductSeoDesc!: string | null;

  @Column({ name: 'cat_product_brand', type: 'varchar', length: 100, nullable: true })
  catProductBrand!: string | null;

  @Column({ name: 'cat_product_is_featured', type: 'tinyint', default: 0 })
  catProductIsFeatured!: number;

  @Column({ name: 'cat_product_is_new', type: 'tinyint', default: 1 })
  catProductIsNew!: number;

  @Column({ name: 'cat_product_status', type: 'tinyint', default: 1 })
  catProductStatus!: number;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;

  @Column({ name: 'modified_date', type: 'datetime', nullable: true })
  modifiedDate!: Date | null;

  // Relations
  @ManyToOne(() => CategoryEntity)
  @JoinColumn({ name: 'cat_category_id' })
  category!: CategoryEntity;

  @OneToMany(() => ProductVariantEntity, (v) => v.product)
  variants!: ProductVariantEntity[];

  @OneToMany(() => ProductMediaEntity, (m) => m.product)
  media!: ProductMediaEntity[];
}
