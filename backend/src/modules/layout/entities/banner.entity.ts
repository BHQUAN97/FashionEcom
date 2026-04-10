import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

/**
 * Entity cms_banner — banner quang cao storefront
 */
@Entity('cms_banner')
export class BannerEntity {
  @PrimaryColumn('char', { length: 36, name: 'cms_banner_id', default: () => '(UUID())' })
  cmsBannerId!: string;

  @Column({ name: 'cms_banner_title', type: 'varchar', length: 255 })
  cmsBannerTitle!: string;

  @Column({ name: 'cms_banner_image_desktop', type: 'varchar', length: 255 })
  cmsBannerImageDesktop!: string;

  @Column({ name: 'cms_banner_image_mobile', type: 'varchar', length: 255 })
  cmsBannerImageMobile!: string;

  @Column({ name: 'cms_banner_alt', type: 'varchar', length: 255, nullable: true })
  cmsBannerAlt!: string | null;

  @Column({ name: 'cms_banner_link', type: 'varchar', length: 255, nullable: true })
  cmsBannerLink!: string | null;

  @Column({ name: 'cms_banner_cta_text', type: 'varchar', length: 100, nullable: true })
  cmsBannerCtaText!: string | null;

  @Column({ name: 'cms_banner_sort', type: 'decimal', precision: 18, scale: 4, default: 0 })
  cmsBannerSort!: number;

  @Column({ name: 'cms_banner_start_date', type: 'datetime', nullable: true })
  cmsBannerStartDate!: Date | null;

  @Column({ name: 'cms_banner_end_date', type: 'datetime', nullable: true })
  cmsBannerEndDate!: Date | null;

  @Column({ name: 'cms_banner_status', type: 'tinyint', default: 1 })
  cmsBannerStatus!: number;

  @Column({ name: 'cms_banner_ab_variant', type: 'char', length: 1, nullable: true })
  cmsBannerAbVariant!: string | null;

  @Column({ name: 'cms_banner_ab_group_id', type: 'char', length: 36, nullable: true })
  cmsBannerAbGroupId!: string | null;

  @Column({ name: 'cms_banner_click_count', type: 'int', default: 0 })
  cmsBannerClickCount!: number;

  @Column({ name: 'cms_banner_view_count', type: 'int', default: 0 })
  cmsBannerViewCount!: number;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;
}
