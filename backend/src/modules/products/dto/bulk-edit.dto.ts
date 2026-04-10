import { IsArray, IsOptional, IsInt, Min, Max, IsNumber, IsUUID } from 'class-validator';

export class BulkEditProductDto {
  @IsArray()
  @IsUUID('4', { each: true })
  ids!: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2)
  status?: number;
}

export class BulkEditVariantDto {
  @IsArray()
  @IsUUID('4', { each: true })
  ids!: string[];

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  comparePrice?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  status?: number;
}
