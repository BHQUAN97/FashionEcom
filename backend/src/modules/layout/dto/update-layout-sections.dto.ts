import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsObject, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class LayoutSectionDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  type!: string;

  @IsObject()
  config!: Record<string, unknown>;

  @IsNumber()
  sort!: number;

  @IsNumber()
  visible!: number;
}

export class UpdateLayoutSectionsDto {
  @IsString()
  page!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LayoutSectionDto)
  sections!: LayoutSectionDto[];
}

export class ScheduleLayoutDto {
  @IsString()
  page!: string;

  @IsString()
  publishAt!: string;
}
