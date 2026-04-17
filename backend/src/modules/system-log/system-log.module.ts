import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemLogEntity } from './entities/system-log.entity';
import { SystemLogService } from './system-log.service';
import { SystemLogController } from './system-log.controller';

/**
 * Global module — SystemLogService duoc inject o bat ky dau
 * (middleware, exception filter, interceptor...)
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([SystemLogEntity])],
  controllers: [SystemLogController],
  providers: [SystemLogService],
  exports: [SystemLogService],
})
export class SystemLogModule {}
