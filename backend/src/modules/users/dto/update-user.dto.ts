import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @Min(1)
  @Max(6)
  @IsOptional()
  role?: number;

  @IsInt()
  @Min(0)
  @Max(1)
  @IsOptional()
  status?: number;

  @IsString()
  @IsOptional()
  avatar?: string;
}
