import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuppliersController, PurchaseOrdersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';
import { SupplierEntity } from './entities/supplier.entity';
import { PurchaseOrderEntity } from './entities/purchase-order.entity';
import { PurchaseOrderItemEntity } from './entities/purchase-order-item.entity';
import { GoodsReceiptEntity, GoodsReceiptItemEntity } from './entities/goods-receipt.entity';
import { InventoryLevelEntity } from '../inventory/entities/inventory-level.entity';
import { InventoryLogEntity } from '../inventory/entities/inventory-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SupplierEntity,
      PurchaseOrderEntity,
      PurchaseOrderItemEntity,
      GoodsReceiptEntity,
      GoodsReceiptItemEntity,
      InventoryLevelEntity,
      InventoryLogEntity,
    ]),
  ],
  controllers: [SuppliersController, PurchaseOrdersController],
  providers: [SuppliersService],
  exports: [SuppliersService],
})
export class SuppliersModule {}
