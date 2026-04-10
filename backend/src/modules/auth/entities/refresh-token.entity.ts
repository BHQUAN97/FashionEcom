import { Entity, Column, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

/**
 * Entity sys_refresh_token — luu tru refresh tokens de rotation + revoke
 */
@Entity('sys_refresh_token')
export class RefreshTokenEntity {
  @PrimaryColumn('char', { length: 36, name: 'sys_refresh_token_id', default: () => '(UUID())' })
  sysRefreshTokenId!: string;

  @Column({ name: 'sys_user_id', type: 'char', length: 36 })
  sysUserId!: string;

  @Column({ name: 'sys_refresh_token_hash', type: 'varchar', length: 255 })
  sysRefreshTokenHash!: string;

  @Column({ name: 'sys_refresh_token_expires', type: 'datetime' })
  sysRefreshTokenExpires!: Date;

  @Column({ name: 'sys_refresh_token_revoked', type: 'tinyint', default: 0 })
  sysRefreshTokenRevoked!: number;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'sys_user_id' })
  user!: UserEntity;
}
