import { IsString, IsNumber, IsOptional, IsInt, IsIn, Min, Max, MaxLength } from 'class-validator';

/** DVVC hop le */
const VALID_PROVIDERS = ['GHN', 'GHTK', 'NINJA_VAN', 'JT', 'BEST', 'VIETTEL_POST', 'MANUAL'] as const;

/** DTO tao/cap nhat cau hinh shipping */
export class UpsertShippingConfigDto {
  @IsIn(VALID_PROVIDERS, {
    message: `Provider phai la: ${VALID_PROVIDERS.join(', ')}`,
  })
  provider!: string;

  @IsString() @MaxLength(100)
  name!: string;

  /** Phi dong gia thu KH (VND) */
  @IsNumber() @Min(0) @Max(999_999_999)
  flatRate!: number;

  /** Chi phi thuc te tra ĐVVC (VND) */
  @IsNumber() @Min(0) @Max(999_999_999)
  actualCost!: number;

  /** Nguong mien phi ship (VND). 0 = khong mien phi */
  @IsNumber() @Min(0) @Max(999_999_999)
  freeShipThreshold!: number;

  @IsOptional() @IsInt() @Min(0) @Max(1)
  status?: number;

  @IsOptional() @IsInt() @Min(0) @Max(100)
  sortOrder?: number;
}

/** DTO edit phi ship cho 1 don hang — admin override */
export class UpdateOrderShippingDto {
  /** Phi ship thu KH (VND) — 0 neu mien phi */
  @IsNumber() @Min(0) @Max(999_999_999)
  shippingFee!: number;

  /** Chi phi ship thuc te tra DVVC (VND) */
  @IsNumber() @Min(0) @Max(999_999_999)
  shippingCostActual!: number;

  /** Danh dau free ship */
  @IsOptional() @IsInt() @Min(0) @Max(1)
  freeShip?: number;

  /** Don vi van chuyen */
  @IsOptional()
  @IsIn([...VALID_PROVIDERS], {
    message: `Provider phai la: ${VALID_PROVIDERS.join(', ')}`,
  })
  shippingProvider?: string;

  /** Ly do chinh sua */
  @IsOptional() @IsString() @MaxLength(500)
  note?: string;
}
