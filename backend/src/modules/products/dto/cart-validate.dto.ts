import { IsArray, ValidateNested, IsString, IsInt, Min, Max, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';

export class CartItemDto {
  @IsString()
  variantId!: string;

  /** So luong: toi da 99 moi item */
  @IsInt()
  @Min(1)
  @Max(99, { message: 'So luong toi da 99 moi san pham' })
  qty!: number;
}

/**
 * DTO validate gio hang — gui danh sach variant + qty
 * BE tra ve gia moi nhat (bao gom sale price) cho moi item
 */
export class ValidateCartDto {
  @IsArray()
  @ArrayMaxSize(50, { message: 'Gio hang toi da 50 san pham' })
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items!: CartItemDto[];
}
