import {
  Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto, CreatePurchaseOrderDto, ReceiveGoodsDto, SupplierQueryDto } from './dto/supplier.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserRole } from '@/common/constants/roles.constant';

@Controller('admin/suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  async findAll(@Query() query: SupplierQueryDto) {
    return this.suppliersService.getSuppliers(query);
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async create(@Body() dto: CreateSupplierDto) {
    const data = await this.suppliersService.createSupplier(dto);
    return { data, message: 'Tao NCC thanh cong' };
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async update(@Param('id') id: string, @Body() dto: Partial<CreateSupplierDto>) {
    const data = await this.suppliersService.updateSupplier(id, dto);
    return { data, message: 'Cap nhat NCC thanh cong' };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.suppliersService.getSupplier(id);
    return { data, message: 'OK' };
  }
}

@Controller('admin/purchase-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE)
export class PurchaseOrdersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number, @Query('status') status?: number) {
    return this.suppliersService.getPOs(page, limit, status);
  }

  @Post()
  async create(@Body() dto: CreatePurchaseOrderDto, @CurrentUser('sub') userId: string) {
    const data = await this.suppliersService.createPO(dto, userId);
    return { data, message: 'Tao PO thanh cong' };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.suppliersService.getPO(id);
    return { data, message: 'OK' };
  }

  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: number,
    @CurrentUser('sub') userId: string,
  ) {
    const data = await this.suppliersService.updatePOStatus(id, status, userId);
    return { data, message: 'Cap nhat trang thai PO thanh cong' };
  }

  @Post(':id/receive')
  async receive(
    @Param('id') id: string,
    @Body() dto: ReceiveGoodsDto,
    @CurrentUser('sub') userId: string,
  ) {
    const data = await this.suppliersService.receiveGoods(id, dto, userId);
    return { data, message: 'Nhap kho thanh cong' };
  }
}
