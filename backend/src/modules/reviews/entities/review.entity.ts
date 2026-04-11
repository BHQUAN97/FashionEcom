import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

/**
 * Entity sal_review — danh gia san pham
 * Status: 0=Pending, 1=Approved, 2=Rejected, 3=Hidden
 */
@Entity('sal_review')
export class ReviewEntity {
  @PrimaryColumn('char', { length: 36, name: 'sal_review_id', default: () => '(UUID())' })
  salReviewId!: string;

  @Column({ name: 'cat_product_id', type: 'char', length: 36 })
  catProductId!: string;

  @Column({ name: 'sal_order_item_id', type: 'char', length: 36 })
  salOrderItemId!: string;

  @Column({ name: 'sys_customer_id', type: 'char', length: 36 })
  sysCustomerId!: string;

  @Column({ name: 'sal_review_rating', type: 'tinyint', default: 5 })
  salReviewRating!: number;

  @Column({ name: 'sal_review_content', type: 'text', nullable: true })
  salReviewContent!: string | null;

  @Column({ name: 'sal_review_admin_reply', type: 'text', nullable: true })
  salReviewAdminReply!: string | null;

  @Column({ name: 'sal_review_admin_reply_date', type: 'datetime', nullable: true })
  salReviewAdminReplyDate!: Date | null;

  @Column({ name: 'sal_review_admin_reply_by', type: 'char', length: 36, nullable: true })
  salReviewAdminReplyBy!: string | null;

  @Column({ name: 'sal_review_status', type: 'tinyint', default: 0 })
  salReviewStatus!: number;

  @Column({ name: 'sal_review_photos', type: 'json', nullable: true })
  salReviewPhotos!: string[] | null;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;
}
