import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsInt, Min, Max, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class ReturnItemDto {
  @IsNotEmpty()
  @IsString()
  orderItemId!: string;

  /** So luong doi tra: phai la so nguyen duong */
  @IsNotEmpty()
  @IsInt()
  @Min(1, { message: 'So luong doi tra phai >= 1' })
  @Max(100, { message: 'So luong doi tra toi da 100' })
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
  @IsInt()
  @Min(0)
  @Max(7)
  status!: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  staffNotes?: string;

  /** So tien hoan tra: phai >= 0, service se validate khong vuot order total */
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'So tien hoan tra phai >= 0' })
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
