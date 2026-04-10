import { IsArray, IsString, IsOptional, IsEnum, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Enum loai event analytics — theo spec Section 10.1
 */
export enum AnalyticsEventType {
  PAGE_VIEW = 'page_view',
  PRODUCT_VIEW = 'product_view',
  ADD_TO_CART = 'add_to_cart',
  REMOVE_FROM_CART = 'remove_from_cart',
  BEGIN_CHECKOUT = 'begin_checkout',
  ENTER_SHIPPING = 'enter_shipping',
  SELECT_PAYMENT = 'select_payment',
  COMPLETE_ORDER = 'complete_order',
  SEARCH = 'search',
  WISHLIST_ADD = 'wishlist_add',
  REVIEW_SUBMIT = 'review_submit',
}

export class CreateEventDto {
  @IsEnum(AnalyticsEventType)
  type!: AnalyticsEventType;

  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;

  @IsString()
  session_id!: string;

  @IsOptional()
  @IsString()
  timestamp?: string;

  @IsOptional()
  @IsString()
  device?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  customer_id?: string;
}

export class BatchEventsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEventDto)
  events!: CreateEventDto[];
}
