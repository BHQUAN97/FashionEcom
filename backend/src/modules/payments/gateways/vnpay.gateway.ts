import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PaymentGateway,
  PaymentInitResult,
  PaymentVerifyResult,
  TransactionStatus,
  RefundResult,
} from './payment-gateway.interface';

/**
 * VNPAY Payment Gateway — SHA512 SecureHash
 * Docs: https://sandbox.vnpayment.vn/apis/docs/
 */
@Injectable()
export class VNPayGateway implements PaymentGateway {
  readonly name = 'vnpay';

  private tmnCode: string;
  private hashSecret: string;
  private apiUrl: string;

  constructor(private config: ConfigService) {
    this.tmnCode = config.get('VNPAY_TMN_CODE', '');
    this.hashSecret = config.get('VNPAY_HASH_SECRET', '');
    this.apiUrl = config.get('VNPAY_API_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html');
  }

  async createPayment(params: {
    orderId: string;
    orderCode: string;
    amount: number;
    returnUrl: string;
    ipAddress: string;
  }): Promise<PaymentInitResult> {
    const now = new Date();
    const createDate = this.formatDate(now);
    const expireDate = this.formatDate(new Date(now.getTime() + 15 * 60 * 1000));

    // VNPAY yeu cau amount * 100
    const amount = Math.round(params.amount * 100);

    const vnpParams: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: params.orderCode,
      vnp_OrderInfo: `Thanh toan don hang ${params.orderCode}`,
      vnp_OrderType: 'fashion',
      vnp_Amount: String(amount),
      vnp_ReturnUrl: params.returnUrl,
      vnp_IpAddr: params.ipAddress,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    // Sort params theo key va tao query string
    const sortedParams = Object.keys(vnpParams).sort();
    const queryString = sortedParams
      .map((key) => `${key}=${encodeURIComponent(vnpParams[key])}`)
      .join('&');

    // Tao SHA512 SecureHash
    const secureHash = crypto
      .createHmac('sha512', this.hashSecret)
      .update(queryString)
      .digest('hex');

    const redirectUrl = `${this.apiUrl}?${queryString}&vnp_SecureHash=${secureHash}`;

    return {
      redirectUrl,
      transactionId: params.orderCode,
      expiresAt: new Date(now.getTime() + 15 * 60 * 1000),
    };
  }

  async verifyCallback(payload: Record<string, unknown>): Promise<PaymentVerifyResult> {
    const receivedHash = String(payload.vnp_SecureHash || '');

    // Remove hash fields truoc khi verify
    const verifyParams = { ...payload };
    delete verifyParams.vnp_SecureHash;
    delete verifyParams.vnp_SecureHashType;

    // Sort va tao query string
    const sortedKeys = Object.keys(verifyParams).sort();
    const queryString = sortedKeys
      .map((key) => `${key}=${encodeURIComponent(String(verifyParams[key]))}`)
      .join('&');

    const computedHash = crypto
      .createHmac('sha512', this.hashSecret)
      .update(queryString)
      .digest('hex');

    const isValid = computedHash === receivedHash;
    const responseCode = String(payload.vnp_ResponseCode);

    return {
      success: isValid && responseCode === '00',
      transactionId: String(payload.vnp_TransactionNo || payload.vnp_TxnRef),
      orderId: String(payload.vnp_TxnRef || ''),
      amount: Number(payload.vnp_Amount) / 100, // VNPAY tra ve amount * 100
      gateway: this.name,
      rawResponse: payload,
    };
  }

  async queryTransaction(transactionId: string): Promise<TransactionStatus> {
    // VNPAY query API — simplified
    return {
      status: 'pending',
      transactionId,
      amount: 0,
    };
  }

  async refund(transactionId: string, amount: number, reason?: string): Promise<RefundResult> {
    // VNPAY refund — can goi API refund rieng
    const requestId = `refund-${Date.now()}`;
    return {
      success: false,
      refundId: requestId,
      amount,
      rawResponse: { message: 'VNPAY refund requires manual processing', reason },
    };
  }

  /** Format date thanh yyyyMMddHHmmss cho VNPAY */
  private formatDate(d: Date): string {
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0'),
      String(d.getHours()).padStart(2, '0'),
      String(d.getMinutes()).padStart(2, '0'),
      String(d.getSeconds()).padStart(2, '0'),
    ].join('');
  }
}
