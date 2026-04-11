import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationDto } from '@/common/dto/pagination.dto';

export class InventoryQueryDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @IsOptional()
  @IsString()
  stockStatus?: string; // in_stock, low_stock, out_of_stock

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
