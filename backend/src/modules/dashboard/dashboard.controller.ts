import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/roles.constant';

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  async getKpis() {
    const data = await this.dashboardService.getKpis();
    return { data };
  }

  @Get('charts/revenue')
  async getRevenueChart(@Query('range') range?: string) {
    const days = range === '90d' ? 90 : range === '30d' ? 30 : 7;
    const data = await this.dashboardService.getRevenueChart(days);
    return { data };
  }

  @Get('charts/orders-by-status')
  async getOrdersByStatus() {
    const data = await this.dashboardService.getOrdersByStatus();
    return { data };
  }

  @Get('charts/payment-methods')
  async getPaymentMethods(@Query('range') range?: string) {
    const days = range === '90d' ? 90 : 30;
    const data = await this.dashboardService.getPaymentMethods(days);
    return { data };
  }

  @Get('charts/top-products')
  async getTopProducts(
    @Query('range') range?: string,
    @Query('limit') limit?: string,
  ) {
    const days = range === '90d' ? 90 : 30;
    const topN = limit ? parseInt(limit) : 10;
    const data = await this.dashboardService.getTopProducts(days, topN);
    return { data };
  }
}
