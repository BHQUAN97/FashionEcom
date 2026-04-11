import {
  Controller, Get, Post, Put, Param, Body, UseGuards,
} from '@nestjs/common';
import { GuidesService } from './guides.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/roles.constant';

@Controller('admin/guides')
@UseGuards(JwtAuthGuard)
export class GuidesController {
  constructor(private readonly guidesService: GuidesService) {}

  @Get(':screenId')
  async getGuide(
    @Param('screenId') screenId: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: number,
  ) {
    const data = await this.guidesService.getGuide(screenId, userId, role);
    return { data };
  }

  @Post(':screenId/complete')
  async complete(
    @Param('screenId') screenId: string,
    @CurrentUser('sub') userId: string,
  ) {
    await this.guidesService.complete(screenId, userId);
    return { message: 'Da hoan thanh guide' };
  }

  @Get('manage')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async findAll() {
    const data = await this.guidesService.findAll();
    return { data };
  }

  @Put('manage/:screenId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async update(
    @Param('screenId') screenId: string,
    @Body() body: {
      title?: string;
      roles?: number[];
      steps?: { title: string; description: string; selector: string; position?: string }[];
      status?: number;
    },
  ) {
    const data = await this.guidesService.update(screenId, body);
    return { data, message: 'Cap nhat guide thanh cong' };
  }
}
