import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

/**
 * Entity sys_media — thu vien media toan he thong
 */
@Entity('sys_media')
export class MediaEntity {
  @PrimaryColumn('char', { length: 36, name: 'sys_media_id', default: () => '(UUID())' })
  sysMediaId!: string;

  @Column({ name: 'sys_media_filename', type: 'varchar', length: 255 })
  sysMediaFilename!: string;

  @Column({ name: 'sys_media_path', type: 'varchar', length: 255 })
  sysMediaPath!: string;

  @Column({ name: 'sys_media_type', type: 'tinyint', default: 1 })
  sysMediaType!: number;

  @Column({ name: 'sys_media_size', type: 'int', default: 0 })
  sysMediaSize!: number;

  @Column({ name: 'sys_media_width', type: 'int', nullable: true })
  sysMediaWidth!: number | null;

  @Column({ name: 'sys_media_height', type: 'int', nullable: true })
  sysMediaHeight!: number | null;

  @Column({ name: 'sys_media_alt', type: 'varchar', length: 255, nullable: true })
  sysMediaAlt!: string | null;

  @Column({ name: 'sys_user_id', type: 'char', length: 36, nullable: true })
  sysUserId!: string | null;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;
}
