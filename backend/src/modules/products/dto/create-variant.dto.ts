import {
  IsString, IsOptional, IsNumber, Min, Max,
  MaxLength, Matches, Validate, ValidatorConstraint,
  ValidatorConstraintInterface, ValidationArguments,
} from 'class-validator';

/**
 * Custom validator: sale price phai nho hon regular price
 * Chong viec set sale price >= regular price (vo nghia hoac loi)
 */
@ValidatorConstraint({ name: 'salePriceLessThanRegular', async: false })
export class SalePriceLessThanRegularConstraint implements ValidatorConstraintInterface {
  validate(salePrice: number, args: ValidationArguments) {
    const obj = args.object as CreateVariantDto;
    // Neu khong co sale price hoac = 0 thi pass
    if (!salePrice || salePrice === 0) return true;
    // Sale price phai < regular price
    return salePrice < obj.catProductVariantPrice;
  }
  defaultMessage() {
    return 'Gia khuyen mai phai nho hon gia ban chinh';
  }
}

/** DTO tao product variant — validate SKU, gia, stock */
export class CreateVariantDto {
  @IsString()
  @MaxLength(50)
  catProductVariantSku!: string;

  @IsNumber()
  @Min(1, { message: 'Gia san pham phai >= 1 VND' })
  @Max(999_999_999, { message: 'Gia san pham toi da 999,999,999 VND' })
  catProductVariantPrice!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Validate(SalePriceLessThanRegularConstraint)
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
