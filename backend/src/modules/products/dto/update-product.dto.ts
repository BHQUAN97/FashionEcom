import { IsString, IsOptional, IsInt, Min, Max, MaxLength, IsUUID } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  shortDesc?: string;

  @IsInt()
  @Min(0)
  @Max(2)
  @IsOptional()
  status?: number;

  @IsString()
  @IsOptional()
  @MaxLength(60)
  seoTitle?: string;

  @IsString()
  @IsOptional()
  @MaxLength(160)
  seoDesc?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  brand?: string;

  @IsInt()
  @IsOptional()
  isFeatured?: number;

  @IsInt()
  @IsOptional()
  isNew?: number;
}
