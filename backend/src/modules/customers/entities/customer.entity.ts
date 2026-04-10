import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

/**
 * Entity sys_customer — ho so chi tiet khach hang
 */
@Entity('sys_customer')
export class CustomerEntity {
  @PrimaryColumn('char', { length: 36, name: 'sys_customer_id', default: () => '(UUID())' })
  sysCustomerId!: string;

  @Column({ name: 'sys_user_id', type: 'char', length: 36 })
  sysUserId!: string;

  @Column({ name: 'sys_customer_name', type: 'varchar', length: 100 })
  sysCustomerName!: string;

  @Column({ name: 'sys_customer_mobile', type: 'varchar', length: 50 })
  sysCustomerMobile!: string;

  @Column({ name: 'sys_customer_dob', type: 'date', nullable: true })
  sysCustomerDob!: Date | null;

  @Column({ name: 'sys_customer_loyalty_point', type: 'decimal', precision: 18, scale: 4, default: 0 })
  sysCustomerLoyaltyPoint!: number;

  @Column({ name: 'sys_customer_tier', type: 'tinyint', default: 1 })
  sysCustomerTier!: number;

  // Relations
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'sys_user_id' })
  user!: UserEntity;
}
