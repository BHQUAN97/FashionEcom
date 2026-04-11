import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationChannel, NotificationPayload } from '../notification-channel.interface';

@Injectable()
export class EmailChannel implements NotificationChannel {
  readonly channelName = 'email';

  constructor(private config: ConfigService) {}

  async send(recipient: string, payload: NotificationPayload): Promise<boolean> {
    // TODO: Integrate with email provider (SES/Nodemailer)
    // For now, log and return true
    console.log(`[EmailChannel] To: ${recipient}, Subject: ${payload.title}`);
    return true;
  }
}
