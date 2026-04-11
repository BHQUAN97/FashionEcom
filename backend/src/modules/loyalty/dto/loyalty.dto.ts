import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class RedeemPointsDto {
  @IsNotEmpty()
  @IsString()
  orderId!: string;

  @IsNotEmpty()
  @IsNumber()
  points!: number;
}

export class AdjustPointsDto {
  @IsNotEmpty()
  @IsString()
  customerId!: string;

  @IsNotEmpty()
  @IsNumber()
  points!: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateLoyaltyConfigDto {
  @IsOptional()
  @IsNumber()
  earnRate?: number;

  @IsOptional()
  @IsNumber()
  redeemRate?: number;

  @IsOptional()
  @IsNumber()
  maxRedeemPercent?: number;

  @IsOptional()
  @IsNumber()
  minRedeemPoints?: number;

  @IsOptional()
  @IsNumber()
  expiryMonths?: number;

  @IsOptional()
  @IsNumber()
  pendingDays?: number;

  @IsOptional()
  @IsNumber()
  silverThreshold?: number;

  @IsOptional()
  @IsNumber()
  goldThreshold?: number;

  @IsOptional()
  @IsNumber()
  platinumThreshold?: number;
}
