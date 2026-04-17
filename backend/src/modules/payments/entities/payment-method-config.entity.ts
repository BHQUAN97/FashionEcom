import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

/**
 * Cau hinh thanh toan per phuong thuc — QR image, STK, ten TK, huong dan
 * Admin upload QR cho tung PT, KH xem khi thanh toan
 */
@Entity('sal_payment_method_config')
export class PaymentMethodConfigEntity {
  @PrimaryColumn('char', { length: 36, name: 'sal_payment_method_config_id', default: () => '(UUID())' })
  salPaymentMethodConfigId!: string;

  /** 0=COD, 1=BankTransfer, 2=MoMo, 3=VNPAY, 4=Payoo, 5=ZaloPay */
  @Column({ name: 'sal_payment_method_config_method', type: 'tinyint' })
  salPaymentMethodConfigMethod!: number;

  @Column({ name: 'sal_payment_method_config_name', type: 'varchar', length: 50 })
  salPaymentMethodConfigName!: string;

  /** URL anh QR thanh toan */
  @Column({ name: 'sal_payment_method_config_qr_image', type: 'varchar', length: 500, nullable: true })
  salPaymentMethodConfigQrImage!: string | null;

  @Column({ name: 'sal_payment_method_config_account_name', type: 'varchar', length: 100, nullable: true })
  salPaymentMethodConfigAccountName!: string | null;

  @Column({ name: 'sal_payment_method_config_account_number', type: 'varchar', length: 50, nullable: true })
  salPaymentMethodConfigAccountNumber!: string | null;

  @Column({ name: 'sal_payment_method_config_bank_name', type: 'varchar', length: 100, nullable: true })
  salPaymentMethodConfigBankName!: string | null;

  /** Huong dan thanh toan */
  @Column({ name: 'sal_payment_method_config_instructions', type: 'text', nullable: true })
  salPaymentMethodConfigInstructions!: string | null;

  @Column({ name: 'sal_payment_method_config_status', type: 'tinyint', default: 1 })
  salPaymentMethodConfigStatus!: number;

  @Column({ name: 'sal_payment_method_config_sort_order', type: 'int', default: 0 })
  salPaymentMethodConfigSortOrder!: number;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;

  @Column({ name: 'modified_date', type: 'datetime', nullable: true })
  modifiedDate!: Date | null;
}
