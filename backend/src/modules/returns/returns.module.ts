import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReturnsController, AdminReturnsController } from './returns.controller';
import { ReturnsService } from './returns.service';
import { ReturnRequestEntity } from './entities/return-request.entity';
import { ReturnRequestItemEntity } from './entities/return-request-item.entity';
import { ReturnRequestMediaEntity } from './entities/return-request-media.entity';
import { OrderEntity } from '../orders/entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ReturnRequestEntity,
      ReturnRequestItemEntity,
      ReturnRequestMediaEntity,
      OrderEntity,
    ]),
  ],
  controllers: [ReturnsController, AdminReturnsController],
  providers: [ReturnsService],
  exports: [ReturnsService],
})
export class ReturnsModule {}
