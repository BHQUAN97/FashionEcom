import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { ProductsService } from './products.service';
import { SaleCampaignService, BestSalePrice } from '../promotions/sale-campaign.service';
import { ProductQueryDto } from './dto/product-query.dto';
import { ValidateCartDto } from './dto/cart-validate.dto';
import { ValidateUUIDPipe } from '@/common/pipes/uuid-validation.pipe';

/**
 * Public API cho storefront — khong can auth
 * Enrich response voi best_sale_price tu campaign/flash sale
 */
@Controller('products')
export class ProductsPublicController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly saleCampaignService: SaleCampaignService,
  ) {}

  @Get()
  async findAll(@Query() query: ProductQueryDto) {
    query.status = 1;
    const result = await this.productsService.findAll(query);

    // Batch fetch sale prices cho tat ca variant cua tat ca products
    const allVariantIds: string[] = [];
    const products = result.data || [];
    for (const p of products) {
      if (p.variants?.length) {
        for (const v of p.variants) {
          allVariantIds.push(v.catProductVariantId);
        }
      }
    }

    const salePriceMap = await this.saleCampaignService.getBestSalePricesBatch(allVariantIds);

    // Enrich moi product: tim gia sale thap nhat, tinh effective_price
    for (const p of products) {
      let effectiveMin = (p as any).price_range?.min ?? 0;
      if (p.variants?.length) {
        let bestSale: BestSalePrice | null = null;
        for (const v of p.variants) {
          const sale = salePriceMap.get(v.catProductVariantId);
          if (sale && (!bestSale || sale.salePrice < bestSale.salePrice)) {
            bestSale = sale;
          }
        }
        if (bestSale) {
          (p as any).bestSalePrice = bestSale;
          effectiveMin = bestSale.salePrice;
        }
      }
      (p as any).effectivePrice = effectiveMin;
    }

    // Filter theo khoang gia (dung effective price = gia sau KM)
    let filtered = products;
    if (query.priceMin !== undefined || query.priceMax !== undefined) {
      filtered = products.filter((p: any) => {
        const ep = p.effectivePrice ?? p.price_range?.min ?? 0;
        if (query.priceMin !== undefined && ep < query.priceMin) return false;
        if (query.priceMax !== undefined && ep > query.priceMax) return false;
        return true;
      });
      // Cap nhat pagination total
      result.pagination = {
        ...result.pagination,
        total: filtered.length,
        total_pages: Math.ceil(filtered.length / (result.pagination?.limit || 20)),
      };
      result.data = filtered;
    }

    return result;
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.productsService.findBySlug(slug);
    return { data: await this.enrichProductWithSalePrices(data), message: 'OK' };
  }

  @Get(':id')
  async findOne(@Param('id', ValidateUUIDPipe) id: string) {
    const data = await this.productsService.findOne(id);
    return { data: await this.enrichProductWithSalePrices(data), message: 'OK' };
  }

  @Get(':id/variants')
  async getVariants(@Param('id', ValidateUUIDPipe) productId: string) {
    const data = await this.productsService.getVariants(productId);
    const active = data.filter((v) => v.catProductVariantStatus === 1);

    // Batch enrich voi sale price
    const variantIds = active.map((v) => v.catProductVariantId);
    const salePriceMap = await this.saleCampaignService.getBestSalePricesBatch(variantIds);
    const enriched = active.map((v) => ({
      ...v,
      bestSalePrice: salePriceMap.get(v.catProductVariantId) || null,
    }));

    return { data: enriched, message: 'OK' };
  }

  /**
   * Validate + refresh gia gio hang — luon tra gia moi nhat tu DB + sale campaign
   * FE gui danh sach variantId + qty, BE tra lai gia chinh xac
   * KHONG tin gia tu client — luon tinh tu DB
   */
  @Post('cart/validate')
  async validateCart(@Body() dto: ValidateCartDto) {
    const variantIds = dto.items.map((i) => i.variantId);

    // Batch fetch variant info + sale prices
    const variants = await this.productsService.getVariantsByIds(variantIds);
    const salePriceMap = await this.saleCampaignService.getBestSalePricesBatch(variantIds);

    const items = dto.items.map((cartItem) => {
      const variant = variants.find((v) => v.catProductVariantId === cartItem.variantId);
      if (!variant) {
        return {
          variantId: cartItem.variantId,
          valid: false,
          error: 'Variant khong ton tai',
        };
      }

      const originalPrice = Number(variant.catProductVariantPrice);
      const sale = salePriceMap.get(cartItem.variantId);
      const effectivePrice = sale ? sale.salePrice : originalPrice;

      return {
        variantId: cartItem.variantId,
        valid: true,
        sku: variant.catProductVariantSku,
        color: variant.color?.catColorName || variant.catProductVariantColor || null,
        colorHex: variant.color?.catColorHex || null,
        size: variant.size?.catSizeValue || variant.catProductVariantSize || null,
        originalPrice,
        effectivePrice,
        saleInfo: sale ? {
          discountPct: sale.discountPct,
          campaignName: sale.campaignName,
          campaignType: sale.campaignType,
        } : null,
        qty: cartItem.qty,
        lineTotal: effectivePrice * cartItem.qty,
      };
    });

    const validItems = items.filter((i) => i.valid);
    const subtotal = validItems.reduce((sum, i) => sum + (i.lineTotal || 0), 0);

    return {
      data: { items, subtotal, itemCount: validItems.length },
      message: 'OK',
    };
  }

  /**
   * Enrich product detail — batch tinh best sale price cho moi variant
   */
  private async enrichProductWithSalePrices(product: any) {
    if (!product?.variants?.length) return product;

    const variantIds = product.variants.map((v: any) => v.catProductVariantId);
    const salePriceMap = await this.saleCampaignService.getBestSalePricesBatch(variantIds);

    const enrichedVariants = product.variants.map((v: any) => ({
      ...v,
      bestSalePrice: salePriceMap.get(v.catProductVariantId) || null,
    }));

    return { ...product, variants: enrichedVariants };
  }
}
