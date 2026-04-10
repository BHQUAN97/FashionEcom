import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Entity cms_layout_section — section cau thanh trang Homepage
 */
@Entity('cms_layout_section')
export class LayoutSectionEntity {
  @PrimaryColumn('char', { length: 36, name: 'cms_layout_section_id', default: () => '(UUID())' })
  cmsLayoutSectionId!: string;

  @Column({ name: 'cms_layout_section_page', type: 'varchar', length: 50, default: 'homepage' })
  cmsLayoutSectionPage!: string;

  @Column({ name: 'cms_layout_section_type', type: 'varchar', length: 50 })
  cmsLayoutSectionType!: string;

  @Column({ name: 'cms_layout_section_config', type: 'json' })
  cmsLayoutSectionConfig!: Record<string, unknown>;

  @Column({ name: 'cms_layout_section_sort', type: 'decimal', precision: 18, scale: 4, default: 0 })
  cmsLayoutSectionSort!: number;

  @Column({ name: 'cms_layout_section_visible', type: 'tinyint', default: 1 })
  cmsLayoutSectionVisible!: number;

  @Column({ name: 'cms_layout_section_version', type: 'varchar', length: 20, default: 'draft' })
  cmsLayoutSectionVersion!: string;

  @Column({ name: 'cms_layout_section_publish_at', type: 'datetime', nullable: true })
  cmsLayoutSectionPublishAt!: Date | null;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;

  @UpdateDateColumn({ name: 'updated_date', type: 'datetime' })
  updatedDate!: Date;
}
