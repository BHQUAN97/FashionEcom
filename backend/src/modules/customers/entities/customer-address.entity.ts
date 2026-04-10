import { Entity, Column, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CustomerEntity } from './customer.entity';

/**
 * Entity sys_customer_address — dia chi giao hang cua khach
 */
@Entity('sys_customer_address')
export class CustomerAddressEntity {
  @PrimaryColumn('char', { length: 36, name: 'sys_customer_address_id', default: () => '(UUID())' })
  sysCustomerAddressId!: string;

  @Column({ name: 'sys_customer_id', type: 'char', length: 36 })
  sysCustomerId!: string;

  @Column({ name: 'sys_customer_address_name', type: 'varchar', length: 100 })
  sysCustomerAddressName!: string;

  @Column({ name: 'sys_customer_address_phone', type: 'varchar', length: 50 })
  sysCustomerAddressPhone!: string;

  @Column({ name: 'sys_customer_address_province', type: 'varchar', length: 100 })
  sysCustomerAddressProvince!: string;

  @Column({ name: 'sys_customer_address_district', type: 'varchar', length: 100 })
  sysCustomerAddressDistrict!: string;

  @Column({ name: 'sys_customer_address_ward', type: 'varchar', length: 100 })
  sysCustomerAddressWard!: string;

  @Column({ name: 'sys_customer_address_detail', type: 'varchar', length: 255 })
  sysCustomerAddressDetail!: string;

  @Column({ name: 'sys_customer_address_is_default', type: 'tinyint', default: 0 })
  sysCustomerAddressIsDefault!: number;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;

  // Relations
  @ManyToOne(() => CustomerEntity)
  @JoinColumn({ name: 'sys_customer_id' })
  customer!: CustomerEntity;
}
