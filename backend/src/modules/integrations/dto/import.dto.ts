import { IsString, IsOptional, IsIn, IsObject, IsNumber, Min, Max, IsUrl, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO upload file CSV/Excel de import
 */
export class FileImportDto {
  @IsString()
  @IsIn(['product', 'inventory', 'customer', 'price'])
  target!: string;
}

/**
 * DTO tao/cap nhat cau hinh Google Sheets sync
 */
export class CreateSyncConfigDto {
  @IsString()
  name!: string;

  @IsUrl()
  sourceUrl!: string;

  @IsString()
  @IsIn(['product', 'inventory', 'customer', 'price'])
  target!: string;

  @IsOptional()
  @IsString()
  sheetName?: string;

  @IsOptional()
  @IsObject()
  columnMapping?: Record<string, string>;

  @IsOptional()
  @IsBoolean()
  autoSync?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(5)
  @Max(1440)
  intervalMinutes?: number;
}

export class UpdateSyncConfigDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  sheetName?: string;

  @IsOptional()
  @IsObject()
  columnMapping?: Record<string, string>;

  @IsOptional()
  @IsBoolean()
  autoSync?: boolean;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(5)
  @Max(1440)
  intervalMinutes?: number;
}

/**
 * DTO kich hoat sync thu cong
 */
export class TriggerSyncDto {
  @IsString()
  configId!: string;
}

/**
 * DTO preview Google Sheet
 */
export class PreviewSheetDto {
  @IsUrl()
  sourceUrl!: string;

  @IsOptional()
  @IsString()
  sheetName?: string;

  @IsString()
  @IsIn(['product', 'inventory', 'customer', 'price'])
  target!: string;

  @IsOptional()
  @IsObject()
  columnMapping?: Record<string, string>;
}

/**
 * DTO xac nhan import — chi can jobId, data doc tu server cache
 */
export class ConfirmImportDto {
  @IsString()
  jobId!: string;
}
