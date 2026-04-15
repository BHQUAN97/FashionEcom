import { IsArray, IsOptional, IsNumber, Min, Matches } from 'class-validator';

/**
 * DTO generate variant matrix tu danh sach colorIds x sizeIds
 * Moi combo tao 1 variant voi gia mac dinh, co the chinh sau
 */
export class GenerateVariantsDto {
  @IsArray()
  @IsOptional()
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, {
    each: true,
    message: 'Moi phan tu colorIds phai la UUID',
  })
  colorIds?: string[];

  @IsArray()
  @IsOptional()
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, {
    each: true,
    message: 'Moi phan tu sizeIds phai la UUID',
  })
  sizeIds?: string[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  defaultPrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  defaultComparePrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  defaultCost?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  defaultWeight?: number;
}
