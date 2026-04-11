import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoyaltyController, AdminLoyaltyController } from './loyalty.controller';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyConfigEntity } from './entities/loyalty-config.entity';
import { LoyaltyTransactionEntity } from './entities/loyalty-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LoyaltyConfigEntity, LoyaltyTransactionEntity])],
  controllers: [LoyaltyController, AdminLoyaltyController],
  providers: [LoyaltyService],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
