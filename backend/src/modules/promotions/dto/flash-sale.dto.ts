import { IsString, IsNumber, IsOptional, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class FlashSaleItemDto {
  @IsString()
  productId!: string;

  @IsNumber()
  discountPct!: number;

  @IsNumber()
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
