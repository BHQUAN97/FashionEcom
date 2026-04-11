import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

/**
 * Entity prm_loyalty_transaction — lich su giao dich diem
 * Type: 0=Earn, 1=Redeem, 2=Expire, 3=Refund, 4=Adjust
 */
@Entity('prm_loyalty_transaction')
export class LoyaltyTransactionEntity {
  @PrimaryColumn('char', { length: 36, name: 'prm_loyalty_transaction_id', default: () => '(UUID())' })
  prmLoyaltyTransactionId!: string;

  @Column({ name: 'sys_customer_id', type: 'char', length: 36 })
  sysCustomerId!: string;

  @Column({ name: 'prm_loyalty_transaction_type', type: 'tinyint' })
  prmLoyaltyTransactionType!: number;

  @Column({ name: 'prm_loyalty_transaction_points', type: 'decimal', precision: 18, scale: 4, default: 0 })
  prmLoyaltyTransactionPoints!: number;

  @Column({ name: 'prm_loyalty_transaction_balance', type: 'decimal', precision: 18, scale: 4, default: 0 })
  prmLoyaltyTransactionBalance!: number;

  @Column({ name: 'prm_loyalty_transaction_ref_type', type: 'varchar', length: 50, nullable: true })
  prmLoyaltyTransactionRefType!: string | null;

  @Column({ name: 'prm_loyalty_transaction_ref_id', type: 'char', length: 36, nullable: true })
  prmLoyaltyTransactionRefId!: string | null;

  @Column({ name: 'prm_loyalty_transaction_description', type: 'varchar', length: 255, nullable: true })
  prmLoyaltyTransactionDescription!: string | null;

  @Column({ name: 'prm_loyalty_transaction_expires_at', type: 'datetime', nullable: true })
  prmLoyaltyTransactionExpiresAt!: Date | null;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;
}
