import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '@/common/dto/pagination.dto';

export class OrderQueryDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  status?: number;

  /** Filter trang thai van chuyen: 0-10 */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  shippingStatus?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  paymentStatus?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  paymentType?: number;

  /** 1=chi don co su co */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  hasIncident?: number;

  @IsOptional()
  @IsString()
  dateFrom?: string;

  @IsOptional()
  @IsString()
  dateTo?: string;
}
