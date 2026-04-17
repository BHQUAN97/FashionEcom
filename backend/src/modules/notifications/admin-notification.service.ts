import { randomUUID } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { AdminNotificationEntity } from './entities/admin-notification.entity';

/**
 * Notification cho admin:
 * - Thong bao khi co don moi
 * - Nhac gio tron: bao nhieu don/thanh toan chua duyet
 * - Canh bao su co van chuyen
 */
@Injectable()
export class AdminNotificationService {
  private readonly logger = new Logger(AdminNotificationService.name);

  constructor(
    @InjectRepository(AdminNotificationEntity)
    private readonly notifRepo: Repository<AdminNotificationEntity>,
    private readonly dataSource: DataSource,
  ) {}

  // ==================== Tao notification ====================

  /** Tao 1 notification cho admin (hoac tat ca admin neu userId=null) */
  async create(params: {
    userId?: string | null;
    type: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
  }) {
    const notif = this.notifRepo.create({
      sysAdminNotificationId: randomUUID(),
      sysUserId: params.userId || null,
      sysAdminNotificationType: params.type,
      sysAdminNotificationTitle: params.title,
      sysAdminNotificationBody: params.body,
      sysAdminNotificationData: params.data || null,
      sysAdminNotificationRead: 0,
    });
    return this.notifRepo.save(notif);
  }

  // ==================== Thong bao don moi ====================

  /** Goi khi co don hang moi — tao noti cho tat ca admin */
  async notifyNewOrder(orderCode: string, total: number, paymentMethod: number) {
    const METHOD_NAMES: Record<number, string> = {
      0: 'COD', 1: 'Chuyển khoản', 2: 'MoMo', 3: 'VNPay', 4: 'Payoo', 5: 'ZaloPay',
    };

    await this.create({
      type: 'new_order',
      title: `Đơn hàng mới: ${orderCode}`,
      body: `${total.toLocaleString('vi-VN')}đ — ${METHOD_NAMES[paymentMethod] || 'Khác'}`,
      data: { orderCode, total, paymentMethod },
    });
  }

  /** Goi khi KH thanh toan (can admin duyet) */
  async notifyPendingPayment(orderCode: string, amount: number, method: number) {
    const METHOD_NAMES: Record<number, string> = {
      1: 'Chuyển khoản', 2: 'MoMo', 3: 'VNPay',
    };

    await this.create({
      type: 'pending_payment',
      title: `Chờ duyệt thanh toán: ${orderCode}`,
      body: `${amount.toLocaleString('vi-VN')}đ qua ${METHOD_NAMES[method] || 'Online'} — cần đối chiếu`,
      data: { orderCode, amount, method },
    });
  }

  /** Goi khi co su co van chuyen */
  async notifyShippingIncident(orderCode: string, incidentType: string) {
    await this.create({
      type: 'shipping_incident',
      title: `Sự cố vận chuyển: ${orderCode}`,
      body: `Loại: ${incidentType}`,
      data: { orderCode, incidentType },
    });
  }

  // ==================== Cron nhac gio tron ====================

  /**
   * Moi gio tron: dem don chua duyet, TT chua duyet, su co chua xu ly
   * Gui 1 noti tom tat neu co bat ky don nao pending
   */
  @Cron('0 * * * *') // Dau moi gio
  async hourlyReminder() {
    const counts = await this.getPendingCounts();

    // Khong gui neu khong co gi pending
    if (counts.pendingOrders === 0 && counts.pendingPayments === 0 && counts.openIncidents === 0) {
      return;
    }

    const parts: string[] = [];
    if (counts.pendingOrders > 0) parts.push(`${counts.pendingOrders} đơn chờ xác nhận`);
    if (counts.pendingPayments > 0) parts.push(`${counts.pendingPayments} thanh toán chờ duyệt`);
    if (counts.openIncidents > 0) parts.push(`${counts.openIncidents} sự cố chưa xử lý`);

    const now = new Date();
    const hour = now.getHours().toString().padStart(2, '0');

    await this.create({
      type: 'hourly_summary',
      title: `⏰ ${hour}:00 — ${parts.length} việc cần xử lý`,
      body: parts.join(' · '),
      data: counts,
    });

    this.logger.log(`[CRON] Hourly reminder: ${parts.join(', ')}`);
  }

  // ==================== Dem pending ====================

  /** Dem tat ca cac loai pending — dung cho dashboard + cron */
  async getPendingCounts(): Promise<{
    pendingOrders: number;
    pendingPayments: number;
    openIncidents: number;
    shippingFailed: number;
    unreadNotifications: number;
  }> {
    const [orders, payments, incidents, shippingFailed, unread] = await Promise.all([
      // Don cho xac nhan (status=0)
      this.dataSource.query(
        `SELECT COUNT(*) AS c FROM sal_order WHERE sal_order_status = 0`,
      ),
      // Thanh toan cho duyet (PENDING, khong phai COD)
      this.dataSource.query(
        `SELECT COUNT(*) AS c FROM sal_payment WHERE sal_payment_status = 0 AND sal_payment_method != 0`,
      ),
      // Su co van chuyen chua xu ly (status 0,1)
      this.dataSource.query(
        `SELECT COUNT(*) AS c FROM sal_shipping_incident WHERE sal_shipping_incident_status IN (0,1)`,
      ),
      // Don giao that bai (shipping_status=6)
      this.dataSource.query(
        `SELECT COUNT(*) AS c FROM sal_order WHERE sal_order_shipping_status = 6`,
      ),
      // Noti admin chua doc
      this.dataSource.query(
        `SELECT COUNT(*) AS c FROM sys_admin_notification WHERE sys_admin_notification_read = 0`,
      ),
    ]);

    return {
      pendingOrders: Number(orders[0]?.c || 0),
      pendingPayments: Number(payments[0]?.c || 0),
      openIncidents: Number(incidents[0]?.c || 0),
      shippingFailed: Number(shippingFailed[0]?.c || 0),
      unreadNotifications: Number(unread[0]?.c || 0),
    };
  }

  // ==================== CRUD notification ====================

  /** Danh sach noti admin — moi nhat truoc */
  async findAll(userId: string, page = 1, limit = 20) {
    const qb = this.notifRepo.createQueryBuilder('n')
      .where('(n.sysUserId = :uid OR n.sysUserId IS NULL)', { uid: userId })
      .orderBy('n.createdDate', 'DESC');

    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();

    const unread = await this.notifRepo
      .createQueryBuilder('n')
      .where('(n.sysUserId = :uid OR n.sysUserId IS NULL)', { uid: userId })
      .andWhere('n.sysAdminNotificationRead = 0')
      .getCount();

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      unread,
    };
  }

  /** Danh dau da doc 1 noti */
  async markRead(id: string) {
    await this.notifRepo.update(id, {
      sysAdminNotificationRead: 1,
      sysAdminNotificationReadAt: new Date(),
    });
  }

  /** Danh dau da doc tat ca */
  async markAllRead(userId: string) {
    await this.notifRepo
      .createQueryBuilder()
      .update()
      .set({ sysAdminNotificationRead: 1, sysAdminNotificationReadAt: new Date() })
      .where('(sys_user_id = :uid OR sys_user_id IS NULL)', { uid: userId })
      .andWhere('sys_admin_notification_read = 0')
      .execute();
  }

  /** Dem chua doc */
  async getUnreadCount(userId: string): Promise<number> {
    return this.notifRepo
      .createQueryBuilder('n')
      .where('(n.sysUserId = :uid OR n.sysUserId IS NULL)', { uid: userId })
      .andWhere('n.sysAdminNotificationRead = 0')
      .getCount();
  }
}
