import { IsString, IsOptional, IsInt, Min, Max, MaxLength, Matches } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, { message: '$property must be a UUID' })
  @IsOptional()
  parentId?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  banner?: string;

  @IsInt()
  @Min(0)
  @Max(1)
  @IsOptional()
  status?: number;
}
