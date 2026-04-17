import {
  Controller, Get, Put, Post, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ShippingService } from './shipping.service';
import { ShippingIncidentService } from './shipping-incident.service';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderStatusDto } from './dto/update-status.dto';
import { BulkOrderActionDto, BulkShippingStatusDto, QuickOrderActionDto } from './dto/bulk-action.dto';
import { UpsertShippingConfigDto, UpdateOrderShippingDto } from './dto/shipping.dto';
import { UpdateShippingStatusDto } from './dto/update-shipping-status.dto';
import { CreateShippingIncidentDto, UpdateShippingIncidentDto, ShippingIncidentQueryDto } from './dto/shipping-incident.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserRole } from '@/common/constants/roles.constant';

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.WAREHOUSE)
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly shippingService: ShippingService,
    private readonly incidentService: ShippingIncidentService,
  ) {}

  @Get()
  async findAll(@Query() query: OrderQueryDto) {
    return this.ordersService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.ordersService.findOne(id);
    return { data, message: 'OK' };
  }

  @Get(':id/timeline')
  async getTimeline(@Param('id') id: string) {
    const data = await this.ordersService.getTimeline(id);
    return { data, message: 'OK' };
  }

  @Put(':id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser('email') actor: string,
  ) {
    const data = await this.ordersService.updateStatus(id, dto, actor);
    return { data, message: 'Cap nhat trang thai thanh cong' };
  }

  /** Bulk action trang thai don hang: confirm, packing, shipping, complete, cancel */
  @Post('bulk')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async bulkAction(
    @Body() dto: BulkOrderActionDto,
    @CurrentUser('email') actor: string,
  ) {
    const data = await this.ordersService.bulkAction(dto, actor);
    return { data, message: 'Xu ly hang loat thanh cong' };
  }

  /** Bulk update trang thai van chuyen — chon nhieu don, doi status 1 lan */
  @Post('bulk-shipping-status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async bulkShippingStatus(
    @Body() dto: BulkShippingStatusDto,
    @CurrentUser('email') actor: string,
  ) {
    const data = await this.ordersService.bulkShippingStatus(dto, actor);
    return { data, message: 'Cap nhat trang thai van chuyen hang loat thanh cong' };
  }

  // --- Quick + Single status ---

  /**
   * Quick action — cap nhat nhanh bang action name
   * Order: confirm, pack, ship, complete, cancel
   * Shipping: pickup, picked, in_transit, delivering, delivered, failed, re_deliver, return, lost, damaged
   */
  @Put(':id/quick-action')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  async quickAction(
    @Param('id') id: string,
    @Body() dto: QuickOrderActionDto,
    @CurrentUser('email') actor: string,
  ) {
    const data = await this.ordersService.quickAction(id, dto, actor);
    return { data, message: 'OK' };
  }

  /** Cap nhat trang thai van chuyen (bang status number) */
  @Put(':id/shipping-status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  async updateShippingStatus(
    @Param('id') id: string,
    @Body() dto: UpdateShippingStatusDto,
    @CurrentUser('email') actor: string,
  ) {
    const data = await this.ordersService.updateShippingStatus(id, dto, actor);
    return { data, message: 'Cap nhat trang thai van chuyen thanh cong' };
  }

  // --- Shipping fee per order ---

  /** Edit phi ship cho 1 don hang */
  @Put(':id/shipping')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async updateShipping(
    @Param('id') id: string,
    @Body() dto: UpdateOrderShippingDto,
    @CurrentUser('email') actor: string,
  ) {
    const data = await this.ordersService.updateShipping(id, dto, actor);
    return { data, message: 'Cap nhat phi ship thanh cong' };
  }

  // --- Shipping config ---

  @Get('shipping-config/all')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async getShippingConfigs() {
    const data = await this.shippingService.findAll();
    return { data, message: 'OK' };
  }

  @Post('shipping-config')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async upsertShippingConfig(@Body() dto: UpsertShippingConfigDto) {
    const data = await this.shippingService.upsert(dto);
    return { data, message: 'Luu cau hinh van chuyen thanh cong' };
  }

  @Delete('shipping-config/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async deleteShippingConfig(@Param('id') id: string) {
    await this.shippingService.remove(id);
    return { data: null, message: 'Xoa cau hinh van chuyen thanh cong' };
  }

  // --- Shipping reports ---

  /** Bao cao free ship tong quan + breakdown theo DVVC */
  @Get('reports/free-ship')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async freeShipReport(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const data = await this.shippingService.getFreeShipReport(from, to);
    return { data, message: 'OK' };
  }

  /** Loi nhuan chi tiet per don hang — bao gom ship profit */
  @Get('reports/order-profit')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async orderProfitReport(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const data = await this.shippingService.getOrderProfitReport(from, to, page || 1, limit || 20);
    return { data, message: 'OK' };
  }

  // --- Shipping Incidents ---

  /** Danh sach su co van chuyen + stats */
  @Get('shipping-incidents')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  async getIncidents(@Query() query: ShippingIncidentQueryDto) {
    return this.incidentService.findAll(query);
  }

  /** Chi tiet su co */
  @Get('shipping-incidents/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  async getIncident(@Param('id') id: string) {
    const data = await this.incidentService.findOne(id);
    return { data, message: 'OK' };
  }

  /** Su co theo don hang */
  @Get(':id/incidents')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  async getOrderIncidents(@Param('id') orderId: string) {
    const data = await this.incidentService.findByOrder(orderId);
    return { data, message: 'OK' };
  }

  /** Tao su co moi */
  @Post('shipping-incidents')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async createIncident(
    @Body() dto: CreateShippingIncidentDto,
    @CurrentUser('userId') userId: string,
  ) {
    const data = await this.incidentService.create(dto, userId);
    return { data, message: 'Tao su co thanh cong' };
  }

  /** Cap nhat su co */
  @Put('shipping-incidents/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async updateIncident(
    @Param('id') id: string,
    @Body() dto: UpdateShippingIncidentDto,
    @CurrentUser('userId') userId: string,
  ) {
    const data = await this.incidentService.update(id, dto, userId);
    return { data, message: 'Cap nhat su co thanh cong' };
  }

  /** Bao cao tong quan su co van chuyen */
  @Get('reports/shipping-incidents')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async incidentReport(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const data = await this.incidentService.getIncidentReport(from, to);
    return { data, message: 'OK' };
  }
}
