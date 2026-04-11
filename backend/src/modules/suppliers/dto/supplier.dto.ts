import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSupplierDto {
  @IsNotEmpty() @IsString() code!: string;
  @IsNotEmpty() @IsString() name!: string;
  @IsOptional() @IsString() taxCode?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() contactName?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() paymentTerms?: string;
}

export class POItemDto {
  @IsNotEmpty() @IsString() variantId!: string;
  @IsNotEmpty() @IsNumber() qty!: number;
  @IsNotEmpty() @IsNumber() unitCost!: number;
  @IsOptional() @IsString() supplierSku?: string;
}

export class CreatePurchaseOrderDto {
  @IsNotEmpty() @IsString() supplierId!: string;
  @IsNotEmpty() @IsString() warehouseId!: string;
  @IsOptional() @IsString() expectedDate?: string;
  @IsOptional() @IsString() notes?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => POItemDto)
  items!: POItemDto[];
}

export class ReceiveGoodsDto {
  @IsNotEmpty() @IsString() warehouseId!: string;
  @IsArray()
  items!: { variantId: string; receivedQty: number; notes?: string }[];
}

export class SupplierQueryDto {
  @IsOptional() @IsNumber() page?: number;
  @IsOptional() @IsNumber() limit?: number;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsNumber() status?: number;
}
