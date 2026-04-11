/**
 * Notification Channel interface — WebPush, Email ke thua
 * Co the mo rong them SMS, Zalo OA sau
 */
export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  icon?: string;
  url?: string;
}

export interface NotificationChannel {
  readonly channelName: string;
  send(recipient: string, payload: NotificationPayload): Promise<boolean>;
}
