import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateBannerDto {
  @IsString()
  title!: string;

  @IsString()
  imageDesktop!: string;

  @IsString()
  imageMobile!: string;

  @IsOptional() @IsString()
  alt?: string;

  @IsOptional() @IsString()
  link?: string;

  @IsOptional() @IsString()
  ctaText?: string;

  @IsOptional() @IsNumber()
  sort?: number;

  @IsOptional() @IsDateString()
  startDate?: string;

  @IsOptional() @IsDateString()
  endDate?: string;

  @IsOptional() @IsNumber()
  status?: number;

  @IsOptional() @IsString()
  abVariant?: string;

  @IsOptional() @IsString()
  abGroupId?: string;
}

export class UpdateBannerDto extends CreateBannerDto {}

export class ReorderBannersDto {
  ids!: string[];
}
