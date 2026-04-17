import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { PromotionsService } from './promotions.service';
import { SaleCampaignService } from './sale-campaign.service';
import { CreateDiscountDto, UpdateDiscountDto, ApplyDiscountDto, DiscountQueryDto } from './dto/discount.dto';
import { CreateFlashSaleDto, UpdateFlashSaleDto, FlashSaleQueryDto } from './dto/flash-sale.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/constants/roles.constant';

// ==================== Admin Promotions API ====================

@Controller('admin/promotions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
export class PromotionsAdminController {
  constructor(private readonly promotionsService: PromotionsService) {}

  // --- Discount Codes ---

  @Get('discounts')
  async getDiscounts(@Query() query: DiscountQueryDto) {
    return this.promotionsService.getDiscounts(query);
  }

  @Get('discounts/:id')
  async getDiscount(@Param('id') id: string) {
    const data = await this.promotionsService.getDiscount(id);
    return { data, message: 'OK' };
  }

  @Post('discounts')
  async createDiscount(@Body() dto: CreateDiscountDto) {
    const data = await this.promotionsService.createDiscount(dto);
    return { data, message: 'Tao ma giam gia thanh cong' };
  }

  @Put('discounts/:id')
  async updateDiscount(@Param('id') id: string, @Body() dto: UpdateDiscountDto) {
    const data = await this.promotionsService.updateDiscount(id, dto);
    return { data, message: 'Cap nhat ma giam gia thanh cong' };
  }

  @Delete('discounts/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async deleteDiscount(@Param('id') id: string) {
    await this.promotionsService.deleteDiscount(id);
    return { data: null, message: 'Xoa ma giam gia thanh cong' };
  }

  // --- Flash Sales ---

  @Get('flash-sales')
  async getFlashSales(@Query() query: FlashSaleQueryDto) {
    return this.promotionsService.getFlashSales(query);
  }

  @Get('flash-sales/:id')
  async getFlashSale(@Param('id') id: string) {
    const data = await this.promotionsService.getFlashSale(id);
    return { data, message: 'OK' };
  }

  @Post('flash-sales')
  async createFlashSale(@Body() dto: CreateFlashSaleDto) {
    const data = await this.promotionsService.createFlashSale(dto);
    return { data, message: 'Tao flash sale thanh cong' };
  }

  @Put('flash-sales/:id')
  async updateFlashSale(@Param('id') id: string, @Body() dto: UpdateFlashSaleDto) {
    const data = await this.promotionsService.updateFlashSale(id, dto);
    return { data, message: 'Cap nhat flash sale thanh cong' };
  }

  @Delete('flash-sales/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async deleteFlashSale(@Param('id') id: string) {
    await this.promotionsService.deleteFlashSale(id);
    return { data: null, message: 'Xoa flash sale thanh cong' };
  }
}

// ==================== Public Promotions API (Storefront) ====================

@Controller('promotions')
export class PromotionsPublicController {
  constructor(
    private readonly promotionsService: PromotionsService,
    private readonly saleCampaignService: SaleCampaignService,
  ) {}

  /**
   * Storefront: apply discount code vao cart
   * Rate limit: 10 req/min — chong brute-force coupon code
   */
  @Post('discounts/apply')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async applyDiscount(@Body() dto: ApplyDiscountDto) {
    const data = await this.promotionsService.applyDiscount(dto);
    return { data, message: 'OK' };
  }

  /**
   * Storefront: lay flash sale dang active
   */
  @Get('flash-sales/active')
  async getActiveFlashSale() {
    const data = await this.promotionsService.getActiveFlashSale();
    return { data, message: 'OK' };
  }

  /**
   * Storefront: lay gia sale tot nhat cho 1 variant
   */
  @Get('sale-price/:variantId')
  async getSalePrice(@Param('variantId') variantId: string) {
    const data = await this.saleCampaignService.getBestSalePrice(variantId);
    return { data, message: 'OK' };
  }

  /**
   * Storefront: batch lay gia sale cho nhieu variant
   * Query: ?ids=uuid1,uuid2,uuid3
   */
  @Get('sale-prices')
  async getSalePrices(@Query('ids') ids: string) {
    const variantIds = (ids || '').split(',').filter(Boolean);
    if (variantIds.length === 0) return { data: {}, message: 'OK' };

    const priceMap = await this.saleCampaignService.getBestSalePricesBatch(variantIds);
    const data: Record<string, unknown> = {};
    priceMap.forEach((val: unknown, key: string) => { data[key] = val; });
    return { data, message: 'OK' };
  }
}
