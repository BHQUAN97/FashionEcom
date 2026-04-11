/**
 * Payment Gateway abstraction — Strategy Pattern
 * Moi gateway (MoMo, VNPAY, Payoo, ZaloPay) implement interface nay
 */

export interface PaymentInitResult {
  redirectUrl: string;
  transactionId: string;
  expiresAt: Date;
  rawResponse?: unknown;
}

export interface PaymentVerifyResult {
  success: boolean;
  transactionId: string;
  orderId: string;
  amount: number;
  gateway: string;
  rawResponse: unknown;
}

export interface TransactionStatus {
  status: 'pending' | 'success' | 'failed' | 'expired';
  transactionId: string;
  amount: number;
  rawResponse?: unknown;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  amount: number;
  rawResponse?: unknown;
}

export interface PaymentGateway {
  /** Ten gateway — de hien thi va log */
  readonly name: string;

  /** Tao giao dich thanh toan — tra ve URL redirect */
  createPayment(params: {
    orderId: string;
    orderCode: string;
    amount: number;
    returnUrl: string;
    ipAddress: string;
  }): Promise<PaymentInitResult>;

  /** Verify callback/webhook tu gateway */
  verifyCallback(payload: Record<string, unknown>, signature: string): Promise<PaymentVerifyResult>;

  /** Query trang thai giao dich */
  queryTransaction(transactionId: string): Promise<TransactionStatus>;

  /** Hoan tien */
  refund(transactionId: string, amount: number, reason?: string): Promise<RefundResult>;
}

/** Phuong thuc thanh toan — map voi sal_payment.sal_payment_method */
export enum PaymentMethod {
  COD = 0,
  BANK_TRANSFER = 1,
  MOMO = 2,
  VNPAY = 3,
  PAYOO = 4,
  ZALOPAY = 5,
}

/** Trang thai thanh toan — map voi sal_payment.sal_payment_status */
export enum PaymentStatus {
  PENDING = 0,
  SUCCESS = 1,
  FAILED = 2,
  REFUNDED = 3,
  EXPIRED = 4,
}
