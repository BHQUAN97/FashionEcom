import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionsAdminController, PromotionsPublicController } from './promotions.controller';
import { PromotionsService } from './promotions.service';
import { DiscountCodeEntity } from './entities/discount-code.entity';
import { DiscountUsageEntity } from './entities/discount-usage.entity';
import { FlashSaleEntity } from './entities/flash-sale.entity';
import { FlashSaleItemEntity } from './entities/flash-sale-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DiscountCodeEntity,
      DiscountUsageEntity,
      FlashSaleEntity,
      FlashSaleItemEntity,
    ]),
  ],
  controllers: [PromotionsAdminController, PromotionsPublicController],
  providers: [PromotionsService],
  exports: [PromotionsService],
})
export class PromotionsModule {}
