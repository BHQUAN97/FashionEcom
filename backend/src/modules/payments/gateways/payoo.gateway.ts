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
 * Payoo Payment Gateway — SHA256 checksum
 * Docs: https://developer.payoo.vn/
 */
@Injectable()
export class PayooGateway implements PaymentGateway {
  readonly name = 'payoo';

  private merchantId: string;
  private apiKey: string;
  private secret: string;
  private apiUrl: string;

  constructor(private config: ConfigService) {
    this.merchantId = config.get('PAYOO_MERCHANT_ID', '');
    this.apiKey = config.get('PAYOO_API_KEY', '');
    this.secret = config.get('PAYOO_SECRET', '');
    this.apiUrl = config.get('PAYOO_API_URL', 'https://sandbox.payoo.vn/v2');
  }

  async createPayment(params: {
    orderId: string;
    orderCode: string;
    amount: number;
    returnUrl: string;
    ipAddress: string;
  }): Promise<PaymentInitResult> {
    const amount = Math.round(params.amount);
    const orderNo = params.orderCode;
    const description = `Thanh toan don hang ${params.orderCode}`;

    // Tao checksum SHA256
    const rawChecksum = `${this.merchantId}|${orderNo}|${amount}|${description}|${this.secret}`;
    const checksum = crypto.createHash('sha256').update(rawChecksum).digest('hex');

    const body = {
      merchant_id: this.merchantId,
      order_no: orderNo,
      amount,
      description,
      return_url: params.returnUrl,
      notify_url: params.returnUrl.replace('/thanh-cong', '/api/payments/webhook/payoo'),
      checksum,
    };

    const res = await fetch(`${this.apiUrl}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    return {
      redirectUrl: data.payment_url || '',
      transactionId: orderNo,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      rawResponse: data,
    };
  }

  async verifyCallback(payload: Record<string, unknown>): Promise<PaymentVerifyResult> {
    const { order_no, amount, status, checksum: receivedChecksum } = payload;

    // Verify SHA256 checksum
    const rawChecksum = `${this.merchantId}|${order_no}|${amount}|${status}|${this.secret}`;
    const computedChecksum = crypto.createHash('sha256').update(rawChecksum).digest('hex');
    const isValid = computedChecksum === String(receivedChecksum);

    return {
      success: isValid && String(status) === 'success',
      transactionId: String(payload.transaction_id || order_no),
      orderId: String(order_no || ''),
      amount: Number(amount || 0),
      gateway: this.name,
      rawResponse: payload,
    };
  }

  async queryTransaction(transactionId: string): Promise<TransactionStatus> {
    return { status: 'pending', transactionId, amount: 0 };
  }

  async refund(transactionId: string, amount: number, reason?: string): Promise<RefundResult> {
    return {
      success: false,
      refundId: `refund-${Date.now()}`,
      amount,
      rawResponse: { message: 'Payoo refund requires manual processing', reason },
    };
  }
}
