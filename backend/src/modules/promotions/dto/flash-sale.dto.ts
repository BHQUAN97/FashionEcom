import { IsString, IsNumber, IsOptional, IsDateString, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class FlashSaleItemDto {
  @IsString()
  productId!: string;

  /** Phan tram giam gia: 1-99% — KHONG cho 100% (mien phi) hoac <= 0 */
  @IsNumber()
  @Min(1, { message: 'Phan tram giam phai >= 1%' })
  @Max(60, { message: 'Phan tram giam toi da 60%' })
  discountPct!: number;

  /** So luong toi da: >= 1, chong set negative/zero */
  @IsNumber()
  @Min(1, { message: 'So luong toi da phai >= 1' })
  maxQty!: number;
}

export class CreateFlashSaleDto {
  @IsString()
  title!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional() @IsNumber()
  status?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlashSaleItemDto)
  items!: FlashSaleItemDto[];
}

export class UpdateFlashSaleDto extends CreateFlashSaleDto {}

export class FlashSaleQueryDto {
  @IsOptional() @IsNumber()
  page?: number;

  @IsOptional() @IsNumber()
  limit?: number;

  @IsOptional() @IsNumber()
  status?: number;
}
