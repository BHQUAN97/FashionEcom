import { IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ThemeConfigEntryDto {
  @IsString()
  key!: string;

  @IsString()
  value!: string;
}

export class UpdateThemeConfigDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ThemeConfigEntryDto)
  entries!: ThemeConfigEntryDto[];
}
