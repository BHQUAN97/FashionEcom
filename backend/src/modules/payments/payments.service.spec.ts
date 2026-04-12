import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { PaymentEntity } from './entities/payment.entity';
import { OrderEntity } from '../orders/entities/order.entity';
import { PaymentGatewayFactory } from './gateways/payment-gateway.factory';
import { PaymentMethod, PaymentStatus } from './gateways/payment-gateway.interface';

describe('PaymentsService', () => {
  let service: PaymentsService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let paymentRepo: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderRepo: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let gatewayFactory: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockGateway: any;

  // Helper: tao mock payment
  const makePayment = (overrides: Partial<PaymentEntity> = {}): PaymentEntity =>
    ({
      salPaymentId: 'pay-1',
      salOrderId: 'order-1',
      salPaymentMethod: PaymentMethod.MOMO,
      salPaymentAmount: 500000,
      salPaymentFee: 7500,
      salPaymentStatus: PaymentStatus.PENDING,
      salPaymentTransactionId: 'txn-123',
      salPaymentGatewayResponse: '{}',
      salPaymentRedirectUrl: 'https://momo.vn/pay',
      salPaymentExpiresAt: new Date('2026-01-01T00:15:00'),
      createdDate: new Date('2026-01-01'),
      ...overrides,
    }) as PaymentEntity;

  // Helper: tao mock order
  const makeOrder = (overrides = {}): Partial<OrderEntity> => ({
    salOrderId: 'order-1',
    salOrderCode: 'DH-0001',
    salOrderTotal: 500000,
    salOrderPaymentStatus: 0,
    ...overrides,
  });

  beforeEach(async () => {
    mockGateway = {
      createPayment: jest.fn().mockResolvedValue({
        redirectUrl: 'https://gateway.vn/pay',
        transactionId: 'txn-new',
        expiresAt: new Date('2026-01-01T00:15:00'),
        rawResponse: { code: 0 },
      }),
      verifyCallback: jest.fn().mockResolvedValue({
        success: true,
        transactionId: 'txn-123',
        orderId: 'order-1',
        amount: 500000,
        gateway: 'momo',
      }),
      refund: jest.fn().mockResolvedValue({
        success: true,
        refundId: 'refund-1',
        amount: 500000,
      }),
    };

    gatewayFactory = {
      getGateway: jest.fn().mockReturnValue(mockGateway),
      getGatewayByName: jest.fn().mockReturnValue(mockGateway),
    };

    paymentRepo = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((e) => e),
      findOne: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
      createQueryBuilder: jest.fn(),
      metadata: { primaryColumns: [{ propertyName: 'salPaymentId' }] },
    };

    orderRepo = {
      findOne: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: getRepositoryToken(PaymentEntity), useValue: paymentRepo },
        { provide: getRepositoryToken(OrderEntity), useValue: orderRepo },
        { provide: PaymentGatewayFactory, useValue: gatewayFactory },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    jest.clearAllMocks();
  });

  // ── CREATE PAYMENT ──

  describe('createPayment', () => {
    it('tao payment thanh cong voi MoMo', async () => {
      orderRepo.findOne.mockResolvedValue(makeOrder());

      const result = await service.createPayment(
        { orderId: 'order-1', method: PaymentMethod.MOMO },
        '127.0.0.1',
      );

      expect(result.redirectUrl).toBe('https://gateway.vn/pay');
      expect(gatewayFactory.getGateway).toHaveBeenCalledWith(PaymentMethod.MOMO);
      expect(mockGateway.createPayment).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 'order-1',
          orderCode: 'DH-0001',
          amount: 500000,
          ipAddress: '127.0.0.1',
        }),
      );
    });

    it('tinh phi gateway dung — MoMo 1.5%', async () => {
      orderRepo.findOne.mockResolvedValue(makeOrder({ salOrderTotal: 1000000 }));

      await service.createPayment(
        { orderId: 'order-1', method: PaymentMethod.MOMO },
        '127.0.0.1',
      );

      expect(paymentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ salPaymentFee: 15000 }),
      );
    });

    it('tinh phi gateway dung — VNPAY 1.1%', async () => {
      orderRepo.findOne.mockResolvedValue(makeOrder({ salOrderTotal: 1000000 }));

      await service.createPayment(
        { orderId: 'order-1', method: PaymentMethod.VNPAY },
        '127.0.0.1',
      );

      expect(paymentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ salPaymentFee: 11000 }),
      );
    });

    it('phi = 0 cho COD', async () => {
      orderRepo.findOne.mockResolvedValue(makeOrder());

      await service.createPayment(
        { orderId: 'order-1', method: PaymentMethod.COD },
        '127.0.0.1',
      );

      expect(paymentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ salPaymentFee: 0 }),
      );
    });

    it('throw NotFoundException khi don hang khong ton tai', async () => {
      orderRepo.findOne.mockResolvedValue(null);

      await expect(
        service.createPayment({ orderId: 'fake', method: PaymentMethod.MOMO }, '127.0.0.1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throw BadRequest khi don da thanh toan', async () => {
      orderRepo.findOne.mockResolvedValue(makeOrder({ salOrderPaymentStatus: 1 }));

      await expect(
        service.createPayment({ orderId: 'order-1', method: PaymentMethod.MOMO }, '127.0.0.1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('luu payment record voi status PENDING', async () => {
      orderRepo.findOne.mockResolvedValue(makeOrder());

      await service.createPayment(
        { orderId: 'order-1', method: PaymentMethod.MOMO },
        '127.0.0.1',
      );

      expect(paymentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          salPaymentStatus: PaymentStatus.PENDING,
          salOrderId: 'order-1',
        }),
      );
      expect(paymentRepo.save).toHaveBeenCalled();
    });
  });

  // ── WEBHOOK ──

  describe('handleWebhook', () => {
    it('verify webhook thanh cong — update payment status SUCCESS', async () => {
      const payment = makePayment();
      paymentRepo.findOne.mockResolvedValue(payment);

      const result = await service.handleWebhook('momo', { resultCode: 0 }, 'sig-123');

      expect(gatewayFactory.getGatewayByName).toHaveBeenCalledWith('momo');
      expect(payment.salPaymentStatus).toBe(PaymentStatus.SUCCESS);
      expect(result.success).toBe(true);
    });

    it('cap nhat order payment status khi thanh toan thanh cong', async () => {
      const payment = makePayment();
      paymentRepo.findOne.mockResolvedValue(payment);

      await service.handleWebhook('momo', {}, 'sig');

      expect(orderRepo.update).toHaveBeenCalledWith('order-1', {
        salOrderPaymentStatus: 1,
      });
    });

    it('KHONG cap nhat order khi thanh toan that bai', async () => {
      mockGateway.verifyCallback.mockResolvedValue({
        success: false,
        transactionId: 'txn-123',
        orderId: 'order-1',
      });
      const payment = makePayment();
      paymentRepo.findOne.mockResolvedValue(payment);

      await service.handleWebhook('momo', {}, 'sig');

      expect(payment.salPaymentStatus).toBe(PaymentStatus.FAILED);
      expect(orderRepo.update).not.toHaveBeenCalled();
    });

    it('fallback tim theo orderId khi khong co transactionId', async () => {
      paymentRepo.findOne.mockResolvedValue(null); // Khong tim duoc theo txnId
      const latestPayment = makePayment({ salPaymentId: 'pay-latest' });
      paymentRepo.find.mockResolvedValue([latestPayment]); // Tim duoc theo orderId

      const result = await service.handleWebhook('momo', {}, 'sig');

      expect(paymentRepo.find).toHaveBeenCalledWith({
        where: { salOrderId: 'order-1' },
        order: { createdDate: 'DESC' },
      });
      expect(result.paymentId).toBe('pay-latest');
    });

    it('throw NotFoundException khi khong tim thay giao dich nao', async () => {
      paymentRepo.findOne.mockResolvedValue(null);
      paymentRepo.find.mockResolvedValue([]);

      await expect(
        service.handleWebhook('momo', {}, 'sig'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throw BadRequest khi transactionId khong hop le', async () => {
      mockGateway.verifyCallback.mockResolvedValue({
        success: true,
        transactionId: '', // empty
        orderId: 'order-1',
      });

      await expect(
        service.handleWebhook('momo', {}, 'sig'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── REFUND ──

  describe('refund', () => {
    it('hoan tien COD — khong goi gateway', async () => {
      const payment = makePayment({
        salPaymentMethod: PaymentMethod.COD,
        salPaymentStatus: PaymentStatus.SUCCESS,
      });
      paymentRepo.findOne.mockResolvedValue(payment);

      const result = await service.refund('pay-1', { amount: 500000 });

      expect(result.success).toBe(true);
      expect(payment.salPaymentStatus).toBe(PaymentStatus.REFUNDED);
      expect(gatewayFactory.getGateway).not.toHaveBeenCalled();
    });

    it('hoan tien Bank Transfer — khong goi gateway', async () => {
      const payment = makePayment({
        salPaymentMethod: PaymentMethod.BANK_TRANSFER,
        salPaymentStatus: PaymentStatus.SUCCESS,
      });
      paymentRepo.findOne.mockResolvedValue(payment);

      const result = await service.refund('pay-1', { amount: 500000 });

      expect(result.success).toBe(true);
      expect(gatewayFactory.getGateway).not.toHaveBeenCalled();
    });

    it('hoan tien MoMo — goi gateway refund API', async () => {
      const payment = makePayment({
        salPaymentStatus: PaymentStatus.SUCCESS,
        salPaymentTransactionId: 'txn-123',
      });
      paymentRepo.findOne.mockResolvedValue(payment);

      const result = await service.refund('pay-1', { amount: 300000, reason: 'Doi tra' });

      expect(gatewayFactory.getGateway).toHaveBeenCalledWith(PaymentMethod.MOMO);
      expect(mockGateway.refund).toHaveBeenCalledWith('txn-123', 300000, 'Doi tra');
      expect(result.success).toBe(true);
      expect(payment.salPaymentStatus).toBe(PaymentStatus.REFUNDED);
    });

    it('throw BadRequest khi payment chua SUCCESS', async () => {
      const payment = makePayment({ salPaymentStatus: PaymentStatus.PENDING });
      paymentRepo.findOne.mockResolvedValue(payment);

      await expect(
        service.refund('pay-1', { amount: 500000 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throw BadRequest khi payment da REFUNDED', async () => {
      const payment = makePayment({ salPaymentStatus: PaymentStatus.REFUNDED });
      paymentRepo.findOne.mockResolvedValue(payment);

      await expect(
        service.refund('pay-1', { amount: 500000 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('khong update status khi gateway refund that bai', async () => {
      const payment = makePayment({
        salPaymentStatus: PaymentStatus.SUCCESS,
      });
      paymentRepo.findOne.mockResolvedValue(payment);
      mockGateway.refund.mockResolvedValue({ success: false });

      await service.refund('pay-1', { amount: 500000 });

      expect(payment.salPaymentStatus).toBe(PaymentStatus.SUCCESS); // Khong doi
    });
  });

  // ── EXPIRE TIMEOUT ──

  describe('expireTimeoutPayments', () => {
    it('chuyen cac payment qua han sang EXPIRED', async () => {
      const p1 = makePayment({ salPaymentId: 'p1' });
      const p2 = makePayment({ salPaymentId: 'p2' });
      paymentRepo.find.mockResolvedValue([p1, p2]);

      const result = await service.expireTimeoutPayments();

      expect(result.expired).toBe(2);
      expect(p1.salPaymentStatus).toBe(PaymentStatus.EXPIRED);
      expect(p2.salPaymentStatus).toBe(PaymentStatus.EXPIRED);
      expect(paymentRepo.save).toHaveBeenCalledTimes(2);
    });

    it('tra ve 0 khi khong co payment qua han', async () => {
      paymentRepo.find.mockResolvedValue([]);

      const result = await service.expireTimeoutPayments();

      expect(result.expired).toBe(0);
    });
  });

  // ── GATEWAY FEE RATES ──

  describe('gateway fee calculation', () => {
    it.each([
      [PaymentMethod.MOMO, 1000000, 15000],    // 1.5%
      [PaymentMethod.VNPAY, 1000000, 11000],   // 1.1%
      [PaymentMethod.PAYOO, 1000000, 20000],   // 2.0%
      [PaymentMethod.ZALOPAY, 1000000, 15000], // 1.5%
      [PaymentMethod.COD, 1000000, 0],         // 0%
      [PaymentMethod.BANK_TRANSFER, 1000000, 0], // 0%
    ])('method %i voi amount %i => fee = %i', async (method, amount, expectedFee) => {
      orderRepo.findOne.mockResolvedValue(makeOrder({ salOrderTotal: amount }));

      await service.createPayment(
        { orderId: 'order-1', method },
        '127.0.0.1',
      );

      expect(paymentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ salPaymentFee: expectedFee }),
      );
    });
  });
});
