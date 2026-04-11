import { Injectable, Inject, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { NotificationEntity, PushSubscriptionEntity } from './entities/notification.entity';
import { NotificationChannel } from './notification-channel.interface';

/** Channel mapping: 0=webpush, 1=email */
const CHANNEL_MAP: Record<number, string> = {
  0: 'webpush',
  1: 'email',
};

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notifRepo: Repository<NotificationEntity>,
    @InjectRepository(PushSubscriptionEntity)
    private readonly subRepo: Repository<PushSubscriptionEntity>,
    @Optional() @Inject('NOTIFICATION_CHANNELS')
    private readonly channels: NotificationChannel[] = [],
  ) {}

  /** Dang ky nhan push notification */
  async subscribe(customerId: string, subscription: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
    userAgent?: string;
  }) {
    // Xoa subscription cu neu trung endpoint
    await this.subRepo.delete({ sysPushSubscriptionEndpoint: subscription.endpoint });

    const sub = this.subRepo.create({
      sysPushSubscriptionId: uuidv4(),
      sysCustomerId: customerId,
      sysPushSubscriptionEndpoint: subscription.endpoint,
      sysPushSubscriptionKeys: subscription.keys,
      sysPushSubscriptionUserAgent: subscription.userAgent || null,
    });
    return this.subRepo.save(sub);
  }

  /** Huy dang ky */
  async unsubscribe(customerId: string, endpoint: string) {
    await this.subRepo.delete({ sysCustomerId: customerId, sysPushSubscriptionEndpoint: endpoint });
  }

  /** Tao notification va queue gui */
  async createNotification(params: {
    customerId?: string;
    type: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    channel?: number;
  }) {
    const notif = this.notifRepo.create({
      sysNotificationId: uuidv4(),
      sysCustomerId: params.customerId || null,
      sysNotificationType: params.type,
      sysNotificationTitle: params.title,
      sysNotificationBody: params.body,
      sysNotificationData: params.data || null,
      sysNotificationChannel: params.channel || 0,
      sysNotificationStatus: 0, // Queued
    });
    await this.notifRepo.save(notif);

    // Dispatch toi channel tuong ung
    const channelName = CHANNEL_MAP[params.channel || 0] || 'webpush';
    const channel = this.channels.find((c) => c.channelName === channelName);
    if (channel && params.customerId) {
      await channel.send(params.customerId, {
        title: params.title,
        body: params.body,
        data: params.data,
      });
    }

    // Mark sent
    notif.sysNotificationStatus = 1;
    notif.sysNotificationSentAt = new Date();
    await this.notifRepo.save(notif);

    return notif;
  }

  /** Gui broadcast cho tat ca subscribers */
  async broadcast(title: string, body: string, data?: Record<string, unknown>) {
    const subs = await this.subRepo.find();
    let sent = 0;

    for (const sub of subs) {
      await this.createNotification({
        customerId: sub.sysCustomerId,
        type: 'broadcast',
        title,
        body,
        data,
        channel: 0,
      });
      sent++;
    }

    return { sent };
  }

  /** Danh sach notification cua KH */
  async findByCustomer(customerId: string, page = 1, limit = 20) {
    const total = await this.notifRepo.count({
      where: [
        { sysCustomerId: customerId },
        { sysCustomerId: null as unknown as string }, // broadcast
      ],
    });
    const data = await this.notifRepo.find({
      where: [
        { sysCustomerId: customerId },
        { sysCustomerId: null as unknown as string },
      ],
      order: { createdDate: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, pagination: { page, limit, total, total_pages: Math.ceil(total / limit) } };
  }

  /** Danh dau da doc */
  async markRead(notifId: string) {
    await this.notifRepo.update(notifId, { sysNotificationStatus: 3 });
  }
}
