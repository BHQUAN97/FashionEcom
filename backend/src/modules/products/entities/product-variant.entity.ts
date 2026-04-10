import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProductEntity } from './product.entity';

/**
 * Entity cat_product_variant — bien the san pham (SKU thuc te giao dich)
 */
@Entity('cat_product_variant')
export class ProductVariantEntity {
  @PrimaryColumn('char', { length: 36, name: 'cat_product_variant_id', default: () => '(UUID())' })
  catProductVariantId!: string;

  @Column({ name: 'cat_product_id', type: 'char', length: 36 })
  catProductId!: string;

  @Column({ name: 'cat_product_variant_sku', type: 'varchar', length: 20 })
  catProductVariantSku!: string;

  @Column({ name: 'cat_product_variant_color', type: 'varchar', length: 50, nullable: true })
  catProductVariantColor!: string | null;

  @Column({ name: 'cat_product_variant_size', type: 'varchar', length: 50, nullable: true })
  catProductVariantSize!: string | null;

  @Column({ name: 'cat_product_variant_price', type: 'decimal', precision: 22, scale: 4, default: 0 })
  catProductVariantPrice!: number;

  @Column({ name: 'cat_product_variant_compare_price', type: 'decimal', precision: 22, scale: 4, default: 0 })
  catProductVariantComparePrice!: number;

  @Column({ name: 'cat_product_variant_cost', type: 'decimal', precision: 22, scale: 4, default: 0 })
  catProductVariantCost!: number;

  @Column({ name: 'cat_product_variant_weight', type: 'decimal', precision: 18, scale: 4, default: 0 })
  catProductVariantWeight!: number;

  @Column({ name: 'cat_product_variant_barcode', type: 'varchar', length: 50, nullable: true })
  catProductVariantBarcode!: string | null;

  @Column({ name: 'cat_product_variant_status', type: 'tinyint', default: 1 })
  catProductVariantStatus!: number;

  // Relations
  @ManyToOne(() => ProductEntity, (p) => p.variants)
  @JoinColumn({ name: 'cat_product_id' })
  product!: ProductEntity;
}
