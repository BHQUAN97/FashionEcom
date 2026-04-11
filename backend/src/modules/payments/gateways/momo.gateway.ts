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
 * MoMo Payment Gateway — HMAC-SHA256
 * Docs: https://developers.momo.vn/v3/vi/docs/payment/api/
 */
@Injectable()
export class MoMoGateway implements PaymentGateway {
  readonly name = 'momo';

  private partnerCode: string;
  private accessKey: string;
  private secretKey: string;
  private apiUrl: string;

  constructor(private config: ConfigService) {
    this.partnerCode = config.get('MOMO_PARTNER_CODE', '');
    this.accessKey = config.get('MOMO_ACCESS_KEY', '');
    this.secretKey = config.get('MOMO_SECRET_KEY', '');
    this.apiUrl = config.get('MOMO_API_URL', 'https://test-payment.momo.vn/v2/gateway/api');
  }

  async createPayment(params: {
    orderId: string;
    orderCode: string;
    amount: number;
    returnUrl: string;
    ipAddress: string;
  }): Promise<PaymentInitResult> {
    const requestId = `${this.partnerCode}-${Date.now()}`;
    const orderId = params.orderCode;
    const orderInfo = `Thanh toan don hang ${params.orderCode}`;
    const amount = Math.round(params.amount);
    const extraData = Buffer.from(JSON.stringify({ orderId: params.orderId })).toString('base64');

    // Tao HMAC-SHA256 signature
    const rawSignature = [
      `accessKey=${this.accessKey}`,
      `amount=${amount}`,
      `extraData=${extraData}`,
      `ipnUrl=${params.returnUrl.replace('/thanh-cong', '/api/payments/webhook/momo')}`,
      `orderId=${orderId}`,
      `orderInfo=${orderInfo}`,
      `partnerCode=${this.partnerCode}`,
      `redirectUrl=${params.returnUrl}`,
      `requestId=${requestId}`,
      `requestType=payWithMethod`,
    ].join('&');

    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(rawSignature)
      .digest('hex');

    const body = {
      partnerCode: this.partnerCode,
      accessKey: this.accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl: params.returnUrl,
      ipnUrl: params.returnUrl.replace('/thanh-cong', '/api/payments/webhook/momo'),
      extraData,
      requestType: 'payWithMethod',
      signature,
      lang: 'vi',
    };

    const res = await fetch(`${this.apiUrl}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    return {
      redirectUrl: data.payUrl || '',
      transactionId: requestId,
      expiresAt,
      rawResponse: data,
    };
  }

  async verifyCallback(payload: Record<string, unknown>, _signature: string): Promise<PaymentVerifyResult> {
    // Verify HMAC-SHA256 tu MoMo IPN
    const {
      partnerCode, orderId, requestId, amount,
      orderInfo, orderType, transId, resultCode,
      message, payType, responseTime, extraData, signature,
    } = payload;

    const rawSignature = [
      `accessKey=${this.accessKey}`,
      `amount=${amount}`,
      `extraData=${extraData}`,
      `message=${message}`,
      `orderId=${orderId}`,
      `orderInfo=${orderInfo}`,
      `orderType=${orderType}`,
      `partnerCode=${partnerCode}`,
      `payType=${payType}`,
      `requestId=${requestId}`,
      `responseTime=${responseTime}`,
      `resultCode=${resultCode}`,
      `transId=${transId}`,
    ].join('&');

    const computedSignature = crypto
      .createHmac('sha256', this.secretKey)
      .update(rawSignature)
      .digest('hex');

    const isValid = computedSignature === signature;
    let realOrderId = String(orderId);

    // Extract real orderId tu extraData
    try {
      const extra = JSON.parse(Buffer.from(String(extraData), 'base64').toString());
      if (extra.orderId) realOrderId = extra.orderId;
    } catch { /* ignore */ }

    return {
      success: isValid && Number(resultCode) === 0,
      transactionId: String(transId || requestId),
      orderId: realOrderId,
      amount: Number(amount),
      gateway: this.name,
      rawResponse: payload,
    };
  }

  async queryTransaction(transactionId: string): Promise<TransactionStatus> {
    const rawSignature = `accessKey=${this.accessKey}&orderId=${transactionId}&partnerCode=${this.partnerCode}&requestId=${transactionId}`;
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(rawSignature)
      .digest('hex');

    const res = await fetch(`${this.apiUrl}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partnerCode: this.partnerCode,
        requestId: transactionId,
        orderId: transactionId,
        signature,
        lang: 'vi',
      }),
    });
    const data = await res.json();

    let status: TransactionStatus['status'] = 'pending';
    if (data.resultCode === 0) status = 'success';
    else if (data.resultCode === 1006) status = 'expired';
    else if (data.resultCode !== 1000) status = 'failed';

    return { status, transactionId, amount: data.amount || 0, rawResponse: data };
  }

  async refund(transactionId: string, amount: number, reason?: string): Promise<RefundResult> {
    const requestId = `refund-${Date.now()}`;
    const rawSignature = [
      `accessKey=${this.accessKey}`,
      `amount=${amount}`,
      `description=${reason || 'Hoan tien'}`,
      `orderId=${requestId}`,
      `partnerCode=${this.partnerCode}`,
      `requestId=${requestId}`,
      `transId=${transactionId}`,
    ].join('&');

    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(rawSignature)
      .digest('hex');

    const res = await fetch(`${this.apiUrl}/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partnerCode: this.partnerCode,
        orderId: requestId,
        requestId,
        amount,
        transId: transactionId,
        description: reason || 'Hoan tien',
        signature,
        lang: 'vi',
      }),
    });
    const data = await res.json();

    return {
      success: data.resultCode === 0,
      refundId: data.transId || requestId,
      amount,
      rawResponse: data,
    };
  }
}
