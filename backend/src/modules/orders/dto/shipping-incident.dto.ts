import {
  IsString, IsNumber, IsOptional, IsInt, IsArray, IsUUID,
  Min, Max, MaxLength, ArrayMaxSize,
} from 'class-validator';

/** Tao su co van chuyen */
export class CreateShippingIncidentDto {
  @IsUUID('4', { message: 'orderId phai la UUID' })
  orderId!: string;

  /** 1=hu_hong, 2=mat_hang, 3=khach_tu_choi, 4=giao_lai, 5=dia_chi_sai, 6=khac */
  @IsInt() @Min(1) @Max(6)
  type!: number;

  /** So lan giao hang hien tai */
  @IsOptional() @IsInt() @Min(1) @Max(10)
  deliveryAttempts?: number;

  /** Phu phi phat sinh (giao lai, luu kho) */
  @IsOptional() @IsNumber() @Min(0) @Max(999_999_999)
  extraCost?: number;

  /** Gia tri hang hu hong / mat */
  @IsOptional() @IsNumber() @Min(0) @Max(999_999_999)
  productLoss?: number;

  /** So tien hoan tra KH */
  @IsOptional() @IsNumber() @Min(0) @Max(999_999_999)
  refundAmount?: number;

  /** So tien DVVC boi thuong */
  @IsOptional() @IsNumber() @Min(0) @Max(999_999_999)
  carrierCompensation?: number;

  /** 0=binh thuong, 1=mat toan bo DT, 2=giam 1 phan */
  @IsOptional() @IsInt() @Min(0) @Max(2)
  revenueImpact?: number;

  @IsOptional() @IsString() @MaxLength(2000)
  note?: string;

  @IsOptional() @IsArray() @IsString({ each: true }) @ArrayMaxSize(10)
  photos?: string[];
}

/** Cap nhat su co */
export class UpdateShippingIncidentDto {
  /** 0=open, 1=investigating, 2=resolved, 3=closed */
  @IsOptional() @IsInt() @Min(0) @Max(3)
  status?: number;

  @IsOptional() @IsInt() @Min(1) @Max(10)
  deliveryAttempts?: number;

  @IsOptional() @IsNumber() @Min(0) @Max(999_999_999)
  extraCost?: number;

  @IsOptional() @IsNumber() @Min(0) @Max(999_999_999)
  productLoss?: number;

  @IsOptional() @IsNumber() @Min(0) @Max(999_999_999)
  refundAmount?: number;

  @IsOptional() @IsNumber() @Min(0) @Max(999_999_999)
  carrierCompensation?: number;

  @IsOptional() @IsInt() @Min(0) @Max(2)
  revenueImpact?: number;

  @IsOptional() @IsString() @MaxLength(2000)
  note?: string;

  @IsOptional() @IsArray() @IsString({ each: true }) @ArrayMaxSize(10)
  photos?: string[];
}

import { Type } from 'class-transformer';

/** Query su co */
export class ShippingIncidentQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit?: number;

  /** Filter theo type: 1-6 */
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(6)
  type?: number;

  /** Filter theo status: 0-3 */
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(3)
  status?: number;

  @IsOptional() @IsString()
  from?: string;

  @IsOptional() @IsString()
  to?: string;

  @IsOptional() @IsString()
  search?: string;
}
