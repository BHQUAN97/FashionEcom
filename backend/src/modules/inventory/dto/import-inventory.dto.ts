import { IsArray, ValidateNested, IsNumber, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class ImportItemDto {
  @IsString()
  sku!: string;

  @IsUUID()
  warehouseId!: string;

  @IsNumber()
  qty!: number;
}

export class ImportInventoryDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportItemDto)
  items!: ImportItemDto[];
}
