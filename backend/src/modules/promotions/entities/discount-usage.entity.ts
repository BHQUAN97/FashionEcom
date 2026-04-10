import { Entity, Column, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { DiscountCodeEntity } from './discount-code.entity';

/**
 * Entity prm_discount_usage — lich su su dung ma giam gia
 */
@Entity('prm_discount_usage')
export class DiscountUsageEntity {
  @PrimaryColumn('char', { length: 36, name: 'prm_discount_usage_id', default: () => '(UUID())' })
  prmDiscountUsageId!: string;

  @Column({ name: 'prm_discount_id', type: 'char', length: 36 })
  prmDiscountId!: string;

  @Column({ name: 'sys_customer_id', type: 'char', length: 36 })
  sysCustomerId!: string;

  @Column({ name: 'sal_order_id', type: 'char', length: 36 })
  salOrderId!: string;

  @Column({ name: 'prm_discount_usage_amount', type: 'decimal', precision: 22, scale: 4, default: 0 })
  prmDiscountUsageAmount!: number;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;

  @ManyToOne(() => DiscountCodeEntity, (dc) => dc.usages, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'prm_discount_id' })
  discount!: DiscountCodeEntity;
}
