import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ReturnItemDto {
  @IsNotEmpty()
  @IsString()
  orderItemId!: string;

  @IsNotEmpty()
  @IsNumber()
  qty!: number;

  @IsOptional()
  @IsString()
  exchangeVariantId?: string;
}

export class CreateReturnDto {
  @IsNotEmpty()
  @IsString()
  orderId!: string;

  @IsNotEmpty()
  @IsNumber()
  type!: number;

  @IsNotEmpty()
  @IsNumber()
  reason!: number;

  @IsOptional()
  @IsString()
  reasonDetail?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReturnItemDto)
  items!: ReturnItemDto[];

  @IsOptional()
  @IsString()
  customerNotes?: string;
}

export class UpdateReturnStatusDto {
  @IsNotEmpty()
  @IsNumber()
  status!: number;

  @IsOptional()
  @IsString()
  staffNotes?: string;

  @IsOptional()
  @IsNumber()
  refundAmount?: number;
}

export class ReturnQueryDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsNumber()
  status?: number;

  @IsOptional()
  @IsString()
  search?: string;
}
