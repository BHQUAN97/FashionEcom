import { Entity, Column, PrimaryColumn } from 'typeorm';

/**
 * Entity log_payment_fee_config — ty le phi cong thanh toan cho bao cao P&L
 */
@Entity('log_payment_fee_config')
export class PaymentFeeConfigEntity {
  @PrimaryColumn('char', { length: 36, name: 'log_payment_fee_config_id', default: () => '(UUID())' })
  logPaymentFeeConfigId!: string;

  @Column({ name: 'log_payment_fee_config_payment_type', type: 'tinyint' })
  logPaymentFeeConfigPaymentType!: number;

  @Column({ name: 'log_payment_fee_config_rate', type: 'decimal', precision: 18, scale: 4, default: 0 })
  logPaymentFeeConfigRate!: number;

  @Column({ name: 'log_payment_fee_config_fixed', type: 'decimal', precision: 22, scale: 4, default: 0 })
  logPaymentFeeConfigFixed!: number;

  @Column({ name: 'effective_from', type: 'date' })
  effectiveFrom!: string;

  @Column({ name: 'effective_to', type: 'date', nullable: true })
  effectiveTo!: string | null;
}
