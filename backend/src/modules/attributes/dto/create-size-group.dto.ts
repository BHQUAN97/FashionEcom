import { IsString, MaxLength, IsOptional, IsArray, IsNumber } from 'class-validator';

export class CreateSizeGroupDto {
  @IsString()
  @MaxLength(100)
  name!: string;

  @IsArray()
  @IsString({ each: true })
  values!: string[];

  @IsString()
  @IsOptional()
  guide?: string;

  @IsNumber()
  @IsOptional()
  sort?: number;
}

export class UpdateSizeGroupDto {
  @IsString()
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  values?: string[];

  @IsString()
  @IsOptional()
  guide?: string;

  @IsNumber()
  @IsOptional()
  sort?: number;
}
