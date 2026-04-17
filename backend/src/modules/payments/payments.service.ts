import { randomUUID } from 'crypto';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository, DataSource, LessThan } from 'typeorm';
import { PaymentEntity } from './entities/payment.entity';
import { PaymentGatewayFactory } from './gateways/payment-gateway.factory';
import {
  PaymentMethod,
  PaymentStatus,
} from './gateways/payment-gateway.interface';
import { OrderEntity } from '../orders/entities/order.entity';
import { DiscountUsageEntity } from '../promotions/entities/discount-usage.entity';
import { DiscountCodeEntity } from '../promotions/entities/discount-code.entity';
import {
  CreatePaymentDto, PaymentQueryDto, RefundPaymentDto,
  ReviewPaymentDto, UpsertPaymentMethodConfigDto,
} from './dto/create-payment.dto';
import { PaymentMethodConfigEntity } from './entities/payment-method-config.entity';
import { AdminNotificationService } from '../notifications/admin-notification.service';
import { BaseService } from '@/common/services/base.service';
import { UserRole } from '@/common/constants/roles.constant';

/** Phi gateway tinh % — dung cho P&L */
const GATEWAY_FEE_RATES: Record<number, number> = {
  [PaymentMethod.MOMO]: 0.015,
  [PaymentMethod.VNPAY]: 0.011,
  [PaymentMethod.PAYOO]: 0.02,
  [PaymentMethod.ZALOPAY]: 0.015,
};

