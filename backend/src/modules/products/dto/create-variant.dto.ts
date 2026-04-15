import {
  IsString, IsOptional, IsNumber, Min,
  MaxLength, Matches,
} from 'class-validator';

/** DTO tao product variant — validate SKU, gia, stock */
export class CreateVariantDto {
  @IsString()
  @MaxLength(50)
  catProductVariantSku!: string;

  @IsNumber()
  @Min(1, { message: 'Gia san pham phai >= 1 VND' })
  catProductVariantPrice!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  catProductVariantSalePrice?: number;

  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, { message: '$property must be a UUID' })
  @IsOptional()
  catColorId?: string;

  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, { message: '$property must be a UUID' })
  @IsOptional()
  catSizeId?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  catProductVariantWeight?: number;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  catProductVariantBarcode?: string;
}
