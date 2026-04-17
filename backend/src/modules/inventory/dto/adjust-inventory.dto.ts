import { IsInt, IsString, IsOptional, Matches, Min, Max, MaxLength } from 'class-validator';

export class AdjustInventoryDto {
  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, { message: '$property must be a UUID' })
  variantId!: string;

  @Matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, { message: '$property must be a UUID' })
  warehouseId!: string;

  /** So luong dieu chinh: + nhap, - xuat. Gioi han +-10,000 moi lan */
  @IsInt({ message: 'So luong phai la so nguyen' })
  @Min(-10000, { message: 'Dieu chinh toi da -10,000 moi lan' })
  @Max(10000, { message: 'Dieu chinh toi da +10,000 moi lan' })
  qty!: number;

  /** Ly do: import, damage, lost, correction */
  @IsString()
  @MaxLength(50)
  reason!: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  note?: string;
}
