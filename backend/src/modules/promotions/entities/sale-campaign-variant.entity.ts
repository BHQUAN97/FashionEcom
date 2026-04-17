import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SaleCampaignEntity } from './sale-campaign.entity';
import { ProductVariantEntity } from '../../products/entities/product-variant.entity';

/**
 * Entity prm_sale_campaign_variant — gia sale per variant trong campaign
 * Neu discount_type/value la NULL → dung default tu campaign
 * Neu sale_price co gia tri → dung truc tiep (override tat ca)
 */
@Entity('prm_sale_campaign_variant')
export class SaleCampaignVariantEntity {
  @PrimaryColumn('char', { length: 36, name: 'prm_sale_campaign_variant_id', default: () => '(UUID())' })
  prmSaleCampaignVariantId!: string;

  @Column({ name: 'prm_sale_campaign_id', type: 'char', length: 36 })
  prmSaleCampaignId!: string;

  @Column({ name: 'cat_product_variant_id', type: 'char', length: 36 })
  catProductVariantId!: string;

  @Column({ name: 'prm_sale_cv_discount_type', type: 'tinyint', nullable: true })
  prmSaleCvDiscountType!: number | null;

  @Column({ name: 'prm_sale_cv_discount_value', type: 'decimal', precision: 22, scale: 4, nullable: true })
  prmSaleCvDiscountValue!: number | null;

  @Column({ name: 'prm_sale_cv_sale_price', type: 'decimal', precision: 22, scale: 4, nullable: true })
  prmSaleCvSalePrice!: number | null;

  @Column({ name: 'prm_sale_cv_status', type: 'tinyint', default: 1 })
  prmSaleCvStatus!: number;

  // Relations
  @ManyToOne(() => SaleCampaignEntity, (c) => c.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'prm_sale_campaign_id' })
  campaign!: SaleCampaignEntity;

  @ManyToOne(() => ProductVariantEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cat_product_variant_id' })
  variant!: ProductVariantEntity;
}
