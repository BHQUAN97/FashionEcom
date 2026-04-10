import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryLevelEntity } from './entities/inventory-level.entity';
import { InventoryLogEntity } from './entities/inventory-log.entity';
import { WarehouseEntity } from './entities/warehouse.entity';
import { ProductVariantEntity } from '../products/entities/product-variant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventoryLevelEntity,
      InventoryLogEntity,
      WarehouseEntity,
      ProductVariantEntity,
    ]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
