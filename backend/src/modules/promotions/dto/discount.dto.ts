import {
  IsString, IsNumber, IsOptional, IsDateString, IsObject, IsArray,
  IsInt, Min, Max, MaxLength, ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/** Dieu kien ap dung ma giam gia — strict schema, chong injection */
export class DiscountConditionsDto {
  @IsOptional() @IsNumber() @Min(0)
  min_order_value?: number;

  @IsOptional() @IsInt() @Min(1)
  min_quantity?: number;

  @IsOptional() @IsArray() @IsString({ each: true })
  category_ids?: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  product_ids?: string[];
}

export class CreateDiscountDto {
  @IsString()
  @MaxLength(50)
  code!: string;

  /** 1=phan tram, 2=so tien co dinh */
  @IsInt()
  @Min(1)
  @Max(2)
  type!: number;

  /** Gia tri giam: 0-100 cho %, >= 0 cho fixed — service validate theo type */
  @IsNumber()
  @Min(0)
  value!: number;

  /** Muc giam toi da (chi ap dung cho type=1 phan tram) */
  @IsOptional() @IsNumber() @Min(0)
  maxAmount?: number;

  /** Dieu kien ap dung — validated nested object */
  @IsOptional()
  @ValidateNested()
  @Type(() => DiscountConditionsDto)
  conditionsJson?: DiscountConditionsDto;

  /** So luot su dung toi da (0 = khong gioi han) */
  @IsOptional() @IsInt() @Min(0)
  maxUsage?: number;

  /** So luot toi da per customer */
  @IsOptional() @IsInt() @Min(0)
  maxPerCustomer?: number;

  @IsOptional() @IsDateString()
  startDate?: string;

  @IsOptional() @IsDateString()
  endDate?: string;

  /** 0=khong stackable, 1=stackable */
  @IsOptional() @IsInt() @Min(0) @Max(1)
  stackable?: number;

  /** 0=inactive, 1=active */
  @IsOptional() @IsInt() @Min(0) @Max(1)
  status?: number;

  /** 0=tat ca, 1=chi logged-in, 2=whitelist customer */
  @IsOptional() @IsInt() @Min(0) @Max(2)
  customerScope?: number;

  @IsOptional() @IsArray() @IsString({ each: true })
  customerIds?: string[];
}

export class UpdateDiscountDto extends CreateDiscountDto {}

export class ApplyDiscountDto {
  @IsString()
  code!: string;

  @IsNumber()
  cartSubtotal!: number;

  @IsNumber()
  cartItemCount!: number;

  @IsOptional() @IsString()
  customerId?: string;

  @IsOptional() @IsArray()
  cartCategoryIds?: string[];

  @IsOptional() @IsArray()
  cartProductIds?: string[];

  @IsOptional() @IsNumber()
  customerOrderCount?: number;

  @IsOptional() @IsArray()
  existingDiscountCodes?: string[];
}

export class DiscountQueryDto {
  @IsOptional() @IsNumber()
  page?: number;

  @IsOptional() @IsNumber()
  limit?: number;

  @IsOptional() @IsString()
  search?: string;

  @IsOptional() @IsNumber()
  status?: number;
}
