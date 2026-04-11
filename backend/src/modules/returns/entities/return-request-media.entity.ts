import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ReturnRequestEntity } from './return-request.entity';

@Entity('sal_return_request_media')
export class ReturnRequestMediaEntity {
  @PrimaryColumn('char', { length: 36, name: 'sal_return_request_media_id', default: () => '(UUID())' })
  salReturnRequestMediaId!: string;

  @Column({ name: 'sal_return_request_id', type: 'char', length: 36 })
  salReturnRequestId!: string;

  @Column({ name: 'sal_return_request_media_path', type: 'varchar', length: 255 })
  salReturnRequestMediaPath!: string;

  @Column({ name: 'sal_return_request_media_type', type: 'tinyint', default: 1 })
  salReturnRequestMediaType!: number;

  @ManyToOne(() => ReturnRequestEntity, (r) => r.media)
  @JoinColumn({ name: 'sal_return_request_id' })
  returnRequest!: ReturnRequestEntity;
}
