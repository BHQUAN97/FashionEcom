import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GuidesController } from './guides.controller';
import { GuidesService } from './guides.service';
import { GuideTourEntity, GuideTourCompletionEntity } from './entities/guide-tour.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GuideTourEntity, GuideTourCompletionEntity])],
  controllers: [GuidesController],
  providers: [GuidesService],
  exports: [GuidesService],
})
export class GuidesModule {}
