import { Entity, Column, PrimaryColumn } from 'typeorm';

/**
 * Entity sys_setting — cai dat he thong dang key-value
 */
@Entity('sys_setting')
export class SettingEntity {
  @PrimaryColumn('char', { length: 36, name: 'sys_setting_id', default: () => '(UUID())' })
  sysSettingId!: string;

  @Column({ name: 'sys_setting_group', type: 'varchar', length: 50 })
  sysSettingGroup!: string;

  @Column({ name: 'sys_setting_key', type: 'varchar', length: 100 })
  sysSettingKey!: string;

  @Column({ name: 'sys_setting_value', type: 'text', nullable: true })
  sysSettingValue!: string | null;

  @Column({ name: 'modified_date', type: 'datetime', nullable: true })
  modifiedDate!: Date | null;
}
