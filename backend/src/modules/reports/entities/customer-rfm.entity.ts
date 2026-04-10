import { Entity, Column, PrimaryColumn } from 'typeorm';

/**
 * Entity log_customer_rfm — RFM scores per customer, recalc daily
 */
@Entity('log_customer_rfm')
export class CustomerRfmEntity {
  @PrimaryColumn('char', { length: 36, name: 'log_customer_rfm_id', default: () => '(UUID())' })
  logCustomerRfmId!: string;

  @Column({ name: 'sys_customer_id', type: 'char', length: 36 })
  sysCustomerId!: string;

  @Column({ name: 'log_customer_rfm_recency', type: 'decimal', precision: 18, scale: 4, default: 0 })
  logCustomerRfmRecency!: number;

  @Column({ name: 'log_customer_rfm_frequency', type: 'decimal', precision: 18, scale: 4, default: 0 })
  logCustomerRfmFrequency!: number;

  @Column({ name: 'log_customer_rfm_monetary', type: 'decimal', precision: 22, scale: 4, default: 0 })
  logCustomerRfmMonetary!: number;

  @Column({ name: 'log_customer_rfm_r_score', type: 'tinyint', default: 1 })
  logCustomerRfmRScore!: number;

  @Column({ name: 'log_customer_rfm_f_score', type: 'tinyint', default: 1 })
  logCustomerRfmFScore!: number;

  @Column({ name: 'log_customer_rfm_m_score', type: 'tinyint', default: 1 })
  logCustomerRfmMScore!: number;

  @Column({ name: 'log_customer_rfm_segment', type: 'varchar', length: 50, default: 'Lost' })
  logCustomerRfmSegment!: string;

  @Column({ name: 'log_customer_rfm_calculated_at', type: 'datetime' })
  logCustomerRfmCalculatedAt!: Date;
}
