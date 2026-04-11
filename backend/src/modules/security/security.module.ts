import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityController } from './security.controller';
import { SecurityService } from './security.service';
import { AccessLogEntity, PasswordHistoryEntity } from './entities/access-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AccessLogEntity, PasswordHistoryEntity])],
  controllers: [SecurityController],
  providers: [SecurityService],
  exports: [SecurityService],
})
export class SecurityModule {}
