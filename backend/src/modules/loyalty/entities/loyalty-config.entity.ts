import { Entity, Column, PrimaryColumn } from 'typeorm';

/**
 * Entity prm_loyalty_config — cau hinh chuong trinh tich diem (1 record duy nhat)
 */
@Entity('prm_loyalty_config')
export class LoyaltyConfigEntity {
  @PrimaryColumn('char', { length: 36, name: 'prm_loyalty_config_id', default: () => '(UUID())' })
  prmLoyaltyConfigId!: string;

  @Column({ name: 'prm_loyalty_config_earn_rate', type: 'decimal', precision: 18, scale: 4, default: 10000 })
  prmLoyaltyConfigEarnRate!: number;

  @Column({ name: 'prm_loyalty_config_redeem_rate', type: 'decimal', precision: 18, scale: 4, default: 100 })
  prmLoyaltyConfigRedeemRate!: number;

  @Column({ name: 'prm_loyalty_config_max_redeem_percent', type: 'decimal', precision: 18, scale: 4, default: 50 })
  prmLoyaltyConfigMaxRedeemPercent!: number;

  @Column({ name: 'prm_loyalty_config_min_redeem_points', type: 'decimal', precision: 18, scale: 4, default: 50 })
  prmLoyaltyConfigMinRedeemPoints!: number;

  @Column({ name: 'prm_loyalty_config_expiry_months', type: 'decimal', precision: 18, scale: 4, default: 12 })
  prmLoyaltyConfigExpiryMonths!: number;

  @Column({ name: 'prm_loyalty_config_pending_days', type: 'decimal', precision: 18, scale: 4, default: 7 })
  prmLoyaltyConfigPendingDays!: number;

  @Column({ name: 'prm_loyalty_config_silver_threshold', type: 'decimal', precision: 22, scale: 4, default: 2000000 })
  prmLoyaltyConfigSilverThreshold!: number;

  @Column({ name: 'prm_loyalty_config_gold_threshold', type: 'decimal', precision: 22, scale: 4, default: 5000000 })
  prmLoyaltyConfigGoldThreshold!: number;

  @Column({ name: 'prm_loyalty_config_platinum_threshold', type: 'decimal', precision: 22, scale: 4, default: 15000000 })
  prmLoyaltyConfigPlatinumThreshold!: number;

  @Column({ name: 'updated_date', type: 'datetime', nullable: true })
  updatedDate!: Date | null;
}
