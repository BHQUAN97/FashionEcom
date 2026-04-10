import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProductEntity } from './product.entity';

/**
 * Entity cat_product_media — hinh anh/video cua san pham
 */
@Entity('cat_product_media')
export class ProductMediaEntity {
  @PrimaryColumn('char', { length: 36, name: 'cat_product_media_id', default: () => '(UUID())' })
  catProductMediaId!: string;

  @Column({ name: 'cat_product_id', type: 'char', length: 36 })
  catProductId!: string;

  @Column({ name: 'cat_product_variant_id', type: 'char', length: 36, nullable: true })
  catProductVariantId!: string | null;

  @Column({ name: 'cat_product_media_path', type: 'varchar', length: 255 })
  catProductMediaPath!: string;

  @Column({ name: 'cat_product_media_type', type: 'tinyint', default: 1 })
  catProductMediaType!: number;

  @Column({ name: 'cat_product_media_sort', type: 'decimal', precision: 18, scale: 4, default: 0 })
  catProductMediaSort!: number;

  // Relations
  @ManyToOne(() => ProductEntity, (p) => p.media)
  @JoinColumn({ name: 'cat_product_id' })
  product!: ProductEntity;
}
