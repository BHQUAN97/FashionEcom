import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ShippingService } from './shipping.service';
import { ShippingIncidentService } from './shipping-incident.service';
import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { OrderTimelineEntity } from './entities/order-timeline.entity';
import { ShippingConfigEntity } from './entities/shipping-config.entity';
import { ShippingIncidentEntity } from './entities/shipping-incident.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity, OrderItemEntity, OrderTimelineEntity,
      ShippingConfigEntity, ShippingIncidentEntity,
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, ShippingService, ShippingIncidentService],
  exports: [OrdersService, ShippingService, ShippingIncidentService],
})
export class OrdersModule {}
