import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationChannel, NotificationPayload } from '../notification-channel.interface';

@Injectable()
export class WebPushChannel implements NotificationChannel {
  readonly channelName = 'webpush';

  constructor(private config: ConfigService) {}

  async send(recipient: string, payload: NotificationPayload): Promise<boolean> {
    // TODO: Integrate with web-push library
    console.log(`[WebPushChannel] To: ${recipient}, Title: ${payload.title}`);
    return true;
  }
}
