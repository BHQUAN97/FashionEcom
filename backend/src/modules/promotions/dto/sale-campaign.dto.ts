import {
  IsString, IsOptional, IsNumber, IsInt, Min, Max,
  IsDateString, IsArray, ValidateNested, MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '@/common/dto/pagination.dto';

/** Item trong campaign — override gia per variant */
export class CampaignVariantItemDto {
  @IsString()
  variantId!: string;

  @IsInt()
  @IsOptional()
  discountType?: number; // 1=%, 2=fixed. null=dùng default campaign

  @IsNumber()
  @Min(0)
  @IsOptional()
  discountValue?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  salePrice?: number; // Gia sale truc tiep (override tat ca)

  @IsInt()
  @IsOptional()
  status?: number;
}

export class CreateSaleCampaignDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsOptional()
  desc?: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsInt()
  @Min(1)
  @Max(2)
  @IsOptional()
  discountType?: number; // 1=%, 2=fixed

  /** Gia tri giam: 0-100 cho %, >= 0 cho fixed — service validate theo type */
  @IsNumber()
  @Min(0)
  @Max(50_000_000, { message: 'Gia tri giam toi da 50,000,000 VND' })
  @IsOptional()
  discountValue?: number;

  @IsInt()
  @Min(0)
  @Max(10)
  @IsOptional()
  priority?: number;

  /** 0=draft, 1=scheduled, 2=active, 3=ended */
  @IsInt()
  @Min(0)
  @Max(3)
  @IsOptional()
  status?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CampaignVariantItemDto)
  @IsOptional()
  variants?: CampaignVariantItemDto[];
}

export class UpdateSaleCampaignDto extends CreateSaleCampaignDto {}

/** Bulk set gia cho nhieu variant trong campaign */
export class BulkSetCampaignPriceDto {
  @IsArray()
  @IsString({ each: true })
  variantIds!: string[];

  @IsInt()
  @IsOptional()
  discountType?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discountValue?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  salePrice?: number;
}

export class SaleCampaignQueryDto extends PaginationDto {
  @IsInt()
  @IsOptional()
  status?: number;
}
