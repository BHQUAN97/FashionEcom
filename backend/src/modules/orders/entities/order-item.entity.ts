import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { OrderEntity } from './order.entity';

/**
 * Entity sal_order_item — chi tiet san pham trong don hang (dong don)
 */
@Entity('sal_order_item')
export class OrderItemEntity {
  @PrimaryColumn('char', { length: 36, name: 'sal_order_item_id', default: () => '(UUID())' })
  salOrderItemId!: string;

  @Column({ name: 'sal_order_id', type: 'char', length: 36 })
  salOrderId!: string;

  @Column({ name: 'cat_product_variant_id', type: 'char', length: 36 })
  catProductVariantId!: string;

  @Column({ name: 'sal_order_item_qty', type: 'decimal', precision: 18, scale: 4, default: 0 })
  salOrderItemQty!: number;

  @Column({ name: 'sal_order_item_price', type: 'decimal', precision: 22, scale: 4, default: 0 })
  salOrderItemPrice!: number;

  @Column({ name: 'sal_order_item_cost', type: 'decimal', precision: 22, scale: 4, default: 0 })
  salOrderItemCost!: number;

  // Relations
  @ManyToOne(() => OrderEntity, (o) => o.items)
  @JoinColumn({ name: 'sal_order_id' })
  order!: OrderEntity;
}
