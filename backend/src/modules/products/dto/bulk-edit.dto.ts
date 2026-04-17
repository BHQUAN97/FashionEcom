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

  /** Gia ban — phai >= 1 VND, chong set gia 0 hoac am */
  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Gia san pham phai >= 1 VND' })
  price?: number;

  /** Gia so sanh (gia goc truoc giam) — phai >= 0 */
  @IsOptional()
  @IsNumber()
  @Min(0)
  comparePrice?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1)
  status?: number;
}
