import { IsArray, ValidateNested, Matches, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ReorderItemDto {
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, { message: '$property must be a UUID' })
  id!: string;

  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, { message: '$property must be a UUID' })
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
