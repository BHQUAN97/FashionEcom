import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ReturnRequestEntity } from './return-request.entity';

@Entity('sal_return_request_item')
export class ReturnRequestItemEntity {
  @PrimaryColumn('char', { length: 36, name: 'sal_return_request_item_id', default: () => '(UUID())' })
  salReturnRequestItemId!: string;

  @Column({ name: 'sal_return_request_id', type: 'char', length: 36 })
  salReturnRequestId!: string;

  @Column({ name: 'sal_order_item_id', type: 'char', length: 36 })
  salOrderItemId!: string;

  @Column({ name: 'cat_product_variant_id', type: 'char', length: 36 })
  catProductVariantId!: string;

  @Column({ name: 'sal_return_request_item_qty', type: 'decimal', precision: 18, scale: 4, default: 0 })
  salReturnRequestItemQty!: number;

  @Column({ name: 'sal_return_request_item_exchange_variant_id', type: 'char', length: 36, nullable: true })
  salReturnRequestItemExchangeVariantId!: string | null;

  @ManyToOne(() => ReturnRequestEntity, (r) => r.items)
  @JoinColumn({ name: 'sal_return_request_id' })
  returnRequest!: ReturnRequestEntity;
}
