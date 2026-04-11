import {
  Controller, Get, Post, Put, Patch,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { WarehouseTransferService } from './warehouse-transfer.service';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { ImportInventoryDto } from './dto/import-inventory.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/roles.constant';

@Controller('admin/inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  async findAll(@Query() query: InventoryQueryDto) {
    return this.inventoryService.findAll(query);
  }

  @Get('warehouses')
  async getWarehouses() {
    const data = await this.inventoryService.getWarehouses();
    return { data };
  }

  @Get('logs/:variantId')
  async getLogs(@Param('variantId') variantId: string) {
    const data = await this.inventoryService.getLogs(variantId);
    return { data };
  }

  @Post('adjust')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.WAREHOUSE)
  async adjust(
    @Body() dto: AdjustInventoryDto,
    @CurrentUser('userId') userId: string,
  ) {
    const data = await this.inventoryService.adjust(dto, userId);
    return { data, message: 'Dieu chinh ton kho thanh cong' };
  }

  @Post('import')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.WAREHOUSE)
  async bulkImport(
    @Body() dto: ImportInventoryDto,
    @CurrentUser('userId') userId: string,
  ) {
    const data = await this.inventoryService.bulkImport(dto, userId);
    return { data, message: 'Nhap kho thanh cong' };
  }
}

/** Warehouse Transfer endpoints */
@Controller('admin/warehouse-transfers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE)
export class WarehouseTransferController {
  constructor(private readonly transferService: WarehouseTransferService) {}

  @Get()
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.transferService.findAll(page, limit);
  }

  @Post()
  async create(
    @Body() body: {
      fromWarehouseId: string;
      toWarehouseId: string;
      reason?: string;
      items: { variantId: string; qty: number }[];
    },
    @CurrentUser('sub') userId: string,
  ) {
    const data = await this.transferService.create(body, userId);
    return { data, message: 'Tao phieu dieu chuyen thanh cong' };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.transferService.findOne(id);
    return { data };
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: number,
    @CurrentUser('sub') userId: string,
  ) {
    const data = await this.transferService.updateStatus(id, status, userId);
    return { data, message: 'Cap nhat trang thai dieu chuyen thanh cong' };
  }
}
