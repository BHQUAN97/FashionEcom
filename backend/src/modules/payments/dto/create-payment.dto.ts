import {
  IsNotEmpty, IsString, IsNumber, IsOptional, IsInt, IsIn, IsUUID, IsUrl,
  Min, Max, MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsUUID('4')
  orderId!: string;

  /** 0=COD, 1=BankTransfer, 2=MoMo, 3=VNPAY, 4=Payoo, 5=ZaloPay */
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(5)
  method!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  returnUrl?: string;
}

export class PaymentQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(4)
  status?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(5)
  method?: number;

  /** 1=chi hien don cho duyet (bank transfer pending co proof) */
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(1)
  pendingReview?: number;

  @IsOptional() @IsString()
  search?: string;

  @IsOptional() @IsString()
  dateFrom?: string;

  @IsOptional() @IsString()
  dateTo?: string;
}

export class RefundPaymentDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(999_999_999)
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

/** Admin duyet/tu choi don hang (doi chieu thanh toan) */
export class ReviewPaymentDto {
  /** approve | reject */
  @IsIn(['approve', 'reject'], {
    message: 'Action phai la: approve hoac reject',
  })
  action!: 'approve' | 'reject';

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}

/** Admin cau hinh QR + tai khoan cho 1 phuong thuc thanh toan */
export class UpsertPaymentMethodConfigDto {
  /** 0=COD, 1=BankTransfer, 2=MoMo, 3=VNPAY, 4=Payoo, 5=ZaloPay */
  @IsInt() @Min(0) @Max(5)
  method!: number;

  @IsString() @MaxLength(50)
  name!: string;

  /** URL anh QR */
  @IsOptional() @IsString() @MaxLength(500)
  qrImage?: string;

  @IsOptional() @IsString() @MaxLength(100)
  accountName?: string;

  @IsOptional() @IsString() @MaxLength(50)
  accountNumber?: string;

  @IsOptional() @IsString() @MaxLength(100)
  bankName?: string;

  /** Huong dan thanh toan (text/HTML) */
  @IsOptional() @IsString() @MaxLength(2000)
  instructions?: string;

  @IsOptional() @IsInt() @Min(0) @Max(1)
  status?: number;

  @IsOptional() @IsInt() @Min(0) @Max(10)
  sortOrder?: number;
}
