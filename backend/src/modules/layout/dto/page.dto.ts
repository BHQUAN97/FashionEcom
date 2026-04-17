import { IsString, IsOptional, IsInt, Min, Max, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreatePageDto {
  @IsString()
  @MaxLength(255)
  slug!: string;

  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  content!: string;

  @IsOptional() @IsString() @MaxLength(500)
  excerpt?: string;

  @IsOptional() @IsString() @MaxLength(500)
  thumbnail?: string;

  @IsOptional() @IsString() @MaxLength(255)
  seoTitle?: string;

  @IsOptional() @IsString() @MaxLength(500)
  seoDescription?: string;

  @IsOptional() @IsInt() @Min(0) @Max(1)
  status?: number;

  @IsOptional()
  sort?: number;
}

export class UpdatePageDto extends PartialType(CreatePageDto) {}
