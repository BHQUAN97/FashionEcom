import {
  IsString, IsOptional, IsNumber, Min,
  MaxLength, IsUUID,
} from 'class-validator';

/** DTO tao product variant — validate SKU, gia, stock */
export class CreateVariantDto {
  @IsString()
  @MaxLength(50)
  catProductVariantSku!: string;

  @IsNumber()
  @Min(0)
  catProductVariantPrice!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  catProductVariantSalePrice?: number;

  @IsUUID()
  @IsOptional()
  catColorId?: string;

  @IsUUID()
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
