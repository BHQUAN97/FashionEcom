import { IsNotEmpty, IsString, IsNumber, IsOptional, IsInt, Min, Max, MaxLength } from 'class-validator';

export class RedeemPointsDto {
  @IsNotEmpty()
  @IsString()
  orderId!: string;

  /** So diem doi: phai la so nguyen duong, toi da 1,000,000 */
  @IsNotEmpty()
  @IsInt()
  @Min(1, { message: 'So diem doi phai >= 1' })
  @Max(1_000_000, { message: 'So diem doi toi da 1,000,000 moi lan' })
  points!: number;
}

export class AdjustPointsDto {
  @IsNotEmpty()
  @IsString()
  customerId!: string;

  /** So diem dieu chinh: + cong, - tru. Gioi han +-100,000 moi lan */
  @IsNotEmpty()
  @IsInt()
  @Min(-100_000, { message: 'Dieu chinh toi da -100,000 diem moi lan' })
  @Max(100_000, { message: 'Dieu chinh toi da +100,000 diem moi lan' })
  points!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class UpdateLoyaltyConfigDto {
  /** Ti le tich diem: VND per diem, phai > 0 */
  @IsOptional() @IsNumber() @Min(1) @Max(1_000_000)
  earnRate?: number;

  /** Ti le doi diem: diem per VND, phai > 0 */
  @IsOptional() @IsNumber() @Min(1) @Max(10000)
  redeemRate?: number;

  /** % toi da don hang duoc giam bang diem: 0-60% */
  @IsOptional() @IsNumber() @Min(0) @Max(60)
  maxRedeemPercent?: number;

  /** So diem toi thieu de doi */
  @IsOptional() @IsInt() @Min(0) @Max(100000)
  minRedeemPoints?: number;

  /** So thang het han diem */
  @IsOptional() @IsInt() @Min(1) @Max(36)
  expiryMonths?: number;

  /** So ngay pending truoc khi diem khả dung */
  @IsOptional() @IsInt() @Min(0) @Max(90)
  pendingDays?: number;

  @IsOptional() @IsInt() @Min(0)
  silverThreshold?: number;

  @IsOptional() @IsInt() @Min(0)
  goldThreshold?: number;

  @IsOptional() @IsInt() @Min(0)
  platinumThreshold?: number;
}
