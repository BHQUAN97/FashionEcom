import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { LayoutService } from './layout.service';
import { UpdateLayoutSectionsDto, ScheduleLayoutDto } from './dto/update-layout-sections.dto';
import { CreateBannerDto, UpdateBannerDto, ReorderBannersDto } from './dto/banner.dto';
import { UpdateMenuDto } from './dto/menu.dto';
import { UpdateThemeConfigDto } from './dto/theme-config.dto';
import { UpdateEmailTemplateDto } from './dto/email-template.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/roles.constant';

// ==================== Admin Layout API ====================

@Controller('admin/layout')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.CONTENT_EDITOR)
export class LayoutAdminController {
  constructor(private readonly layoutService: LayoutService) {}

  // --- Sections ---

  @Get('sections')
  async getSections(@Query('page') page: string = 'homepage') {
    const data = await this.layoutService.getSections(page);
    return { data };
  }

  @Put('sections/draft')
  async saveDraft(@Body() dto: UpdateLayoutSectionsDto) {
    const data = await this.layoutService.saveDraft(dto);
    return { data, message: 'Luu draft thanh cong' };
  }

  @Post('sections/publish')
  async publishLayout(@Body('page') page: string = 'homepage') {
    const data = await this.layoutService.publishLayout(page);
    return { data, message: 'Publish layout thanh cong' };
  }

  @Post('sections/schedule')
  async scheduleLayout(@Body() dto: ScheduleLayoutDto) {
    const data = await this.layoutService.scheduleLayout(dto);
    return { data, message: 'Schedule layout thanh cong' };
  }

  @Post('sections/reset')
  async resetLayout(@Body('page') page: string = 'homepage') {
    const data = await this.layoutService.resetLayout(page);
    return { data, message: 'Reset layout thanh cong' };
  }

  // --- Banners ---

  @Get('banners')
  async getBanners() {
    const data = await this.layoutService.getBanners();
    return { data };
  }

  @Get('banners/:id')
  async getBanner(@Param('id') id: string) {
    const data = await this.layoutService.getBanner(id);
    return { data };
  }

  @Post('banners')
  async createBanner(@Body() dto: CreateBannerDto) {
    const data = await this.layoutService.createBanner(dto);
    return { data, message: 'Tao banner thanh cong' };
  }

  @Put('banners/:id')
  async updateBanner(@Param('id') id: string, @Body() dto: UpdateBannerDto) {
    const data = await this.layoutService.updateBanner(id, dto);
    return { data, message: 'Cap nhat banner thanh cong' };
  }

  @Delete('banners/:id')
  async deleteBanner(@Param('id') id: string) {
    await this.layoutService.deleteBanner(id);
    return { data: null, message: 'Xoa banner thanh cong' };
  }

  @Put('banners/reorder')
  async reorderBanners(@Body() dto: ReorderBannersDto) {
    await this.layoutService.reorderBanners(dto.ids);
    return { data: null, message: 'Sap xep banner thanh cong' };
  }

  // --- Menus ---

  @Get('menus')
  async getMenus() {
    const data = await this.layoutService.getMenus();
    return { data };
  }

  @Get('menus/:type/items')
  async getMenuItems(@Param('type') type: string) {
    const data = await this.layoutService.getMenuItems(type);
    return { data };
  }

  @Put('menus/:type')
  async updateMenu(@Param('type') type: string, @Body() dto: UpdateMenuDto) {
    const data = await this.layoutService.updateMenu(type, dto);
    return { data, message: 'Cap nhat menu thanh cong' };
  }

  // --- Theme Config ---

  @Get('theme')
  async getThemeConfig() {
    const data = await this.layoutService.getThemeConfig();
    return { data };
  }

  @Put('theme')
  async updateThemeConfig(@Body() dto: UpdateThemeConfigDto) {
    const data = await this.layoutService.updateThemeConfig(dto);
    return { data, message: 'Cap nhat theme thanh cong' };
  }

  // --- Email Templates ---

  @Get('email-templates')
  async getEmailTemplates() {
    const data = await this.layoutService.getEmailTemplates();
    return { data };
  }

  @Get('email-templates/:key')
  async getEmailTemplate(@Param('key') key: string) {
    const data = await this.layoutService.getEmailTemplate(key);
    return { data };
  }

  @Put('email-templates/:key')
  async updateEmailTemplate(@Param('key') key: string, @Body() dto: UpdateEmailTemplateDto) {
    const data = await this.layoutService.updateEmailTemplate(key, dto);
    return { data, message: 'Cap nhat template thanh cong' };
  }
}

// ==================== Public Layout API (Storefront) ====================

@Controller('layout')
export class LayoutPublicController {
  constructor(private readonly layoutService: LayoutService) {}

  /**
   * Storefront: lay sections published cua 1 page
   */
  @Get('sections/:page')
  async getPublishedSections(@Param('page') page: string) {
    const data = await this.layoutService.getPublishedSections(page);
    return { data };
  }

  /**
   * Storefront: lay menu items theo type (header/footer/mobile)
   */
  @Get('menus/:type')
  async getMenuItems(@Param('type') type: string) {
    const data = await this.layoutService.getMenuItems(type);
    return { data };
  }

  /**
   * Storefront: lay theme config
   */
  @Get('theme')
  async getThemeConfig() {
    const data = await this.layoutService.getThemeConfig();
    return { data };
  }

  /**
   * Storefront: tracking banner click
   */
  @Post('banners/:id/click')
  async trackClick(@Param('id') id: string) {
    await this.layoutService.trackBannerClick(id);
    return { data: null };
  }

  /**
   * Storefront: tracking banner view
   */
  @Post('banners/:id/view')
  async trackView(@Param('id') id: string) {
    await this.layoutService.trackBannerView(id);
    return { data: null };
  }
}
