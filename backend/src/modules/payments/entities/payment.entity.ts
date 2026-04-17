import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

/**
 * Entity sal_payment — giao dich thanh toan online
 * Method: 0=COD, 1=BankTransfer, 2=MoMo, 3=VNPAY, 4=Payoo, 5=ZaloPay
 * Status: 0=Pending, 1=Success, 2=Failed, 3=Refunded, 4=Expired
 */
@Entity('sal_payment')
export class PaymentEntity {
  @PrimaryColumn('char', { length: 36, name: 'sal_payment_id', default: () => '(UUID())' })
  salPaymentId!: string;

  @Column({ name: 'sal_order_id', type: 'char', length: 36 })
  salOrderId!: string;

  @Column({ name: 'sal_payment_method', type: 'tinyint', default: 0 })
  salPaymentMethod!: number;

  @Column({ name: 'sal_payment_amount', type: 'decimal', precision: 22, scale: 4, default: 0 })
  salPaymentAmount!: number;

  @Column({ name: 'sal_payment_fee', type: 'decimal', precision: 22, scale: 4, default: 0 })
  salPaymentFee!: number;

  @Column({ name: 'sal_payment_status', type: 'tinyint', default: 0 })
  salPaymentStatus!: number;

  @Column({ name: 'sal_payment_transaction_id', type: 'varchar', length: 100, nullable: true })
  salPaymentTransactionId!: string | null;

  @Column({ name: 'sal_payment_gateway_response', type: 'text', nullable: true })
  salPaymentGatewayResponse!: string | null;

  @Column({ name: 'sal_payment_redirect_url', type: 'varchar', length: 500, nullable: true })
  salPaymentRedirectUrl!: string | null;

  /** URL anh chung minh da chuyen khoan (KH upload) */
  @Column({ name: 'sal_payment_proof_image', type: 'varchar', length: 500, nullable: true })
  salPaymentProofImage!: string | null;

  /** Ghi chu admin khi duyet/tu choi */
  @Column({ name: 'sal_payment_admin_note', type: 'text', nullable: true })
  salPaymentAdminNote!: string | null;

  /** Admin ID nguoi duyet */
  @Column({ name: 'sal_payment_reviewed_by', type: 'char', length: 36, nullable: true })
  salPaymentReviewedBy!: string | null;

  /** Thoi diem duyet */
  @Column({ name: 'sal_payment_reviewed_at', type: 'datetime', nullable: true })
  salPaymentReviewedAt!: Date | null;

  @Column({ name: 'sal_payment_expires_at', type: 'datetime', nullable: true })
  salPaymentExpiresAt!: Date | null;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;

  @Column({ name: 'updated_date', type: 'datetime', nullable: true })
  updatedDate!: Date | null;
}
