import { Controller, Get, Delete, Query, UseGuards } from '@nestjs/common';
import { SystemLogService } from './system-log.service';
import { SystemLogQueryDto } from './dto/system-log-query.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/constants/roles.constant';

@Controller('admin/system-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class SystemLogController {
  constructor(private readonly service: SystemLogService) {}

  /** Lay danh sach log voi filter */
  @Get()
  async findAll(@Query() query: SystemLogQueryDto) {
    const result = await this.service.findAll(query);
    return { data: result, message: 'OK' };
  }

  /** Thong ke nhanh theo level */
  @Get('stats')
  async stats() {
    const data = await this.service.getStats();
    return { data, message: 'OK' };
  }

  /** Xoa log cu (> 30 ngay) */
  @Delete('cleanup')
  @Roles(UserRole.SUPER_ADMIN)
  async cleanup() {
    const deleted = await this.service.cleanup(30);
    return { data: { deleted }, message: `Da xoa ${deleted} log cu hon 30 ngay` };
  }
}
