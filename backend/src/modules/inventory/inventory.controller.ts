import {
  Controller, Get, Post, Put,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
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
