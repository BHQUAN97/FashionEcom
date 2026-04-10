import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { FunnelReportService } from '../services/funnel-report.service';
import { FunnelQueryDto } from '../dto/revenue-query.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/constants/roles.constant';

@Controller('reports/funnel')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
export class FunnelReportController {
  constructor(private readonly funnelService: FunnelReportService) {}

  @Get()
  async getFunnel(@Query() query: FunnelQueryDto) {
    const data = await this.funnelService.getFunnel(query);
    return { success: true, data };
  }
}
