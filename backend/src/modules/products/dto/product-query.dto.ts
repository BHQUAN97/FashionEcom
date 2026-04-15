import { IsOptional, IsString, IsNumber, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '@/common/dto/pagination.dto';

export class ProductQueryDto extends PaginationDto {
  @IsOptional()
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, { message: '$property must be a UUID' })
  categoryId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  status?: number;

  @IsOptional()
  @IsString()
  stockStatus?: string; // in_stock, low_stock, out_of_stock

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceMax?: number;
}
