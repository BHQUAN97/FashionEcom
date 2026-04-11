import { PartialType } from '@nestjs/mapped-types';
import { CreateVariantDto } from './create-variant.dto';

/** DTO cap nhat variant — tat ca field optional */
export class UpdateVariantDto extends PartialType(CreateVariantDto) {}
