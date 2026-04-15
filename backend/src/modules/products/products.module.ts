import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './products.controller';
import { ProductsPublicController } from './products-public.controller';
import { ProductsService } from './products.service';
import { ProductEntity } from './entities/product.entity';
import { ProductVariantEntity } from './entities/product-variant.entity';
import { ProductMediaEntity } from './entities/product-media.entity';
import { ColorEntity } from '../attributes/entities/color.entity';
import { SizeEntity } from '../attributes/entities/size.entity';
import { PromotionsModule } from '../promotions/promotions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity, ProductVariantEntity, ProductMediaEntity,
      ColorEntity, SizeEntity,
    ]),
    PromotionsModule,
  ],
  controllers: [ProductsController, ProductsPublicController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
