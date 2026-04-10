import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { BulkEditProductDto, BulkEditVariantDto } from './dto/bulk-edit.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/roles.constant';

@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.CONTENT_EDITOR)
  async findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.CONTENT_EDITOR)
  async findOne(@Param('id') id: string) {
    const data = await this.productsService.findOne(id);
    return { data };
  }

  @Post()
  async create(@Body() dto: CreateProductDto) {
    const data = await this.productsService.create(dto);
    return { data, message: 'Tao san pham thanh cong' };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const data = await this.productsService.update(id, dto);
    return { data, message: 'Cap nhat san pham thanh cong' };
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    await this.productsService.remove(id);
    return { data: null, message: 'Xoa san pham thanh cong' };
  }

  @Post(':id/duplicate')
  async duplicate(@Param('id') id: string) {
    const data = await this.productsService.duplicate(id);
    return { data, message: 'Nhan ban san pham thanh cong' };
  }

  @Put('bulk/edit')
  async bulkEdit(@Body() dto: BulkEditProductDto) {
    const data = await this.productsService.bulkEdit(dto);
    return { data, message: 'Cap nhat hang loat thanh cong' };
  }

  // --- Variant endpoints ---

  @Get(':id/variants')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.CONTENT_EDITOR)
  async getVariants(@Param('id') productId: string) {
    const data = await this.productsService.getVariants(productId);
    return { data };
  }

  @Post(':id/variants')
  async createVariant(@Param('id') productId: string, @Body() body: any) {
    const data = await this.productsService.createVariant(productId, body);
    return { data, message: 'Tao variant thanh cong' };
  }

  @Put('variants/:variantId')
  async updateVariant(@Param('variantId') variantId: string, @Body() body: any) {
    const data = await this.productsService.updateVariant(variantId, body);
    return { data, message: 'Cap nhat variant thanh cong' };
  }

  @Delete('variants/:variantId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async removeVariant(@Param('variantId') variantId: string) {
    await this.productsService.removeVariant(variantId);
    return { data: null, message: 'Xoa variant thanh cong' };
  }

  @Put('variants/bulk/edit')
  async bulkEditVariants(@Body() dto: BulkEditVariantDto) {
    const data = await this.productsService.bulkEditVariants(dto);
    return { data, message: 'Cap nhat variants hang loat thanh cong' };
  }
}
