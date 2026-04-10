import { IsArray, IsString, IsUUID } from 'class-validator';

export class BulkOrderActionDto {
  @IsArray()
  @IsUUID('4', { each: true })
  ids!: string[];

  @IsString()
  action!: string; // 'confirm' | 'cancel'
}
