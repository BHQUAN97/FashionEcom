import { IsString, IsOptional, IsInt, IsNumber, Min, Max, MaxLength, Matches } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(20)
  code!: string;

  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, { message: '$property must be a UUID' })
  categoryId!: string;

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

  @IsString()
  @IsOptional()
  @MaxLength(100)
  origin?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  material?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  packagingType?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  condition?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  weight?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  length?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  width?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  height?: number;

  @IsInt()
  @IsOptional()
  preOrder?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(15)
  preOrderDays?: number;
}
