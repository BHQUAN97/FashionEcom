import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionsAdminController, PromotionsPublicController } from './promotions.controller';
import { SaleCampaignController } from './sale-campaign.controller';
import { PromotionsService } from './promotions.service';
import { SaleCampaignService } from './sale-campaign.service';
import { DiscountCodeEntity } from './entities/discount-code.entity';
import { DiscountUsageEntity } from './entities/discount-usage.entity';
import { FlashSaleEntity } from './entities/flash-sale.entity';
import { FlashSaleItemEntity } from './entities/flash-sale-item.entity';
import { SaleCampaignEntity } from './entities/sale-campaign.entity';
import { SaleCampaignVariantEntity } from './entities/sale-campaign-variant.entity';
import { ProductVariantEntity } from '../products/entities/product-variant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DiscountCodeEntity,
      DiscountUsageEntity,
      FlashSaleEntity,
      FlashSaleItemEntity,
      SaleCampaignEntity,
      SaleCampaignVariantEntity,
      ProductVariantEntity,
    ]),
  ],
  controllers: [PromotionsAdminController, PromotionsPublicController, SaleCampaignController],
  providers: [PromotionsService, SaleCampaignService],
  exports: [PromotionsService, SaleCampaignService],
})
export class PromotionsModule {}
