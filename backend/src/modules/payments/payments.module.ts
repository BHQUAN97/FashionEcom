import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController, AdminPaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentEntity } from './entities/payment.entity';
import { OrderEntity } from '../orders/entities/order.entity';
import { DiscountUsageEntity } from '../promotions/entities/discount-usage.entity';
import { DiscountCodeEntity } from '../promotions/entities/discount-code.entity';
import { PaymentMethodConfigEntity } from './entities/payment-method-config.entity';
import { PaymentGatewayFactory } from './gateways/payment-gateway.factory';
import { MoMoGateway } from './gateways/momo.gateway';
import { VNPayGateway } from './gateways/vnpay.gateway';
import { ZaloPayGateway } from './gateways/zalopay.gateway';
import { PayooGateway } from './gateways/payoo.gateway';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentEntity, PaymentMethodConfigEntity, OrderEntity, DiscountUsageEntity, DiscountCodeEntity]),
    NotificationsModule,
  ],
  controllers: [PaymentsController, AdminPaymentsController],
  providers: [
    PaymentsService,
    PaymentGatewayFactory,
    MoMoGateway,
    VNPayGateway,
    ZaloPayGateway,
    PayooGateway,
  ],
  exports: [PaymentsService, PaymentGatewayFactory],
})
export class PaymentsModule {}
