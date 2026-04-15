import { IsArray, ValidateNested, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CartItemDto {
  @IsString()
  variantId!: string;

  @IsInt()
  @Min(1)
  qty!: number;
}

/**
 * DTO validate gio hang — gui danh sach variant + qty
 * BE tra ve gia moi nhat (bao gom sale price) cho moi item
 */
export class ValidateCartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items!: CartItemDto[];
}
