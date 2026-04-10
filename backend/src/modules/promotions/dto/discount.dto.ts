import { IsString, IsNumber, IsOptional, IsDateString, IsObject, IsArray } from 'class-validator';

export class CreateDiscountDto {
  @IsString()
  code!: string;

  @IsNumber()
  type!: number;

  @IsNumber()
  value!: number;

  @IsOptional() @IsNumber()
  maxAmount?: number;

  @IsOptional() @IsObject()
  conditionsJson?: Record<string, unknown>;

  @IsOptional() @IsNumber()
  maxUsage?: number;

  @IsOptional() @IsNumber()
  maxPerCustomer?: number;

  @IsOptional() @IsDateString()
  startDate?: string;

  @IsOptional() @IsDateString()
  endDate?: string;

  @IsOptional() @IsNumber()
  stackable?: number;

  @IsOptional() @IsNumber()
  status?: number;

  @IsOptional() @IsNumber()
  customerScope?: number;

  @IsOptional() @IsArray()
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
