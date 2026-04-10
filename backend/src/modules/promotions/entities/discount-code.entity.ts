import { Entity, Column, PrimaryColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { DiscountUsageEntity } from './discount-usage.entity';

/**
 * Entity prm_discount_code — ma giam gia (voucher/coupon)
 */
@Entity('prm_discount_code')
export class DiscountCodeEntity {
  @PrimaryColumn('char', { length: 36, name: 'prm_discount_id', default: () => '(UUID())' })
  prmDiscountId!: string;

  @Column({ name: 'prm_discount_code', type: 'varchar', length: 20 })
  prmDiscountCode!: string;

  @Column({ name: 'prm_discount_type', type: 'tinyint', default: 1 })
  prmDiscountType!: number;

  @Column({ name: 'prm_discount_value', type: 'decimal', precision: 22, scale: 4, default: 0 })
  prmDiscountValue!: number;

  @Column({ name: 'prm_discount_max_amount', type: 'decimal', precision: 22, scale: 4, default: 0 })
  prmDiscountMaxAmount!: number;

  @Column({ name: 'prm_discount_conditions_json', type: 'json', nullable: true })
  prmDiscountConditionsJson!: Record<string, unknown> | null;

  @Column({ name: 'prm_discount_usage_count', type: 'int', default: 0 })
  prmDiscountUsageCount!: number;

  @Column({ name: 'prm_discount_max_usage', type: 'int', nullable: true })
  prmDiscountMaxUsage!: number | null;

  @Column({ name: 'prm_discount_max_per_customer', type: 'int', nullable: true })
  prmDiscountMaxPerCustomer!: number | null;

  @Column({ name: 'prm_discount_start_date', type: 'datetime', nullable: true })
  prmDiscountStartDate!: Date | null;

  @Column({ name: 'prm_discount_end_date', type: 'datetime', nullable: true })
  prmDiscountEndDate!: Date | null;

  @Column({ name: 'prm_discount_stackable', type: 'tinyint', default: 0 })
  prmDiscountStackable!: number;

  @Column({ name: 'prm_discount_status', type: 'tinyint', default: 1 })
  prmDiscountStatus!: number;

  @Column({ name: 'prm_discount_customer_scope', type: 'tinyint', default: 0 })
  prmDiscountCustomerScope!: number;

  @Column({ name: 'prm_discount_customer_ids', type: 'json', nullable: true })
  prmDiscountCustomerIds!: string[] | null;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;

  @OneToMany(() => DiscountUsageEntity, (usage) => usage.discount)
  usages!: DiscountUsageEntity[];
}
