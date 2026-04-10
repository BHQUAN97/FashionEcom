import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { CustomerEntity } from './entities/customer.entity';
import { CustomerAddressEntity } from './entities/customer-address.entity';
import { OrderEntity } from '../orders/entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerEntity, CustomerAddressEntity, OrderEntity]),
  ],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports: [CustomersService],
})
export class CustomersModule {}
