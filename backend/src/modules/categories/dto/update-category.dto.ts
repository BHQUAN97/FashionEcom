import { IsString, IsOptional, IsInt, Min, Max, MaxLength, IsUUID } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @MaxLength(255)
  @IsOptional()
  name?: string;

  @IsUUID()
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
