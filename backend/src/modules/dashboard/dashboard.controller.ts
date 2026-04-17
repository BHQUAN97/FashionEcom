import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AdminNotificationService } from '../notifications/admin-notification.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/constants/roles.constant';

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly adminNotifService: AdminNotificationService,
  ) {}

  @Get('kpis')
  async getKpis() {
    const data = await this.dashboardService.getKpis();
    return { data, message: 'OK' };
  }

  @Get('charts/revenue')
  async getRevenueChart(@Query('range') range?: string) {
    const days = range === '365d' ? 365 : range === '90d' ? 90 : range === '30d' ? 30 : 7;
    const data = await this.dashboardService.getRevenueChart(days);
    return { data, message: 'OK' };
  }

  @Get('charts/orders-by-status')
  async getOrdersByStatus() {
    const data = await this.dashboardService.getOrdersByStatus();
    return { data, message: 'OK' };
  }

  @Get('charts/payment-methods')
  async getPaymentMethods(@Query('range') range?: string) {
    const days = range === '90d' ? 90 : 30;
    const data = await this.dashboardService.getPaymentMethods(days);
    return { data, message: 'OK' };
  }

  @Get('charts/top-products')
  async getTopProducts(
    @Query('range') range?: string,
    @Query('limit') limit?: string,
  ) {
    const days = range === '90d' ? 90 : 30;
    const topN = limit ? Math.min(Math.max(parseInt(limit) || 10, 1), 50) : 10;
    const data = await this.dashboardService.getTopProducts(days, topN);
    return { data, message: 'OK' };
  }

  /**
   * Phase 3: Top 10 danh muc ban chay
   */
  @Get('charts/top-categories')
  async getTopCategories(
    @Query('range') range?: string,
    @Query('limit') limit?: string,
  ) {
    const days = range === '90d' ? 90 : 30;
    const topN = limit ? Math.min(Math.max(parseInt(limit) || 10, 1), 50) : 10;
    const data = await this.dashboardService.getTopCategories(days, topN);
    return { data, message: 'OK' };
  }

  /**
   * Phase 3: Heatmap don hang — 24h x 7 ngay
   */
  @Get('charts/order-heatmap')
  async getOrderHeatmap(@Query('range') range?: string) {
    const days = range === '90d' ? 90 : 30;
    const data = await this.dashboardService.getOrderHeatmap(days);
    return { data, message: 'OK' };
  }

  /**
   * Phase 3: Khach hang moi theo ngay
   */
  @Get('charts/new-customers')
  async getNewCustomersChart(@Query('range') range?: string) {
    const days = range === '90d' ? 90 : 30;
    const data = await this.dashboardService.getNewCustomersChart(days);
    return { data, message: 'OK' };
  }

  /**
   * Tong quan viec can xu ly — hien tren dashboard
   * Don cho xac nhan, TT cho duyet, su co van chuyen, giao that bai
   */
  @Get('pending-summary')
  async getPendingSummary() {
    const data = await this.adminNotifService.getPendingCounts();
    return { data, message: 'OK' };
  }
}
