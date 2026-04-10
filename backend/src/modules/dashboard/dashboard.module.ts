import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { OrderEntity } from '../orders/entities/order.entity';
import { CustomerEntity } from '../customers/entities/customer.entity';
import { InventoryLevelEntity } from '../inventory/entities/inventory-level.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, CustomerEntity, InventoryLevelEntity]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
