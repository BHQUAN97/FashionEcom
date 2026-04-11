import {
  Controller, Get, Post, Delete, Patch, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
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
    @CurrentUser('sub') customerId: string,
    @Body() body: { endpoint: string; keys: { p256dh: string; auth: string }; userAgent?: string },
  ) {
    const data = await this.notifService.subscribe(customerId, body);
    return { data, message: 'Dang ky push thanh cong' };
  }

  @Delete('subscribe')
  async unsubscribe(
    @CurrentUser('sub') customerId: string,
    @Body('endpoint') endpoint: string,
  ) {
    await this.notifService.unsubscribe(customerId, endpoint);
    return { message: 'Huy dang ky thanh cong' };
  }

  @Get()
  async findAll(
    @CurrentUser('sub') customerId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.notifService.findByCustomer(customerId, page, limit);
  }

  @Patch(':id/read')
  async markRead(@Param('id') id: string) {
    await this.notifService.markRead(id);
    return { message: 'Da danh dau doc' };
  }
}

@Controller('admin/notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class AdminNotificationsController {
  constructor(private readonly notifService: NotificationsService) {}

  @Post('broadcast')
  async broadcast(@Body() body: { title: string; body: string; data?: Record<string, unknown> }) {
    const data = await this.notifService.broadcast(body.title, body.body, body.data);
    return { data, message: 'Gui broadcast thanh cong' };
  }
}
