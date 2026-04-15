import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProductEntity } from './product.entity';
import { ColorEntity } from '../../attributes/entities/color.entity';
import { SizeEntity } from '../../attributes/entities/size.entity';

/**
 * Entity cat_product_variant — bien the san pham (SKU thuc te giao dich)
 * Moi variant = 1 combo mau + size, co gia rieng
 */
@Entity('cat_product_variant')
export class ProductVariantEntity {
  @PrimaryColumn('char', { length: 36, name: 'cat_product_variant_id', default: () => '(UUID())' })
  catProductVariantId!: string;

  @Column({ name: 'cat_product_id', type: 'char', length: 36 })
  catProductId!: string;

  @Column({ name: 'cat_product_variant_sku', type: 'varchar', length: 20, unique: true })
  catProductVariantSku!: string;

  // FK mau sac va kich thuoc
  @Column({ name: 'cat_color_id', type: 'char', length: 36, nullable: true })
  catColorId!: string | null;

  @Column({ name: 'cat_size_id', type: 'char', length: 36, nullable: true })
  catSizeId!: string | null;

  // Giu lai cot text cu de backward compat (se drop sau khi migrate xong)
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

  @ManyToOne(() => ColorEntity, { nullable: true, eager: true })
  @JoinColumn({ name: 'cat_color_id' })
  color!: ColorEntity | null;

  @ManyToOne(() => SizeEntity, { nullable: true, eager: true })
  @JoinColumn({ name: 'cat_size_id' })
  size!: SizeEntity | null;
}
