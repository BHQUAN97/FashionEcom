import { IsArray, ValidateNested, IsUUID, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ReorderItemDto {
  @IsUUID()
  id!: string;

  @IsUUID()
  @IsOptional()
  parentId?: string | null;

  @IsNumber()
  sort!: number;
}

export class ReorderCategoryDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items!: ReorderItemDto[];
}
