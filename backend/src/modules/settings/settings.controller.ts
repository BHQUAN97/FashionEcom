import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/constants/roles.constant';

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getAll() {
    const data = await this.settingsService.getAll();
    return { data, message: 'OK' };
  }

  @Get(':group')
  async getByGroup(@Param('group') group: string) {
    const data = await this.settingsService.getByGroup(group);
    return { data, message: 'OK' };
  }

  @Put(':group')
  async updateByGroup(
    @Param('group') group: string,
    @Body() data: Record<string, string>,
  ) {
    const result = await this.settingsService.updateByGroup(group, data);
    return { data: result, message: 'Cap nhat cai dat thanh cong' };
  }
}
