import { Injectable, BadRequestException } from '@nestjs/common';
import { PaymentGateway, PaymentMethod } from './payment-gateway.interface';
import { MoMoGateway } from './momo.gateway';
import { VNPayGateway } from './vnpay.gateway';
import { ZaloPayGateway } from './zalopay.gateway';
import { PayooGateway } from './payoo.gateway';

/**
 * Factory pattern — tra ve gateway instance theo payment method
 * KHONG duplicate logic — moi gateway tu implement PaymentGateway interface
 */
@Injectable()
export class PaymentGatewayFactory {
  private gateways: Map<PaymentMethod, PaymentGateway> = new Map();

  constructor(
    private momo: MoMoGateway,
    private vnpay: VNPayGateway,
    private zalopay: ZaloPayGateway,
    private payoo: PayooGateway,
  ) {
    this.gateways.set(PaymentMethod.MOMO, momo);
    this.gateways.set(PaymentMethod.VNPAY, vnpay);
    this.gateways.set(PaymentMethod.ZALOPAY, zalopay);
    this.gateways.set(PaymentMethod.PAYOO, payoo);
  }

  /**
   * Lay gateway theo payment method — throw neu method khong hop le
   */
  getGateway(method: PaymentMethod): PaymentGateway {
    const gateway = this.gateways.get(method);
    if (!gateway) {
      throw new BadRequestException(`Payment method ${method} khong duoc ho tro`);
    }
    return gateway;
  }

  /**
   * Lay gateway theo ten (dung cho webhook routing)
   */
  getGatewayByName(name: string): PaymentGateway {
    const nameToMethod: Record<string, PaymentMethod> = {
      momo: PaymentMethod.MOMO,
      vnpay: PaymentMethod.VNPAY,
      zalopay: PaymentMethod.ZALOPAY,
      payoo: PaymentMethod.PAYOO,
    };
    const method = nameToMethod[name.toLowerCase()];
    if (method === undefined) {
      throw new BadRequestException(`Gateway "${name}" khong ton tai`);
    }
    return this.getGateway(method);
  }

  /** Danh sach gateway dang ho tro */
  getSupportedGateways(): string[] {
    return Array.from(this.gateways.values()).map((g) => g.name);
  }
}
