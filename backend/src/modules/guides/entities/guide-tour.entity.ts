import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('sys_guide_tour')
export class GuideTourEntity {
  @PrimaryColumn('char', { length: 36, name: 'sys_guide_tour_id', default: () => '(UUID())' })
  sysGuideTourId!: string;

  @Column({ name: 'sys_guide_tour_screen_id', type: 'varchar', length: 50 })
  sysGuideTourScreenId!: string;

  @Column({ name: 'sys_guide_tour_title', type: 'varchar', length: 255 })
  sysGuideTourTitle!: string;

  @Column({ name: 'sys_guide_tour_roles', type: 'json' })
  sysGuideTourRoles!: number[];

  @Column({ name: 'sys_guide_tour_steps', type: 'json' })
  sysGuideTourSteps!: { title: string; description: string; selector: string; position?: string }[];

  @Column({ name: 'sys_guide_tour_status', type: 'tinyint', default: 1 })
  sysGuideTourStatus!: number;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;

  @Column({ name: 'updated_date', type: 'datetime', nullable: true })
  updatedDate!: Date | null;
}

@Entity('sys_guide_tour_completion')
export class GuideTourCompletionEntity {
  @PrimaryColumn('char', { length: 36, name: 'sys_guide_tour_completion_id', default: () => '(UUID())' })
  sysGuideTourCompletionId!: string;

  @Column({ name: 'sys_user_id', type: 'char', length: 36 })
  sysUserId!: string;

  @Column({ name: 'sys_guide_tour_screen_id', type: 'varchar', length: 50 })
  sysGuideTourScreenId!: string;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;
}
