import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/**
 * Entity cms_theme_config — cau hinh giao dien toan cuc
 */
@Entity('cms_theme_config')
export class ThemeConfigEntity {
  @PrimaryColumn('char', { length: 36, name: 'cms_theme_config_id', default: () => '(UUID())' })
  cmsThemeConfigId!: string;

  @Column({ name: 'cms_theme_config_key', type: 'varchar', length: 50 })
  cmsThemeConfigKey!: string;

  @Column({ name: 'cms_theme_config_value', type: 'text' })
  cmsThemeConfigValue!: string;

  @Column({ name: 'cms_theme_config_type', type: 'varchar', length: 20, default: 'text' })
  cmsThemeConfigType!: string;

  @Column({ name: 'cms_theme_config_group', type: 'varchar', length: 30 })
  cmsThemeConfigGroup!: string;

  @Column({ name: 'cms_theme_config_label', type: 'varchar', length: 100 })
  cmsThemeConfigLabel!: string;

  @UpdateDateColumn({ name: 'updated_date', type: 'datetime' })
  updatedDate!: Date;
}
