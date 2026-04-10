import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

/**
 * Entity sys_user — tai khoan dang nhap he thong
 * Roles: 0=Customer, 1=SuperAdmin, 2=Admin, 3=Manager, 4=Staff, 5=ContentEditor, 6=Warehouse
 */
@Entity('sys_user')
export class UserEntity {
  @PrimaryColumn('char', { length: 36, name: 'sys_user_id', default: () => '(UUID())' })
  sysUserId!: string;

  @Column({ name: 'sys_user_email', type: 'varchar', length: 100 })
  sysUserEmail!: string;

  @Column({ name: 'sys_user_password', type: 'varchar', length: 255, select: false })
  sysUserPassword!: string;

  @Column({ name: 'sys_user_role', type: 'tinyint', default: 0 })
  sysUserRole!: number;

  @Column({ name: 'sys_user_status', type: 'tinyint', default: 1 })
  sysUserStatus!: number;

  @Column({ name: 'sys_user_name', type: 'varchar', length: 100, nullable: true })
  sysUserName!: string | null;

  @Column({ name: 'sys_user_avatar', type: 'varchar', length: 255, nullable: true })
  sysUserAvatar!: string | null;

  @Column({ name: 'sys_user_last_login', type: 'datetime', nullable: true })
  sysUserLastLogin!: Date | null;

  @Column({ name: 'sys_user_login_count', type: 'int', default: 0 })
  sysUserLoginCount!: number;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;

  @Column({ name: 'modified_date', type: 'datetime', nullable: true })
  modifiedDate!: Date | null;
}
