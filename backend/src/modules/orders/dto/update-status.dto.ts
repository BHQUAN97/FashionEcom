import { IsInt, Min, Max, IsOptional, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsInt()
  @Min(0)
  @Max(6)
  status!: number;

  @IsString()
  @IsOptional()
  note?: string;
}
