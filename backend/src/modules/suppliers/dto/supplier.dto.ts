import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsInt, Min, Max, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSupplierDto {
  @IsNotEmpty() @IsString() @MaxLength(50) code!: string;
  @IsNotEmpty() @IsString() @MaxLength(255) name!: string;
  @IsOptional() @IsString() @MaxLength(20) taxCode?: string;
  @IsOptional() @IsString() @MaxLength(255) address?: string;
  @IsOptional() @IsString() @MaxLength(100) contactName?: string;
  @IsOptional() @IsString() @MaxLength(50) phone?: string;
  @IsOptional() @IsString() @MaxLength(100) email?: string;
  @IsOptional() @IsString() @MaxLength(255) paymentTerms?: string;
}

export class POItemDto {
  @IsNotEmpty() @IsString() variantId!: string;

  /** So luong dat: phai la so nguyen duong */
  @IsNotEmpty() @IsInt() @Min(1, { message: 'So luong dat phai >= 1' }) @Max(100000)
  qty!: number;

  /** Don gia nhap: phai >= 0, toi da 999,999,999 VND */
  @IsNotEmpty() @IsNumber() @Min(0, { message: 'Don gia phai >= 0' }) @Max(999_999_999)
  unitCost!: number;

  @IsOptional() @IsString() @MaxLength(50) supplierSku?: string;
}

export class CreatePurchaseOrderDto {
  @IsNotEmpty() @IsString() supplierId!: string;
  @IsNotEmpty() @IsString() warehouseId!: string;
  @IsOptional() @IsString() expectedDate?: string;
  @IsOptional() @IsString() notes?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => POItemDto)
  items!: POItemDto[];
}

export class ReceiveGoodsItemDto {
  @IsNotEmpty() @IsString() variantId!: string;

  /** So luong nhan: phai la so nguyen duong */
  @IsNotEmpty() @IsInt() @Min(0, { message: 'So luong nhan phai >= 0' }) @Max(100000)
  receivedQty!: number;

  @IsOptional() @IsString() @MaxLength(500) notes?: string;
}

export class ReceiveGoodsDto {
  @IsNotEmpty() @IsString() warehouseId!: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiveGoodsItemDto)
  items!: ReceiveGoodsItemDto[];
}

export class SupplierQueryDto {
  @IsOptional() @IsNumber() page?: number;
  @IsOptional() @IsNumber() limit?: number;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsNumber() status?: number;
}
