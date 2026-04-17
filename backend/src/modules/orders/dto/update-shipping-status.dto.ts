import { IsInt, Min, Max, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateShippingStatusDto {
  /** 0-10: trang thai van chuyen */
  @IsInt()
  @Min(0)
  @Max(10)
  status!: number;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  note?: string;

  /** Ma tracking DVVC */
  @IsString()
  @MaxLength(50)
  @IsOptional()
  trackingCode?: string;
}
