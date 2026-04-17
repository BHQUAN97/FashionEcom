import {
  Controller, Get, Post, Delete, Patch, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AdminNotificationService } from './admin-notification.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserRole } from '@/common/constants/roles.constant';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifService: NotificationsService) {}

  @Post('subscribe')
  async subscribe(
    @CurrentUser('userId') customerId: string,
    @Body() body: { endpoint: string; keys: { p256dh: string; auth: string }; userAgent?: string },
  ) {
    const data = await this.notifService.subscribe(customerId, body);
    return { data, message: 'Đăng ký push thành công' };
  }

  @Delete('subscribe')
  async unsubscribe(
    @CurrentUser('userId') customerId: string,
    @Body('endpoint') endpoint: string,
  ) {
    await this.notifService.unsubscribe(customerId, endpoint);
    return { message: 'Hủy đăng ký thành công' };
  }

  @Get()
  async findAll(
    @CurrentUser('userId') customerId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.notifService.findByCustomer(customerId, page, limit);
  }

  @Patch(':id/read')
  async markRead(@Param('id') id: string) {
    await this.notifService.markRead(id);
    return { message: 'Đã đánh dấu đọc' };
  }
}

@Controller('admin/notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class AdminNotificationsController {
  constructor(
    private readonly notifService: NotificationsService,
    private readonly adminNotifService: AdminNotificationService,
  ) {}

  @Post('broadcast')
  async broadcast(@Body() body: { title: string; body: string; data?: Record<string, unknown> }) {
    const data = await this.notifService.broadcast(body.title, body.body, body.data);
    return { data, message: 'Gửi broadcast thành công' };
  }

  // --- Admin Notification Bell ---

  /** Danh sach noti cua admin dang login */
  @Get('admin')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  async getAdminNotifications(
    @CurrentUser('userId') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminNotifService.findAll(userId, page || 1, limit || 20);
  }

  /** So noti chua doc — cho badge tren chuong */
  @Get('admin/unread-count')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  async getUnreadCount(@CurrentUser('userId') userId: string) {
    const count = await this.adminNotifService.getUnreadCount(userId);
    return { data: { count }, message: 'OK' };
  }

  /** Pending summary — tong quan viec can xu ly */
  @Get('admin/pending-summary')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  async getPendingSummary() {
    const data = await this.adminNotifService.getPendingCounts();
    return { data, message: 'OK' };
  }

  /** Danh dau da doc 1 noti */
  @Patch('admin/:id/read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  async markRead(@Param('id') id: string) {
    await this.adminNotifService.markRead(id);
    return { message: 'OK' };
  }

  /** Danh dau da doc tat ca */
  @Post('admin/mark-all-read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  async markAllRead(@CurrentUser('userId') userId: string) {
    await this.adminNotifService.markAllRead(userId);
    return { message: 'Da doc tat ca' };
  }
}
