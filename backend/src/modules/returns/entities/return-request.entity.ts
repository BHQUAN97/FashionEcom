import { Entity, Column, PrimaryColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { ReturnRequestItemEntity } from './return-request-item.entity';
import { ReturnRequestMediaEntity } from './return-request-media.entity';

/**
 * Entity sal_return_request — yeu cau doi tra hang (RMA)
 * Type: 0=DoiHang, 1=HoanTien, 2=DoiSize
 * Reason: 0=LoiHang, 1=SaiSP, 2=KhongVua, 3=DoiY, 4=Khac
 * Status: 0=Requested, 1=Reviewing, 2=Approved, 3=Rejected, 4=Refunding, 5=Refunded, 6=Exchanging, 7=Exchanged
 */
@Entity('sal_return_request')
export class ReturnRequestEntity {
  @PrimaryColumn('char', { length: 36, name: 'sal_return_request_id', default: () => '(UUID())' })
  salReturnRequestId!: string;

  @Column({ name: 'sal_return_request_code', type: 'varchar', length: 20 })
  salReturnRequestCode!: string;

  @Column({ name: 'sal_order_id', type: 'char', length: 36 })
  salOrderId!: string;

  @Column({ name: 'sys_customer_id', type: 'char', length: 36 })
  sysCustomerId!: string;

  @Column({ name: 'sal_return_request_type', type: 'tinyint', default: 0 })
  salReturnRequestType!: number;

  @Column({ name: 'sal_return_request_reason', type: 'tinyint', default: 0 })
  salReturnRequestReason!: number;

  @Column({ name: 'sal_return_request_reason_detail', type: 'varchar', length: 500, nullable: true })
  salReturnRequestReasonDetail!: string | null;

  @Column({ name: 'sal_return_request_status', type: 'tinyint', default: 0 })
  salReturnRequestStatus!: number;

  @Column({ name: 'sal_return_request_refund_amount', type: 'decimal', precision: 22, scale: 4, default: 0 })
  salReturnRequestRefundAmount!: number;

  @Column({ name: 'sal_return_request_staff_notes', type: 'text', nullable: true })
  salReturnRequestStaffNotes!: string | null;

  @Column({ name: 'sal_return_request_customer_notes', type: 'text', nullable: true })
  salReturnRequestCustomerNotes!: string | null;

  @Column({ name: 'sys_user_id', type: 'char', length: 36, nullable: true })
  sysUserId!: string | null;

  @Column({ name: 'sal_exchange_order_id', type: 'char', length: 36, nullable: true })
  salExchangeOrderId!: string | null;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;

  @Column({ name: 'updated_date', type: 'datetime', nullable: true })
  updatedDate!: Date | null;

  @OneToMany(() => ReturnRequestItemEntity, (i) => i.returnRequest)
  items!: ReturnRequestItemEntity[];

  @OneToMany(() => ReturnRequestMediaEntity, (m) => m.returnRequest)
  media!: ReturnRequestMediaEntity[];
}
