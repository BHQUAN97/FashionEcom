import { IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '@/common/dto/pagination.dto';

export class CustomerQueryDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tier?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sortBySpent?: number; // 1 = asc, -1 = desc
}
