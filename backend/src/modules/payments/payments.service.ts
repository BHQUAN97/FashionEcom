import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { PaymentEntity } from './entities/payment.entity';
import { PaymentGatewayFactory } from './gateways/payment-gateway.factory';
import {
  PaymentMethod,
  PaymentStatus,
} from './gateways/payment-gateway.interface';
import { OrderEntity } from '../orders/entities/order.entity';
import { CreatePaymentDto, PaymentQueryDto, RefundPaymentDto } from './dto/create-payment.dto';
import { BaseService } from '../../common/services/base.service';

/** Phi gateway tinh % — dung cho P&L */
const GATEWAY_FEE_RATES: Record<number, number> = {
  [PaymentMethod.MOMO]: 0.015,
  [PaymentMethod.VNPAY]: 0.011,
  [PaymentMethod.PAYOO]: 0.02,
  [PaymentMethod.ZALOPAY]: 0.015,
};

@Injectable()
export class PaymentsService extends BaseService<PaymentEntity> {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepo: Repository<PaymentEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    private readonly gatewayFactory: PaymentGatewayFactory,
  ) {
    super(paymentRepo, 'salPaymentId', 'Thanh toan');
  }

  /**
   * Tao giao dich thanh toan — goi gateway de lay redirect URL
   */
  async createPayment(dto: CreatePaymentDto, ipAddress: string) {
    const order = await this.orderRepo.findOne({
      where: { salOrderId: dto.orderId },
    });
    if (!order) throw new NotFoundException('Don hang khong ton tai');

    // Kiem tra don chua thanh toan
    if (order.salOrderPaymentStatus === 1) {
      throw new BadRequestException('Don hang da duoc thanh toan');
    }

    const method = dto.method as PaymentMethod;
    const gateway = this.gatewayFactory.getGateway(method);
    const amount = Number(order.salOrderTotal);

    const returnUrl = dto.returnUrl || 'http://localhost:3300/thanh-toan/thanh-cong';

    // Goi gateway API
    const result = await gateway.createPayment({
      orderId: order.salOrderId,
      orderCode: order.salOrderCode,
      amount,
      returnUrl,
      ipAddress,
    });

    // Tinh phi gateway
    const feeRate = GATEWAY_FEE_RATES[method] || 0;
    const fee = Math.round(amount * feeRate);

    // Luu record payment
    const payment = this.paymentRepo.create({
      salPaymentId: uuidv4(),
      salOrderId: order.salOrderId,
      salPaymentMethod: method,
      salPaymentAmount: amount,
      salPaymentFee: fee,
      salPaymentStatus: PaymentStatus.PENDING,
      salPaymentTransactionId: result.transactionId,
      salPaymentRedirectUrl: result.redirectUrl,
      salPaymentExpiresAt: result.expiresAt,
      salPaymentGatewayResponse: JSON.stringify(result.rawResponse || {}),
    });
    await this.paymentRepo.save(payment);

    return {
      paymentId: payment.salPaymentId,
      redirectUrl: result.redirectUrl,
      expiresAt: result.expiresAt,
    };
  }

  /**
   * Xu ly webhook callback tu gateway — verify + update status
   */
  async handleWebhook(gatewayName: string, payload: Record<string, unknown>, signature: string) {
    const gateway = this.gatewayFactory.getGatewayByName(gatewayName);
    const result = await gateway.verifyCallback(payload, signature);

    if (!result.transactionId) {
      throw new BadRequestException('Transaction ID khong hop le');
    }

    // Tim payment record theo transaction_id
    const payment = await this.paymentRepo.findOne({
      where: { salPaymentTransactionId: result.transactionId },
    });

    if (!payment) {
      // Thu tim theo orderId
      const payments = await this.paymentRepo.find({
        where: { salOrderId: result.orderId },
        order: { createdDate: 'DESC' },
      });
      if (payments.length === 0) {
        throw new NotFoundException('Khong tim thay giao dich');
      }
      // Update payment moi nhat
      const latestPayment = payments[0];
      return this.updatePaymentStatus(latestPayment, result.success);
    }

    return this.updatePaymentStatus(payment, result.success);
  }

  /**
   * Cap nhat trang thai payment va order
   */
  private async updatePaymentStatus(payment: PaymentEntity, success: boolean) {
    payment.salPaymentStatus = success ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
    payment.salPaymentGatewayResponse = JSON.stringify({
      ...(payment.salPaymentGatewayResponse ? JSON.parse(payment.salPaymentGatewayResponse) : {}),
      webhookResult: success,
      updatedAt: new Date().toISOString(),
    });
    await this.paymentRepo.save(payment);

    // Cap nhat trang thai thanh toan cua don hang
    if (success) {
      await this.orderRepo.update(payment.salOrderId, {
        salOrderPaymentStatus: 1, // DA THANH TOAN
      });
    }

    return { success, paymentId: payment.salPaymentId };
  }

  /**
   * Callback return URL tu gateway (GET redirect)
   */
  async handleCallback(gatewayName: string, queryParams: Record<string, unknown>) {
    return this.handleWebhook(gatewayName, queryParams, '');
  }

  /**
   * Hoan tien giao dich
   */
  async refund(paymentId: string, dto: RefundPaymentDto) {
    const payment = await super.findOne(paymentId);

    if (payment.salPaymentStatus !== PaymentStatus.SUCCESS) {
      throw new BadRequestException('Chi co the hoan tien giao dich thanh cong');
    }

    const method = payment.salPaymentMethod as PaymentMethod;
    // COD va Bank Transfer khong can goi gateway
    if (method === PaymentMethod.COD || method === PaymentMethod.BANK_TRANSFER) {
      payment.salPaymentStatus = PaymentStatus.REFUNDED;
      await this.paymentRepo.save(payment);
      return { success: true, message: 'Hoan tien thu cong (COD/Bank)' };
    }

    const gateway = this.gatewayFactory.getGateway(method);
    const result = await gateway.refund(
      payment.salPaymentTransactionId!,
      dto.amount,
      dto.reason,
    );

    if (result.success) {
      payment.salPaymentStatus = PaymentStatus.REFUNDED;
      await this.paymentRepo.save(payment);
    }

    return result;
  }

  /**
   * Danh sach giao dich — admin
   */
  async findAll(query: PaymentQueryDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);

    const qb = this.paymentRepo.createQueryBuilder('p');

    if (query.status !== undefined) {
      qb.andWhere('p.salPaymentStatus = :s', { s: query.status });
    }
    if (query.method !== undefined) {
      qb.andWhere('p.salPaymentMethod = :m', { m: query.method });
    }
    if (query.search) {
      qb.andWhere('(p.salPaymentTransactionId LIKE :q OR p.salOrderId LIKE :q)', {
        q: `%${query.search}%`,
      });
    }
    if (query.dateFrom) {
      qb.andWhere('p.createdDate >= :df', { df: query.dateFrom });
    }
    if (query.dateTo) {
      qb.andWhere('p.createdDate <= :dt', { dt: query.dateTo });
    }

    qb.orderBy('p.createdDate', 'DESC');

    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();

    return this.paginate(data, total, page, limit);
  }

  /**
   * Cron: huy giao dich qua han 15 phut
   */
  async expireTimeoutPayments() {
    const now = new Date();
    const expired = await this.paymentRepo.find({
      where: {
        salPaymentStatus: PaymentStatus.PENDING,
        salPaymentExpiresAt: LessThan(now),
      },
    });

    let count = 0;
    for (const payment of expired) {
      payment.salPaymentStatus = PaymentStatus.EXPIRED;
      await this.paymentRepo.save(payment);
      count++;
    }

    return { expired: count };
  }

  /**
   * Query 1 giao dich
   */
  async findOne(id: string) {
    return super.findOne(id);
  }
}
