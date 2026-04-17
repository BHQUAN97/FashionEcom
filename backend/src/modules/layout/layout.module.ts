import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LayoutAdminController, LayoutPublicController } from './layout.controller';
import { LayoutService } from './layout.service';
import { LayoutSectionEntity } from './entities/layout-section.entity';
import { BannerEntity } from './entities/banner.entity';
import { MenuEntity } from './entities/menu.entity';
import { MenuItemEntity } from './entities/menu-item.entity';
import { ThemeConfigEntity } from './entities/theme-config.entity';
import { EmailTemplateEntity } from './entities/email-template.entity';
import { PageEntity } from './entities/page.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LayoutSectionEntity,
      BannerEntity,
      MenuEntity,
      MenuItemEntity,
      ThemeConfigEntity,
      EmailTemplateEntity,
      PageEntity,
    ]),
  ],
  controllers: [LayoutAdminController, LayoutPublicController],
  providers: [LayoutService],
  exports: [LayoutService],
})
export class LayoutModule {}
