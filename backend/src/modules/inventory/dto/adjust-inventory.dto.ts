import { IsNumber, IsString, IsOptional, IsUUID } from 'class-validator';

export class AdjustInventoryDto {
  @IsUUID()
  variantId!: string;

  @IsUUID()
  warehouseId!: string;

  @IsNumber()
  qty!: number; // So luong dieu chinh (+ nhap, - xuat)

  @IsString()
  reason!: string; // import, damage, lost, correction

  @IsString()
  @IsOptional()
  note?: string;
}
