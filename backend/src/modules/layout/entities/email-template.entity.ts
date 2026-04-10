import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/**
 * Entity cms_email_template — mau email tu dong gui
 */
@Entity('cms_email_template')
export class EmailTemplateEntity {
  @PrimaryColumn('char', { length: 36, name: 'cms_email_template_id', default: () => '(UUID())' })
  cmsEmailTemplateId!: string;

  @Column({ name: 'cms_email_template_key', type: 'varchar', length: 50 })
  cmsEmailTemplateKey!: string;

  @Column({ name: 'cms_email_template_subject', type: 'varchar', length: 255 })
  cmsEmailTemplateSubject!: string;

  @Column({ name: 'cms_email_template_body', type: 'text' })
  cmsEmailTemplateBody!: string;

  @Column({ name: 'cms_email_template_variables', type: 'json', nullable: true })
  cmsEmailTemplateVariables!: Array<{ key: string; label: string; sample: string }> | null;

  @UpdateDateColumn({ name: 'updated_date', type: 'datetime' })
  updatedDate!: Date;
}
