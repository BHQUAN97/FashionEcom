import { IsArray, ValidateNested, IsInt, IsString, Matches, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ImportItemDto {
  @IsString()
  sku!: string;

  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, { message: '$property must be a UUID' })
  warehouseId!: string;

  /** So luong nhap kho: phai la so nguyen duong, toi da 10,000 */
  @IsInt({ message: 'So luong phai la so nguyen' })
  @Min(1, { message: 'So luong nhap phai >= 1' })
  @Max(10000, { message: 'So luong nhap toi da 10,000 moi item' })
  qty!: number;
}

export class ImportInventoryDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportItemDto)
  items!: ImportItemDto[];
}