@Injectable()
export class PaymentsService extends BaseService<PaymentEntity> {
  private readonly logger = new Logger(PaymentsService.name);
  /** Allowed return URL hosts — doc tu config hoac default localhost */
  private readonly allowedReturnHosts: string[];

  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepo: Repository<PaymentEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(DiscountUsageEntity)
    private readonly discountUsageRepo: Repository<DiscountUsageEntity>,
    @InjectRepository(DiscountCodeEntity)
    private readonly discountCodeRepo: Repository<DiscountCodeEntity>,
    @InjectRepository(PaymentMethodConfigEntity)
    private readonly methodConfigRepo: Repository<PaymentMethodConfigEntity>,
    private readonly gatewayFactory: PaymentGatewayFactory,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
    private readonly adminNotifService: AdminNotificationService,
  ) {
    super(paymentRepo, 'salPaymentId', 'Thanh toán');
    const hostsStr = this.configService.get<string>('ALLOWED_RETURN_HOSTS', 'localhost');
    this.allowedReturnHosts = hostsStr.split(',').map((h) => h.trim().toLowerCase());
  }

  /**
   * Tao giao dich thanh toan — TAT CA phuong thuc deu tao PENDING
   * KH thanh toan ngoai (CK, MoMo, ...) roi upload proof → admin duyet
   * Khong co gateway callback — flow thu cong hoan toan
   */
  async createPayment(dto: CreatePaymentDto, ipAddress: string) {
    const order = await this.orderRepo.findOne({
      where: { salOrderId: dto.orderId },
    });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    // Kiem tra don chua thanh toan
    if (order.salOrderPaymentStatus === 1) {
      throw new BadRequestException('Đơn hàng đã được thanh toán');
    }

    // Chong double payment
    const existingSuccess = await this.paymentRepo.findOne({
      where: { salOrderId: dto.orderId, salPaymentStatus: PaymentStatus.SUCCESS },
    });
    if (existingSuccess) {
      throw new BadRequestException('Don hang da duoc thanh toan');
    }

    const method = dto.method as PaymentMethod;
    const amount = Number(order.salOrderTotal);

    // Prefix theo phuong thuc de de phan biet
    const PREFIX: Record<number, string> = {
      [PaymentMethod.COD]: 'COD',
      [PaymentMethod.BANK_TRANSFER]: 'BT',
      [PaymentMethod.MOMO]: 'MOMO',
      [PaymentMethod.VNPAY]: 'VNPAY',
      [PaymentMethod.PAYOO]: 'PAYOO',
      [PaymentMethod.ZALOPAY]: 'ZALO',
    };
    const prefix = PREFIX[method] || 'PAY';

    const payment = this.paymentRepo.create({
      salPaymentId: randomUUID(),
      salOrderId: order.salOrderId,
      salPaymentMethod: method,
      salPaymentAmount: amount,
      salPaymentFee: 0,
      salPaymentStatus: PaymentStatus.PENDING,
      salPaymentTransactionId: `${prefix}-${order.salOrderCode}-${Date.now()}`,
    });
    await this.paymentRepo.save(payment);

    this.logger.log(
      `[AUDIT] Payment created: order=${order.salOrderCode}, method=${prefix}, amount=${amount}`,
    );

    // Thong bao admin khi co don thanh toan online can duyet
    if (method !== PaymentMethod.COD) {
      await this.adminNotifService.notifyPendingPayment(order.salOrderCode, amount, method);
    }

    // Lay cau hinh PT thanh toan (QR, STK, ten TK)
    const methodConfig = await this.methodConfigRepo.findOne({
      where: { salPaymentMethodConfigMethod: method, salPaymentMethodConfigStatus: 1 },
    });

    // Noi dung chuyen khoan goi y = ma don hang
    const transferContent = order.salOrderCode;

    return {
      paymentId: payment.salPaymentId,
      method,
      amount,
      orderCode: order.salOrderCode,
      transferContent,
      paymentInfo: methodConfig ? {
        name: methodConfig.salPaymentMethodConfigName,
        qrImage: methodConfig.salPaymentMethodConfigQrImage,
        accountName: methodConfig.salPaymentMethodConfigAccountName,
        accountNumber: this.maskAccountNumber(methodConfig.salPaymentMethodConfigAccountNumber),
        bankName: methodConfig.salPaymentMethodConfigBankName,
        instructions: methodConfig.salPaymentMethodConfigInstructions,
      } : null,
      message: method === PaymentMethod.COD
        ? 'Đơn hàng COD — thanh toán khi nhận hàng'
        : `Vui lòng thanh toán ${amount.toLocaleString('vi-VN')}đ với nội dung: ${transferContent}`,
    };
  }

  /**
   * Xu ly webhook callback tu gateway — verify signature + amount + update status
   * BAO MAT: verify ca amount khop voi order, khong tin gateway response
   */
  async handleWebhook(gatewayName: string, payload: Record<string, unknown>, signature: string) {
    const gateway = this.gatewayFactory.getGatewayByName(gatewayName);
    const result = await gateway.verifyCallback(payload, signature);

    if (!result.transactionId) {
      throw new BadRequestException('Transaction ID không hợp lệ');
    }

    // Tim payment record theo transaction_id — KHONG fallback theo orderId
    const payment = await this.paymentRepo.findOne({
      where: { salPaymentTransactionId: result.transactionId },
    });

    if (!payment) {
      throw new NotFoundException('Không tìm thấy giao dịch khớp transaction ID');
    }

    // BAO MAT: Kiem tra payment chua bi xu ly (chong replay attack)
    if (payment.salPaymentStatus !== PaymentStatus.PENDING) {
      throw new BadRequestException('Giao dich da duoc xu ly truoc do');
    }

    // BAO MAT: Verify amount tu gateway khop voi payment record trong DB
    if (result.amount !== undefined) {
      const expectedAmount = Math.round(Number(payment.salPaymentAmount));
      const actualAmount = Math.round(Number(result.amount));
      if (expectedAmount !== actualAmount) {
        // Log mismatch — co the la tan cong thay doi so tien
        payment.salPaymentGatewayResponse = JSON.stringify({
          ...(payment.salPaymentGatewayResponse ? JSON.parse(payment.salPaymentGatewayResponse) : {}),
          amountMismatch: { expected: expectedAmount, actual: actualAmount },
          rejectedAt: new Date().toISOString(),
        });
        payment.salPaymentStatus = PaymentStatus.FAILED;
        await this.paymentRepo.save(payment);
        throw new BadRequestException('So tien thanh toan khong khop — giao dich bi tu choi');
      }
    }

    // BAO MAT: Verify orderId tu gateway khop voi payment record
    if (result.orderId && payment.salOrderId !== result.orderId) {
      throw new BadRequestException('Order ID khong khop — giao dich bi tu choi');
    }

    return this.updatePaymentStatus(payment, result.success);
  }

  /**
   * Cap nhat trang thai payment va order — atomic transaction
   */
  private async updatePaymentStatus(payment: PaymentEntity, success: boolean) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      payment.salPaymentStatus = success ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
      payment.salPaymentGatewayResponse = JSON.stringify({
        ...(payment.salPaymentGatewayResponse ? JSON.parse(payment.salPaymentGatewayResponse) : {}),
        webhookResult: success,
        updatedAt: new Date().toISOString(),
      });
      await queryRunner.manager.save(payment);

      // Cap nhat trang thai thanh toan cua don hang
      if (success) {
        await queryRunner.manager.update(OrderEntity, payment.salOrderId, {
          salOrderPaymentStatus: 1, // DA THANH TOAN
        });
      }

      await queryRunner.commitTransaction();

      // AUDIT: ghi log thay doi trang thai thanh toan
      this.logger.log(
        `[AUDIT] Payment status changed: id=${payment.salPaymentId}, order=${payment.salOrderId}, ` +
        `status=${success ? 'SUCCESS' : 'FAILED'}, amount=${payment.salPaymentAmount}`,
      );

      return { success, paymentId: payment.salPaymentId };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Callback return URL tu gateway (GET redirect)
   * BAO MAT: signature tu query params — gateway nhu VNPAY gui vnp_SecureHash trong URL
   */
  async handleCallback(gatewayName: string, queryParams: Record<string, unknown>) {
    const signature = (queryParams.vnp_SecureHash || queryParams.signature || queryParams.mac || '') as string;
    if (!signature) {
      throw new BadRequestException('Missing signature in callback');
    }
    return this.handleWebhook(gatewayName, queryParams, signature);
  }

  /**
   * Hoan tien giao dich
   *
   * COD/Bank: chi update DB (khong goi gateway) → wrap transaction
   * Gateway (MoMo/VNPAY...): dung compensation pattern
   *   1. Goi gateway truoc (khong undo duoc neu DB fail)
   *   2. Neu gateway success → wrap transaction update DB (payment + discount usage release)
   *   3. Neu DB fail sau khi gateway da refund → LOG + ALERT admin de xu ly thu cong
   */
  async refund(paymentId: string, dto: RefundPaymentDto) {
    const payment = await super.findOne(paymentId);

    if (payment.salPaymentStatus !== PaymentStatus.SUCCESS) {
      throw new BadRequestException('Chỉ có thể hoàn tiền giao dịch thành công');
    }

    // BAO MAT: Validate refund amount khong vuot qua so tien thanh toan goc
    if (dto.amount > Number(payment.salPaymentAmount)) {
      throw new BadRequestException(
        `So tien hoan tra (${dto.amount.toLocaleString()}) khong duoc vuot so tien thanh toan (${Number(payment.salPaymentAmount).toLocaleString()})`,
      );
    }
    if (dto.amount <= 0) {
      throw new BadRequestException('So tien hoan tra phai lon hon 0');
    }

    const method = payment.salPaymentMethod as PaymentMethod;

    // COD va Bank Transfer khong can goi gateway — chi update DB trong transaction
    if (method === PaymentMethod.COD || method === PaymentMethod.BANK_TRANSFER) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        payment.salPaymentStatus = PaymentStatus.REFUNDED;
        await queryRunner.manager.save(payment);

        // Giai phong discount usage trong cung transaction
        await this.releaseDiscountUsageInTx(queryRunner, payment.salOrderId);

        await queryRunner.commitTransaction();

        this.logger.warn(
          `[AUDIT] Manual refund (COD/Bank): payment=${paymentId}, order=${payment.salOrderId}, amount=${dto.amount}`,
        );
        return { success: true, message: 'Hoàn tiền thủ công (COD/Bank)' };
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    }

    // Online gateway — compensation pattern: goi gateway TRUOC, neu success thi update DB
    const gateway = this.gatewayFactory.getGateway(method);
    const result = await gateway.refund(
      payment.salPaymentTransactionId!,
      dto.amount,
      dto.reason,
    );

    if (!result.success) {
      // Gateway tu choi → khong can update DB, tra loi ngay
      return result;
    }

    // Gateway da hoan tien → phai update DB. Neu DB fail → LOG + ALERT vi khong undo duoc refund
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      payment.salPaymentStatus = PaymentStatus.REFUNDED;
      await queryRunner.manager.save(payment);

      // Giai phong discount usage trong cung transaction
      await this.releaseDiscountUsageInTx(queryRunner, payment.salOrderId);

      await queryRunner.commitTransaction();

      this.logger.warn(
        `[AUDIT] Refund processed: payment=${paymentId}, order=${payment.salOrderId}, ` +
        `amount=${dto.amount}, reason=${dto.reason}`,
      );
    } catch (err) {
      await queryRunner.rollbackTransaction();

      // CRITICAL: gateway da refund nhung DB fail → can admin can thiep thu cong
      this.logger.error(
        `[CRITICAL] Gateway refund SUCCESS but DB update FAILED: payment=${paymentId}, ` +
        `order=${payment.salOrderId}, amount=${dto.amount}, error=${err instanceof Error ? err.message : String(err)}. ` +
        `MANUAL ACTION REQUIRED: set payment.status=REFUNDED va release discount usage.`,
      );

      // Gui alert cho admin de xu ly
      try {
        await this.adminNotifService.notifyPendingPayment(
          `REFUND-DB-FAIL-${payment.salOrderId}`,
          dto.amount,
          method,
        );
      } catch (notifErr) {
        this.logger.error(`[CRITICAL] Admin notify also failed: ${notifErr instanceof Error ? notifErr.message : String(notifErr)}`);
      }

      // Van tra success vi gateway da hoan tien — khach hang da nhan tien
      return { ...result, warning: 'Refund completed at gateway but DB sync failed — admin alerted' };
    } finally {
      await queryRunner.release();
    }

    return result;
  }

  /**
   * Giai phong discount usage khi refund — giam usage count cua discount (legacy, ngoai TX)
   */
  private async releaseDiscountUsage(orderId: string) {
    const usages = await this.discountUsageRepo.find({
      where: { salOrderId: orderId },
    });
    for (const usage of usages) {
      const discount = await this.discountCodeRepo.findOne({
        where: { prmDiscountId: usage.prmDiscountId },
      });
      if (discount && discount.prmDiscountUsageCount > 0) {
        discount.prmDiscountUsageCount--;
        await this.discountCodeRepo.save(discount);
      }
      await this.discountUsageRepo.remove(usage);
    }
  }

  /**
   * Giai phong discount usage trong cung transaction voi refund
   * Dung queryRunner.manager de nam trong TX cua caller
   */
  private async releaseDiscountUsageInTx(queryRunner: import('typeorm').QueryRunner, orderId: string) {
    const manager = queryRunner.manager;
    const usages = await manager.find(DiscountUsageEntity, {
      where: { salOrderId: orderId },
    });
    for (const usage of usages) {
      const discount = await manager.findOne(DiscountCodeEntity, {
        where: { prmDiscountId: usage.prmDiscountId },
      });
      if (discount && discount.prmDiscountUsageCount > 0) {
        discount.prmDiscountUsageCount--;
        await manager.save(discount);
      }
      await manager.remove(usage);
    }
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
    if (query.pendingReview) {
      qb.andWhere('p.salPaymentStatus = :bts', { bts: PaymentStatus.PENDING });
      qb.andWhere('p.salPaymentMethod != :codm', { codm: PaymentMethod.COD });
    }

    qb.orderBy('p.createdDate', 'DESC');

    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();

    return this.paginate(data, total, page, limit);
  }

  /**
   * Cron: huy giao dich qua han — chay moi 5 phut
   * Tranh payment PENDING treo vinh vien trong DB
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
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

    if (count > 0) {
      this.logger.log(`[AUDIT] Expired ${count} timeout payments`);
    }
    return { expired: count };
  }

  /**
   * Query 1 giao dich
   */
  async findOne(id: string) {
    return super.findOne(id);
  }

  /**
   * Query 1 giao dich voi ownership check — chong IDOR
   * Admin/Staff bypass, Customer chi xem payment cua don hang cua minh
   */
  async findOneWithOwnerCheck(id: string, userId: string, userRole: number) {
    const payment = await super.findOne(id);

    // Admin+ bypass ownership check
    if (userRole >= UserRole.CUSTOMER && userRole <= UserRole.WAREHOUSE && userRole !== UserRole.CUSTOMER) {
      return payment;
    }

    // Customer: verify order ownership
    const order = await this.orderRepo.findOne({
      where: { salOrderId: payment.salOrderId },
    });
    if (!order || order.sysCustomerId !== userId) {
      throw new ForbiddenException('Khong co quyen xem giao dich nay');
    }

    return payment;
  }

  // ==================== Bank Transfer Flow ====================

  /**
   * Admin duyet/tu choi thanh toan — doi chieu noi dung CK voi ma don hang
   * approve → payment SUCCESS + order da thanh toan
   * reject → payment FAILED
   */
  async reviewPayment(paymentId: string, dto: ReviewPaymentDto, adminId: string) {
    const payment = await super.findOne(paymentId);

    if (payment.salPaymentStatus !== PaymentStatus.PENDING) {
      throw new BadRequestException('Giao dich da duoc xu ly truoc do');
    }

    payment.salPaymentAdminNote = dto.note || null;
    payment.salPaymentReviewedBy = adminId;
    payment.salPaymentReviewedAt = new Date();

    if (dto.action === 'approve') {
      const result = await this.updatePaymentStatus(payment, true);

      this.logger.warn(
        `[AUDIT] Payment APPROVED: payment=${paymentId}, order=${payment.salOrderId}, ` +
        `method=${payment.salPaymentMethod}, amount=${payment.salPaymentAmount}, admin=${adminId}`,
      );

      return { ...result, action: 'approved' };
    } else {
      payment.salPaymentStatus = PaymentStatus.FAILED;
      await this.paymentRepo.save(payment);

      this.logger.warn(
        `[AUDIT] Payment REJECTED: payment=${paymentId}, order=${payment.salOrderId}, ` +
        `method=${payment.salPaymentMethod}, reason=${dto.note}, admin=${adminId}`,
      );

      return { success: false, paymentId, action: 'rejected', reason: dto.note };
    }
  }

  /**
   * Lay danh sach payment cho duyet — PENDING, khong phai COD
   * Admin doi chieu sao ke voi ma don hang de duyet
   */
  async findPendingReviews(query: PaymentQueryDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);

    const qb = this.paymentRepo.createQueryBuilder('p')
      .leftJoin('sal_order', 'o', 'o.sal_order_id = p.sal_order_id')
      .addSelect(['o.sal_order_code', 'o.sal_order_total', 'o.sys_customer_id']);

    // Don PENDING, khong phai COD (COD duyet rieng khi giao hang)
    qb.andWhere('p.salPaymentStatus = :s', { s: PaymentStatus.PENDING });
    qb.andWhere('p.salPaymentMethod != :cod', { cod: PaymentMethod.COD });

    if (query.method !== undefined) {
      qb.andWhere('p.salPaymentMethod = :m', { m: query.method });
    }
    if (query.search) {
      qb.andWhere('(p.salPaymentTransactionId LIKE :q OR o.sal_order_code LIKE :q)', {
        q: `%${query.search}%`,
      });
    }

    qb.orderBy('p.createdDate', 'ASC'); // FIFO — don cu duyet truoc

    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getRawAndEntities();

    // Dem theo phuong thuc
    const byMethodRaw = await this.paymentRepo
      .createQueryBuilder('p')
      .select('p.salPaymentMethod', 'method')
      .addSelect('COUNT(*)', 'count')
      .where('p.salPaymentStatus = :s', { s: PaymentStatus.PENDING })
      .andWhere('p.salPaymentMethod != :cod', { cod: PaymentMethod.COD })
      .groupBy('p.salPaymentMethod')
      .getRawMany();

    const byMethod = Object.fromEntries(
      byMethodRaw.map((r: { method: number; count: string }) => [r.method, Number(r.count)]),
    );

    return {
      ...this.paginate(data.entities, total, page, limit),
      stats: {
        totalPending: total,
        byMethod,
      },
    };
  }

  // ==================== Payment Method Config (QR, STK) ====================

  /** Lay tat ca cau hinh PT thanh toan — day du STK, chi Admin xem */
  async getAllMethodConfigs() {
    this.logger.log('[AUDIT] Admin accessed full payment method configs (QR + account numbers)');
    return this.methodConfigRepo.find({
      order: { salPaymentMethodConfigSortOrder: 'ASC' },
    });
  }

  /**
   * Lay cac PT thanh toan dang bat — cho KH checkout
   * BAO MAT: che 1 phan STK, chi hien khi da dang nhap
   */
  async getActiveMethodConfigsSafe() {
    const configs = await this.methodConfigRepo.find({
      where: { salPaymentMethodConfigStatus: 1 },
      order: { salPaymentMethodConfigSortOrder: 'ASC' },
    });

    // Che bot thong tin nhay cam
    return configs.map((c) => ({
      method: c.salPaymentMethodConfigMethod,
      name: c.salPaymentMethodConfigName,
      qrImage: c.salPaymentMethodConfigQrImage,
      accountName: c.salPaymentMethodConfigAccountName,
      accountNumber: this.maskAccountNumber(c.salPaymentMethodConfigAccountNumber),
      bankName: c.salPaymentMethodConfigBankName,
      instructions: c.salPaymentMethodConfigInstructions,
    }));
  }

  /**
   * Che 1 phan STK — chi hien 4 so cuoi
   * "1234567890" → "******7890"
   */
  private maskAccountNumber(accountNumber: string | null): string | null {
    if (!accountNumber || accountNumber.length <= 4) return accountNumber;
    const visible = accountNumber.slice(-4);
    const masked = '*'.repeat(accountNumber.length - 4);
    return `${masked}${visible}`;
  }

  /** Admin upsert cau hinh 1 PT thanh toan (QR, STK, huong dan) */
  async upsertMethodConfig(dto: UpsertPaymentMethodConfigDto) {
    let config = await this.methodConfigRepo.findOne({
      where: { salPaymentMethodConfigMethod: dto.method },
    });

    if (config) {
      config.salPaymentMethodConfigName = dto.name;
      if (dto.qrImage !== undefined) config.salPaymentMethodConfigQrImage = dto.qrImage;
      if (dto.accountName !== undefined) config.salPaymentMethodConfigAccountName = dto.accountName;
      if (dto.accountNumber !== undefined) config.salPaymentMethodConfigAccountNumber = dto.accountNumber;
      if (dto.bankName !== undefined) config.salPaymentMethodConfigBankName = dto.bankName;
      if (dto.instructions !== undefined) config.salPaymentMethodConfigInstructions = dto.instructions;
      if (dto.status !== undefined) config.salPaymentMethodConfigStatus = dto.status;
      if (dto.sortOrder !== undefined) config.salPaymentMethodConfigSortOrder = dto.sortOrder;
    } else {
      config = this.methodConfigRepo.create({
        salPaymentMethodConfigId: randomUUID(),
        salPaymentMethodConfigMethod: dto.method,
        salPaymentMethodConfigName: dto.name,
        salPaymentMethodConfigQrImage: dto.qrImage || null,
        salPaymentMethodConfigAccountName: dto.accountName || null,
        salPaymentMethodConfigAccountNumber: dto.accountNumber || null,
        salPaymentMethodConfigBankName: dto.bankName || null,
        salPaymentMethodConfigInstructions: dto.instructions || null,
        salPaymentMethodConfigStatus: dto.status ?? 1,
        salPaymentMethodConfigSortOrder: dto.sortOrder ?? 0,
      });
    }

    this.logger.log(
      `[AUDIT] Payment method config updated: method=${dto.method}, name=${dto.name}`,
    );

    return this.methodConfigRepo.save(config);
  }

  /**
   * BAO MAT: Validate returnUrl — chong open redirect
   * Chi chap nhan relative URL (bat dau '/') hoac URL co host nam trong whitelist
   */
  private validateReturnUrl(url: string): string {
    // Relative URL — an toan
    if (url.startsWith('/') && !url.startsWith('//')) {
      return url;
    }

    // Absolute URL — kiem tra host
    try {
      const parsed = new URL(url);
      if (this.allowedReturnHosts.includes(parsed.hostname.toLowerCase())) {
        return url;
      }
    } catch {
      // URL khong hop le
    }

    throw new BadRequestException('returnUrl khong hop le — chi chap nhan relative URL hoac domain duoc phep');
  }

  /**
   * BAO MAT: Sanitize gateway response — strip HTML tags tu string values
   * Chong stored XSS khi hien thi gateway response trong admin panel
   */
  private sanitizeGatewayResponse(obj: unknown): string {
    const stripHtml = (str: string): string => str.replace(/<[^>]*>/g, '');

    const sanitize = (value: unknown): unknown => {
      if (typeof value === 'string') return stripHtml(value);
      if (Array.isArray(value)) return value.map(sanitize);
      if (value && typeof value === 'object') {
        const result: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(value)) {
          result[k] = sanitize(v);
        }
        return result;
      }
      return value;
    };

    return JSON.stringify(sanitize(obj));
  }
}
