import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Entity cms_page — trang noi dung tinh (chinh sach, FAQ, canh bao lua dao...)
 */
@Entity('cms_page')
export class PageEntity {
  @PrimaryColumn('char', { length: 36, name: 'cms_page_id', default: () => '(UUID())' })
  cmsPageId!: string;

  @Column({ name: 'cms_page_slug', type: 'varchar', length: 255, unique: true })
  cmsPageSlug!: string;

  @Column({ name: 'cms_page_title', type: 'varchar', length: 255 })
  cmsPageTitle!: string;

  @Column({ name: 'cms_page_excerpt', type: 'varchar', length: 500, nullable: true })
  cmsPageExcerpt!: string | null;

  @Column({ name: 'cms_page_content', type: 'text' })
  cmsPageContent!: string;

  @Column({ name: 'cms_page_thumbnail', type: 'varchar', length: 500, nullable: true })
  cmsPageThumbnail!: string | null;

  @Column({ name: 'cms_page_seo_title', type: 'varchar', length: 255, nullable: true })
  cmsPageSeoTitle!: string | null;

  @Column({ name: 'cms_page_seo_description', type: 'varchar', length: 500, nullable: true })
  cmsPageSeoDescription!: string | null;

  @Column({ name: 'cms_page_status', type: 'tinyint', default: 1 })
  cmsPageStatus!: number;

  @Column({ name: 'cms_page_sort', type: 'decimal', precision: 18, scale: 4, default: 0 })
  cmsPageSort!: number;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;

  @UpdateDateColumn({ name: 'updated_date', type: 'datetime' })
  updatedDate!: Date;
}
