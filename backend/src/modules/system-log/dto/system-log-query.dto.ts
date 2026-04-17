import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class SystemLogQueryDto {
  @IsOptional()
  @IsString()
  level?: string; // DEBUG, INFO, WARN, ERROR, FATAL

  @IsOptional()
  @IsString()
  method?: string; // GET, POST, PUT, DELETE

  @IsOptional()
  @IsString()
  url?: string; // Tim kiem theo url (LIKE)

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  statusMin?: number; // VD: 400

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  statusMax?: number; // VD: 599

  @IsOptional()
  @IsString()
  dateFrom?: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  dateTo?: string; // YYYY-MM-DD

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}
