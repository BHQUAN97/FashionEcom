import { PrimaryColumn, CreateDateColumn } from 'typeorm';

/**
 * Base entity: UUID PK + created_date (MISA convention)
 * Moi entity ke thua class nay
 */
export abstract class BaseEntity {
  @PrimaryColumn('char', { length: 36, default: () => '(UUID())' })
  id!: string;

  @CreateDateColumn({ name: 'created_date', type: 'datetime' })
  createdDate!: Date;
}
