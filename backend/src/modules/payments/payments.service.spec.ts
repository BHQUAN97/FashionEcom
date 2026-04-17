import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PaymentsService } from './payments.service';
import { PaymentEntity } from './entities/payment.entity';
import { OrderEntity } from '../orders/entities/order.entity';
import { DiscountUsageEntity } from '../promotions/entities/discount-usage.entity';
import { DiscountCodeEntity } from '../promotions/entities/discount-code.entity';
import { PaymentMethodConfigEntity } from './entities/payment-method-config.entity';
import { PaymentGatewayFactory } from './gateways/payment-gateway.factory';
import { PaymentMethod, PaymentStatus } from './gateways/payment-gateway.interface';
import { AdminNotificationService } from '../notifications/admin-notification.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let paymentRepo: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderRepo: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let discountUsageRepo: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let discountCodeRepo: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let gatewayFactory: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockGateway: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let queryRunnerManager: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let queryRunner: any;

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
      findOne: jest.fn().mockResolvedValue(null), // default: no existing payment
      find: jest.fn().mockResolvedValue([]),
      createQueryBuilder: jest.fn(),
      metadata: { primaryColumns: [{ propertyName: 'salPaymentId' }] },
    };

    orderRepo = {
      findOne: jest.fn(),
      update: jest.fn(),
    };

    discountUsageRepo = {
      find: jest.fn().mockResolvedValue([]),
      remove: jest.fn(),
    };

    discountCodeRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    // Mock queryRunner cho transaction trong updatePaymentStatus + refund + releaseDiscountUsageInTx
    // Service gio dung manager.find/findOne/save/remove/update — can mock day du
    queryRunnerManager = {
      save: jest.fn().mockImplementation((e) => e),
      update: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      remove: jest.fn().mockImplementation((e) => e),
    };

    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: queryRunnerManager,
    };

    const mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    };

    const mockConfigService = {
      get: jest.fn().mockReturnValue('localhost'),
      getOrThrow: jest.fn().mockReturnValue('localhost'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: getRepositoryToken(PaymentEntity), useValue: paymentRepo },
        { provide: getRepositoryToken(OrderEntity), useValue: orderRepo },
        { provide: getRepositoryToken(DiscountUsageEntity), useValue: discountUsageRepo },
        { provide: getRepositoryToken(DiscountCodeEntity), useValue: discountCodeRepo },
        { provide: PaymentGatewayFactory, useValue: gatewayFactory },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: DataSource, useValue: mockDataSource },
        { provide: getRepositoryToken(PaymentMethodConfigEntity), useValue: {
          findOne: jest.fn().mockResolvedValue(null),
          find: jest.fn().mockResolvedValue([]),
          create: jest.fn().mockImplementation((dto: unknown) => dto),
          save: jest.fn().mockImplementation((e: unknown) => e),
        }},
        { provide: AdminNotificationService, useValue: {
          notifyNewOrder: jest.fn(),
          notifyPendingPayment: jest.fn(),
          notifyShippingIncident: jest.fn(),
          getPendingCounts: jest.fn().mockResolvedValue({}),
        }},
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    jest.clearAllMocks();
  });

  // ── CREATE PAYMENT (flow thu cong — khong gateway) ──

  describe('createPayment', () => {
    it('tao payment PENDING voi MoMo — khong goi gateway', async () => {
      orderRepo.findOne.mockResolvedValue(makeOrder());
      paymentRepo.findOne.mockResolvedValue(null);

      const result = await service.createPayment(
        { orderId: 'order-1', method: PaymentMethod.MOMO },
        '127.0.0.1',
      );

      expect(result.paymentId).toBeDefined();
      expect(result.method).toBe(PaymentMethod.MOMO);
      expect(result.amount).toBe(500000);
      // Khong goi gateway — flow thu cong
      expect(gatewayFactory.getGateway).not.toHaveBeenCalled();
    });

    it('tao payment voi bank transfer — tra ve bankInfo', async () => {
      orderRepo.findOne.mockResolvedValue(makeOrder());
      paymentRepo.findOne.mockResolvedValue(null);

      const result = await service.createPayment(
        { orderId: 'order-1', method: PaymentMethod.BANK_TRANSFER },
        '127.0.0.1',
      );

      expect(result.transferContent).toBe('DH-0001');
      expect(result.message).toContain('nội dung');
    });

    it('phi = 0 cho tat ca phuong thuc (flow thu cong)', async () => {
      orderRepo.findOne.mockResolvedValue(makeOrder());
      paymentRepo.findOne.mockResolvedValue(null);

      await service.createPayment(
        { orderId: 'order-1', method: PaymentMethod.MOMO },
        '127.0.0.1',
      );

      expect(paymentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ salPaymentFee: 0 }),
      );
    });

    it('COD tra ve message COD', async () => {
      orderRepo.findOne.mockResolvedValue(makeOrder());
      paymentRepo.findOne.mockResolvedValue(null);

      const result = await service.createPayment(
        { orderId: 'order-1', method: PaymentMethod.COD },
        '127.0.0.1',
      );

      expect(result.message).toContain('COD');
      expect(result.paymentInfo).toBeNull();
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

    it('throw BadRequest khi da co payment SUCCESS', async () => {
      orderRepo.findOne.mockResolvedValue(makeOrder());
      paymentRepo.findOne.mockResolvedValue(makePayment({ salPaymentStatus: PaymentStatus.SUCCESS }));

      await expect(
        service.createPayment({ orderId: 'order-1', method: PaymentMethod.MOMO }, '127.0.0.1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('luu payment record voi status PENDING', async () => {
      orderRepo.findOne.mockResolvedValue(makeOrder());
      paymentRepo.findOne.mockResolvedValue(null);

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

      // updatePaymentStatus dung queryRunner.manager.update
      expect(queryRunnerManager.update).toHaveBeenCalledWith(
        OrderEntity, 'order-1', { salOrderPaymentStatus: 1 },
      );
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
      expect(queryRunnerManager.update).not.toHaveBeenCalled();
    });

    it('throw NotFoundException khi khong tim thay giao dich', async () => {
      paymentRepo.findOne.mockResolvedValue(null);

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

    it('hoan tien MoMo — giai phong discount usage', async () => {
      const payment = makePayment({
        salPaymentStatus: PaymentStatus.SUCCESS,
        salPaymentTransactionId: 'txn-123',
      });
      paymentRepo.findOne.mockResolvedValue(payment);
      const usage = { prmDiscountId: 'disc-1', salOrderId: 'order-1' };
      // Service gio dung queryRunner.manager.find/findOne/save trong transaction
      queryRunnerManager.find.mockResolvedValue([usage]);
      queryRunnerManager.findOne.mockResolvedValue({ prmDiscountId: 'disc-1', prmDiscountUsageCount: 5 });

      await service.refund('pay-1', { amount: 300000 });

      expect(queryRunnerManager.find).toHaveBeenCalledWith(
        DiscountUsageEntity,
        { where: { salOrderId: 'order-1' } },
      );
      // Discount usage count decrement + save qua manager
      expect(queryRunnerManager.save).toHaveBeenCalledWith(
        expect.objectContaining({ prmDiscountUsageCount: 4 }),
      );
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

  describe('flow thu cong — phi = 0 cho tat ca phuong thuc', () => {
    it.each([
      [PaymentMethod.MOMO, 1000000],
      [PaymentMethod.VNPAY, 1000000],
      [PaymentMethod.PAYOO, 1000000],
      [PaymentMethod.ZALOPAY, 1000000],
      [PaymentMethod.COD, 1000000],
      [PaymentMethod.BANK_TRANSFER, 1000000],
    ])('method %i voi amount %i => fee = 0 (thu cong)', async (method, amount) => {
      orderRepo.findOne.mockResolvedValue(makeOrder({ salOrderTotal: amount }));
      paymentRepo.findOne.mockResolvedValue(null);

      await service.createPayment(
        { orderId: 'order-1', method },
        '127.0.0.1',
      );

      expect(paymentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ salPaymentFee: 0, salPaymentStatus: PaymentStatus.PENDING }),
      );
    });
  });
});
