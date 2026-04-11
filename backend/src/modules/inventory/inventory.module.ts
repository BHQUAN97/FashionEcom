import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController, WarehouseTransferController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { WarehouseTransferService } from './warehouse-transfer.service';
import { InventoryLevelEntity } from './entities/inventory-level.entity';
import { InventoryLogEntity } from './entities/inventory-log.entity';
import { WarehouseEntity } from './entities/warehouse.entity';
import { WarehouseTransferEntity } from './entities/warehouse-transfer.entity';
import { WarehouseTransferItemEntity } from './entities/warehouse-transfer-item.entity';
import { ProductVariantEntity } from '../products/entities/product-variant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventoryLevelEntity,
      InventoryLogEntity,
      WarehouseEntity,
      WarehouseTransferEntity,
      WarehouseTransferItemEntity,
      ProductVariantEntity,
    ]),
  ],
  controllers: [InventoryController, WarehouseTransferController],
  providers: [InventoryService, WarehouseTransferService],
  exports: [InventoryService, WarehouseTransferService],
})
export class InventoryModule {}
