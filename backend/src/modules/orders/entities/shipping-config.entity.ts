import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

/**
 * Entity sal_shipping_config — cau hinh phi van chuyen dong gia per don vi
 * Luu ca phi thu KH + chi phi thuc te → tinh loi nhuan ship
 */
@Entity('sal_shipping_config')
export class ShippingConfigEntity {
  @PrimaryColumn('char', { length: 36, name: 'sal_shipping_config_id', default: () => '(UUID())' })
  salShippingConfigId!: string;

  @Column({ name: 'sal_shipping_config_provider', type: 'varchar', length: 20 })
  salShippingConfigProvider!: string;

  @Column({ name: 'sal_shipping_config_name', type: 'varchar', length: 100 })
  salShippingConfigName!: string;

  /** Phi ship dong gia thu KH (VND) */
  @Column({ name: 'sal_shipping_config_flat_rate', type: 'decimal', precision: 22, scale: 4, default: 0 })
  salShippingConfigFlatRate!: number;

  /** Chi phi thuc te tra hang van chuyen (VND) */
  @Column({ name: 'sal_shipping_config_actual_cost', type: 'decimal', precision: 22, scale: 4, default: 0 })
  salShippingConfigActualCost!: number;

  /** Nguong mien phi ship (VND). 0 = khong mien phi */
  @Column({ name: 'sal_shipping_config_free_ship_threshold', type: 'decimal', precision: 22, scale: 4, default: 500000 })
  salShippingConfigFreeShipThreshold!: number;

  @Column({ name: 'sal_shipping_config_status', type: 'tinyint', default: 1 })
  salShippingConfigStatus!: number;

  @Column({ name: 'sal_shipping_config_sort_order', type: 'int', default: 0 })
  salShippingConfigSortOrder!: number;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;

  @Column({ name: 'modified_date', type: 'datetime', nullable: true })
  modifiedDate!: Date | null;
}
