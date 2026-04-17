import { IsArray, IsString, IsUUID, IsOptional, IsInt, IsIn, Min, Max, MaxLength, ArrayMaxSize } from 'class-validator';

/** Action hop le — order status (chap nhan ca dang ngan va dai) */
const ORDER_ACTIONS = ['confirm', 'pack', 'packing', 'ship', 'shipping', 'complete', 'cancel'] as const;

/** Action hop le — shipping status */
const SHIPPING_ACTIONS = [
  'pickup', 'picked', 'in_transit', 'delivering', 'delivered',
  'failed', 're_deliver', 'return', 'lost', 'damaged',
] as const;

/** Tat ca actions hop le cho quick action */
const ALL_ACTIONS = [...ORDER_ACTIONS, ...SHIPPING_ACTIONS] as const;

/** Bulk action trang thai don hang */
export class BulkOrderActionDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMaxSize(100, { message: 'Toi da 100 don moi lan' })
  ids!: string[];

  /** confirm | packing | shipping | complete | cancel */
  @IsIn(ORDER_ACTIONS, {
    message: `Action phai la: ${ORDER_ACTIONS.join(', ')}`,
  })
  action!: (typeof ORDER_ACTIONS)[number];
}

/** Bulk update trang thai van chuyen */
export class BulkShippingStatusDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @ArrayMaxSize(100, { message: 'Toi da 100 don moi lan' })
  ids!: string[];

  /**
   * 0=chua_giao, 1=cho_lay, 2=da_lay, 3=van_chuyen, 4=dang_giao,
   * 5=thanh_cong, 6=that_bai, 7=giao_lai, 8=hoan_hang, 9=mat, 10=hu_hong
   */
  @IsInt()
  @Min(0)
  @Max(10)
  status!: number;

  @IsOptional() @IsString() @MaxLength(500)
  note?: string;

  @IsOptional() @IsString() @MaxLength(50)
  trackingCode?: string;
}

/** Quick action cho 1 don — dung action name thay vi status number */
export class QuickOrderActionDto {
  /**
   * Order: confirm, pack, ship, complete, cancel
   * Shipping: pickup, picked, in_transit, delivering, delivered, failed, re_deliver, return, lost, damaged
   */
  @IsIn([...ALL_ACTIONS], {
    message: `Action phai la: ${ALL_ACTIONS.join(', ')}`,
  })
  action!: (typeof ALL_ACTIONS)[number];

  @IsOptional() @IsString() @MaxLength(500)
  note?: string;

  @IsOptional() @IsString() @MaxLength(50)
  trackingCode?: string;
}
