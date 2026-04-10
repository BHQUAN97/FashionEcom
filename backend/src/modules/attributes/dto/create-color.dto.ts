import { IsString, MaxLength, IsOptional, IsNumber, Matches } from 'class-validator';

export class CreateColorDto {
  @IsString()
  @MaxLength(50)
  name!: string;

  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'HEX color phai co format #RRGGBB' })
  hex!: string;

  @IsNumber()
  @IsOptional()
  sort?: number;
}

export class UpdateColorDto {
  @IsString()
  @MaxLength(50)
  @IsOptional()
  name?: string;

  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'HEX color phai co format #RRGGBB' })
  @IsOptional()
  hex?: string;

  @IsNumber()
  @IsOptional()
  sort?: number;

  @IsNumber()
  @IsOptional()
  status?: number;
}
