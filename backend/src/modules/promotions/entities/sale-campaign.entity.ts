import { Entity, Column, PrimaryColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { SaleCampaignVariantEntity } from './sale-campaign-variant.entity';

/**
 * Entity prm_sale_campaign — chuong trinh sale theo dot
 * Status: 0=Draft, 1=Scheduled, 2=Active, 3=Paused, 4=Ended
 * Discount type: 1=%, 2=gia co dinh
 */
@Entity('prm_sale_campaign')
export class SaleCampaignEntity {
  @PrimaryColumn('char', { length: 36, name: 'prm_sale_campaign_id', default: () => '(UUID())' })
  prmSaleCampaignId!: string;

  @Column({ name: 'prm_sale_campaign_name', type: 'varchar', length: 255 })
  prmSaleCampaignName!: string;

  @Column({ name: 'prm_sale_campaign_desc', type: 'text', nullable: true })
  prmSaleCampaignDesc!: string | null;

  @Column({ name: 'prm_sale_campaign_start_date', type: 'datetime' })
  prmSaleCampaignStartDate!: Date;

  @Column({ name: 'prm_sale_campaign_end_date', type: 'datetime' })
  prmSaleCampaignEndDate!: Date;

  @Column({ name: 'prm_sale_campaign_discount_type', type: 'tinyint', default: 1 })
  prmSaleCampaignDiscountType!: number;

  @Column({ name: 'prm_sale_campaign_discount_value', type: 'decimal', precision: 22, scale: 4, default: 0 })
  prmSaleCampaignDiscountValue!: number;

  @Column({ name: 'prm_sale_campaign_priority', type: 'tinyint', default: 0 })
  prmSaleCampaignPriority!: number;

  @Column({ name: 'prm_sale_campaign_status', type: 'tinyint', default: 0 })
  prmSaleCampaignStatus!: number;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;

  @Column({ name: 'modified_date', type: 'datetime', nullable: true })
  modifiedDate!: Date | null;

  // Relations
  @OneToMany(() => SaleCampaignVariantEntity, (v) => v.campaign)
  variants!: SaleCampaignVariantEntity[];
}
