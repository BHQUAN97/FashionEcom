import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { BulkEditProductDto, BulkEditVariantDto } from './dto/bulk-edit.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { GenerateVariantsDto } from './dto/generate-variants.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/constants/roles.constant';

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
    return { data, message: 'OK' };
  }

  @Post()
  async create(@Body() dto: CreateProductDto) {
    const data = await this.productsService.create(dto);
    return { data, message: 'Tạo sản phẩm thành công' };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const data = await this.productsService.update(id, dto);
    return { data, message: 'Cập nhật sản phẩm thành công' };
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    await this.productsService.remove(id);
    return { data: null, message: 'Xóa sản phẩm thành công' };
  }

  @Post(':id/duplicate')
  async duplicate(@Param('id') id: string) {
    const data = await this.productsService.duplicate(id);
    return { data, message: 'Nhân bản sản phẩm thành công' };
  }

  @Put('bulk/edit')
  async bulkEdit(@Body() dto: BulkEditProductDto) {
    const data = await this.productsService.bulkEdit(dto);
    return { data, message: 'Cập nhật hàng loạt thành công' };
  }

  // --- Variant endpoints ---

  @Get(':id/variants')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.CONTENT_EDITOR)
  async getVariants(@Param('id') productId: string) {
    const data = await this.productsService.getVariants(productId);
    return { data, message: 'OK' };
  }

  @Post(':id/variants')
  async createVariant(@Param('id') productId: string, @Body() dto: CreateVariantDto) {
    const data = await this.productsService.createVariant(productId, dto);
    return { data, message: 'Tạo variant thành công' };
  }

  /** Generate variant matrix tu colorIds x sizeIds */
  @Post(':id/variants/generate')
  async generateVariants(@Param('id') productId: string, @Body() dto: GenerateVariantsDto) {
    const data = await this.productsService.generateVariantMatrix(productId, dto);
    return { data, message: 'Tạo variant matrix thành công' };
  }

  @Put('variants/:variantId')
  async updateVariant(@Param('variantId') variantId: string, @Body() dto: UpdateVariantDto) {
    const data = await this.productsService.updateVariant(variantId, dto);
    return { data, message: 'Cập nhật variant thành công' };
  }

  @Delete('variants/:variantId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async removeVariant(@Param('variantId') variantId: string) {
    await this.productsService.removeVariant(variantId);
    return { data: null, message: 'Xóa variant thành công' };
  }

  @Put('variants/bulk/edit')
  async bulkEditVariants(@Body() dto: BulkEditVariantDto) {
    const data = await this.productsService.bulkEditVariants(dto);
    return { data, message: 'Cập nhật variants hàng loạt thành công' };
  }
}
