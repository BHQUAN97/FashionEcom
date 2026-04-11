import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { NotificationsController, AdminNotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationEntity, PushSubscriptionEntity } from './entities/notification.entity';
import { EmailChannel } from './channels/email.channel';
import { WebPushChannel } from './channels/webpush.channel';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity, PushSubscriptionEntity]),
    ConfigModule,
  ],
  controllers: [NotificationsController, AdminNotificationsController],
  providers: [
    EmailChannel,
    WebPushChannel,
    {
      provide: 'NOTIFICATION_CHANNELS',
      useFactory: (email: EmailChannel, webpush: WebPushChannel) => [email, webpush],
      inject: [EmailChannel, WebPushChannel],
    },
    NotificationsService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
