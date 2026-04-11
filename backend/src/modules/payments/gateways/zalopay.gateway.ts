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
 * ZaloPay Payment Gateway — HMAC-SHA256 voi key1 (create) va key2 (callback)
 * Docs: https://docs.zalopay.vn/v2/
 */
@Injectable()
export class ZaloPayGateway implements PaymentGateway {
  readonly name = 'zalopay';

  private appId: string;
  private key1: string;
  private key2: string;
  private apiUrl: string;

  constructor(private config: ConfigService) {
    this.appId = config.get('ZALOPAY_APP_ID', '');
    this.key1 = config.get('ZALOPAY_KEY1', '');
    this.key2 = config.get('ZALOPAY_KEY2', '');
    this.apiUrl = config.get('ZALOPAY_API_URL', 'https://sb-openapi.zalopay.vn/v2');
  }

  async createPayment(params: {
    orderId: string;
    orderCode: string;
    amount: number;
    returnUrl: string;
    ipAddress: string;
  }): Promise<PaymentInitResult> {
    const now = new Date();
    const appTransId = `${this.formatDate(now)}_${params.orderCode}`;
    const appTime = Date.now();
    const amount = Math.round(params.amount);
    const embedData = JSON.stringify({
      redirecturl: params.returnUrl,
      orderId: params.orderId,
    });
    const items = JSON.stringify([]);
    const description = `Thanh toan don hang ${params.orderCode}`;

    // Mac HMAC-SHA256 voi key1
    const macData = `${this.appId}|${appTransId}|${appTime}|${amount}|${embedData}|${items}`;
    const mac = crypto.createHmac('sha256', this.key1).update(macData).digest('hex');

    const body = {
      app_id: Number(this.appId),
      app_trans_id: appTransId,
      app_time: appTime,
      app_user: params.orderId,
      amount,
      description,
      embed_data: embedData,
      item: items,
      callback_url: params.returnUrl.replace('/thanh-cong', '/api/payments/webhook/zalopay'),
      mac,
    };

    const res = await fetch(`${this.apiUrl}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    return {
      redirectUrl: data.order_url || '',
      transactionId: appTransId,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      rawResponse: data,
    };
  }

  async verifyCallback(payload: Record<string, unknown>): Promise<PaymentVerifyResult> {
    const { data: callbackData, mac: receivedMac } = payload;
    const dataStr = String(callbackData || '');

    // Verify HMAC-SHA256 voi key2
    const computedMac = crypto.createHmac('sha256', this.key2).update(dataStr).digest('hex');
    const isValid = computedMac === String(receivedMac);

    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(dataStr);
    } catch { /* ignore */ }

    let orderId = String(parsed.app_trans_id || '');
    // Extract real orderId tu embed_data
    try {
      const embed = JSON.parse(String(parsed.embed_data || '{}'));
      if (embed.orderId) orderId = embed.orderId;
    } catch { /* ignore */ }

    return {
      success: isValid,
      transactionId: String(parsed.zp_trans_id || parsed.app_trans_id || ''),
      orderId,
      amount: Number(parsed.amount || 0),
      gateway: this.name,
      rawResponse: payload,
    };
  }

  async queryTransaction(transactionId: string): Promise<TransactionStatus> {
    const macData = `${this.appId}|${transactionId}|${this.key1}`;
    const mac = crypto.createHmac('sha256', this.key1).update(macData).digest('hex');

    const res = await fetch(`${this.apiUrl}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: Number(this.appId), app_trans_id: transactionId, mac }),
    });
    const data = await res.json();

    let status: TransactionStatus['status'] = 'pending';
    if (data.return_code === 1) status = 'success';
    else if (data.return_code === 2) status = 'failed';

    return { status, transactionId, amount: data.amount || 0, rawResponse: data };
  }

  async refund(transactionId: string, amount: number, reason?: string): Promise<RefundResult> {
    const timestamp = Date.now();
    const refundId = `refund_${timestamp}`;
    const macData = `${this.appId}|${transactionId}|${amount}|${reason || ''}|${timestamp}`;
    const mac = crypto.createHmac('sha256', this.key1).update(macData).digest('hex');

    const res = await fetch(`${this.apiUrl}/refund`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: Number(this.appId),
        zp_trans_id: transactionId,
        amount,
        description: reason || 'Hoan tien',
        m_refund_id: refundId,
        timestamp,
        mac,
      }),
    });
    const data = await res.json();

    return {
      success: data.return_code === 1,
      refundId: data.refund_id || refundId,
      amount,
      rawResponse: data,
    };
  }

  private formatDate(d: Date): string {
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  }
}
