import { IsString, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MenuItemDto {
  @IsOptional() @IsString()
  id?: string;

  @IsOptional() @IsString()
  parentId?: string | null;

  @IsString()
  label!: string;

  @IsString()
  type!: string;

  @IsString()
  value!: string;

  @IsOptional() @IsString()
  icon?: string;

  @IsOptional() @IsString()
  badge?: string;

  @IsOptional() @IsNumber()
  openNewTab?: number;

  @IsOptional() @IsNumber()
  mobileVisible?: number;

  @IsNumber()
  sort!: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuItemDto)
  children?: MenuItemDto[];
}

export class UpdateMenuDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuItemDto)
  items!: MenuItemDto[];
}
