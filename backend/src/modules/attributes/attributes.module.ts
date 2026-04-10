import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColorsController } from './colors.controller';
import { SizesController } from './sizes.controller';
import { AttributesService } from './attributes.service';
import { ColorEntity } from './entities/color.entity';
import { SizeGroupEntity } from './entities/size-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ColorEntity, SizeGroupEntity])],
  controllers: [ColorsController, SizesController],
  providers: [AttributesService],
  exports: [AttributesService],
})
export class AttributesModule {}
