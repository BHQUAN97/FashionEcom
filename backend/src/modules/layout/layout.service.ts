import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { LayoutSectionEntity } from './entities/layout-section.entity';
import { BannerEntity } from './entities/banner.entity';
import { MenuEntity } from './entities/menu.entity';
import { MenuItemEntity } from './entities/menu-item.entity';
import { ThemeConfigEntity } from './entities/theme-config.entity';
import { EmailTemplateEntity } from './entities/email-template.entity';
import { UpdateLayoutSectionsDto, ScheduleLayoutDto } from './dto/update-layout-sections.dto';
import { CreateBannerDto, UpdateBannerDto } from './dto/banner.dto';
import { MenuItemDto, UpdateMenuDto } from './dto/menu.dto';
import { UpdateThemeConfigDto } from './dto/theme-config.dto';
import { UpdateEmailTemplateDto } from './dto/email-template.dto';

@Injectable()
export class LayoutService {
  constructor(
    @InjectRepository(LayoutSectionEntity)
    private readonly sectionRepo: Repository<LayoutSectionEntity>,
    @InjectRepository(BannerEntity)
    private readonly bannerRepo: Repository<BannerEntity>,
    @InjectRepository(MenuEntity)
    private readonly menuRepo: Repository<MenuEntity>,
    @InjectRepository(MenuItemEntity)
    private readonly menuItemRepo: Repository<MenuItemEntity>,
    @InjectRepository(ThemeConfigEntity)
    private readonly themeConfigRepo: Repository<ThemeConfigEntity>,
    @InjectRepository(EmailTemplateEntity)
    private readonly emailTemplateRepo: Repository<EmailTemplateEntity>,
  ) {}

  // ==================== Layout Sections ====================

  /**
   * Lay tat ca sections (draft + published) cua 1 page
   */
  async getSections(page: string) {
    const sections = await this.sectionRepo.find({
      where: { cmsLayoutSectionPage: page },
      order: { cmsLayoutSectionSort: 'ASC' },
    });

    // Tach draft va published de FE compare
    const draft = sections.filter(s => s.cmsLayoutSectionVersion === 'draft');
    const published = sections.filter(s => s.cmsLayoutSectionVersion === 'published');

    return { draft, published };
  }

  /**
   * Lay sections published cho storefront render
   */
  async getPublishedSections(page: string) {
    return this.sectionRepo.find({
      where: { cmsLayoutSectionPage: page, cmsLayoutSectionVersion: 'published' },
      order: { cmsLayoutSectionSort: 'ASC' },
    });
  }

  /**
   * Luu draft sections — xoa draft cu va insert moi
   */
  async saveDraft(dto: UpdateLayoutSectionsDto) {
    // Xoa draft cu cua page nay
    await this.sectionRepo.delete({
      cmsLayoutSectionPage: dto.page,
      cmsLayoutSectionVersion: 'draft',
    });

    // Insert sections moi voi version=draft
    const entities = dto.sections.map((s, i) => {
      const entity = new LayoutSectionEntity();
      entity.cmsLayoutSectionId = s.id || uuidv4();
      entity.cmsLayoutSectionPage = dto.page;
      entity.cmsLayoutSectionType = s.type;
      entity.cmsLayoutSectionConfig = s.config;
      entity.cmsLayoutSectionSort = s.sort;
      entity.cmsLayoutSectionVisible = s.visible;
      entity.cmsLayoutSectionVersion = 'draft';
      return entity;
    });

    await this.sectionRepo.save(entities);
    return entities;
  }

  /**
   * Publish: copy draft sang published (thay the published cu)
   */
  async publishLayout(page: string) {
    // Xoa published cu
    await this.sectionRepo.delete({
      cmsLayoutSectionPage: page,
      cmsLayoutSectionVersion: 'published',
    });

    // Lay draft hien tai
    const drafts = await this.sectionRepo.find({
      where: { cmsLayoutSectionPage: page, cmsLayoutSectionVersion: 'draft' },
    });

    // Clone sang published
    const published = drafts.map(d => {
      const entity = new LayoutSectionEntity();
      entity.cmsLayoutSectionId = uuidv4();
      entity.cmsLayoutSectionPage = d.cmsLayoutSectionPage;
      entity.cmsLayoutSectionType = d.cmsLayoutSectionType;
      entity.cmsLayoutSectionConfig = d.cmsLayoutSectionConfig;
      entity.cmsLayoutSectionSort = d.cmsLayoutSectionSort;
      entity.cmsLayoutSectionVisible = d.cmsLayoutSectionVisible;
      entity.cmsLayoutSectionVersion = 'published';
      return entity;
    });

    await this.sectionRepo.save(published);
    return published;
  }

  /**
   * Schedule: set version=scheduled + publish_at
   */
  async scheduleLayout(dto: ScheduleLayoutDto) {
    // Xoa scheduled cu
    await this.sectionRepo.delete({
      cmsLayoutSectionPage: dto.page,
      cmsLayoutSectionVersion: 'scheduled',
    });

    // Lay draft hien tai
    const drafts = await this.sectionRepo.find({
      where: { cmsLayoutSectionPage: dto.page, cmsLayoutSectionVersion: 'draft' },
    });

    // Clone sang scheduled
    const scheduled = drafts.map(d => {
      const entity = new LayoutSectionEntity();
      entity.cmsLayoutSectionId = uuidv4();
      entity.cmsLayoutSectionPage = d.cmsLayoutSectionPage;
      entity.cmsLayoutSectionType = d.cmsLayoutSectionType;
      entity.cmsLayoutSectionConfig = d.cmsLayoutSectionConfig;
      entity.cmsLayoutSectionSort = d.cmsLayoutSectionSort;
      entity.cmsLayoutSectionVisible = d.cmsLayoutSectionVisible;
      entity.cmsLayoutSectionVersion = 'scheduled';
      entity.cmsLayoutSectionPublishAt = new Date(dto.publishAt);
      return entity;
    });

    await this.sectionRepo.save(scheduled);
    return scheduled;
  }

  /**
   * Reset: xoa draft, copy published ve lam draft moi
   */
  async resetLayout(page: string) {
    await this.sectionRepo.delete({
      cmsLayoutSectionPage: page,
      cmsLayoutSectionVersion: 'draft',
    });

    const published = await this.sectionRepo.find({
      where: { cmsLayoutSectionPage: page, cmsLayoutSectionVersion: 'published' },
    });

    const newDrafts = published.map(p => {
      const entity = new LayoutSectionEntity();
      entity.cmsLayoutSectionId = uuidv4();
      entity.cmsLayoutSectionPage = p.cmsLayoutSectionPage;
      entity.cmsLayoutSectionType = p.cmsLayoutSectionType;
      entity.cmsLayoutSectionConfig = p.cmsLayoutSectionConfig;
      entity.cmsLayoutSectionSort = p.cmsLayoutSectionSort;
      entity.cmsLayoutSectionVisible = p.cmsLayoutSectionVisible;
      entity.cmsLayoutSectionVersion = 'draft';
      return entity;
    });

    await this.sectionRepo.save(newDrafts);
    return newDrafts;
  }

  // ==================== Banners ====================

  async getBanners() {
    return this.bannerRepo.find({ order: { cmsBannerSort: 'ASC' } });
  }

  async getBanner(id: string) {
    const banner = await this.bannerRepo.findOne({ where: { cmsBannerId: id } });
    if (!banner) throw new NotFoundException('Banner khong ton tai');
    return banner;
  }

  async createBanner(dto: CreateBannerDto) {
    const entity = new BannerEntity();
    entity.cmsBannerId = uuidv4();
    entity.cmsBannerTitle = dto.title;
    entity.cmsBannerImageDesktop = dto.imageDesktop;
    entity.cmsBannerImageMobile = dto.imageMobile;
    entity.cmsBannerAlt = dto.alt || null;
    entity.cmsBannerLink = dto.link || null;
    entity.cmsBannerCtaText = dto.ctaText || null;
    entity.cmsBannerSort = dto.sort || 0;
    entity.cmsBannerStartDate = dto.startDate ? new Date(dto.startDate) : null;
    entity.cmsBannerEndDate = dto.endDate ? new Date(dto.endDate) : null;
    entity.cmsBannerStatus = dto.status ?? 1;
    entity.cmsBannerAbVariant = dto.abVariant || null;
    entity.cmsBannerAbGroupId = dto.abGroupId || null;
    return this.bannerRepo.save(entity);
  }

  async updateBanner(id: string, dto: UpdateBannerDto) {
    const banner = await this.getBanner(id);
    Object.assign(banner, {
      cmsBannerTitle: dto.title,
      cmsBannerImageDesktop: dto.imageDesktop,
      cmsBannerImageMobile: dto.imageMobile,
      cmsBannerAlt: dto.alt || null,
      cmsBannerLink: dto.link || null,
      cmsBannerCtaText: dto.ctaText || null,
      cmsBannerSort: dto.sort ?? banner.cmsBannerSort,
      cmsBannerStartDate: dto.startDate ? new Date(dto.startDate) : null,
      cmsBannerEndDate: dto.endDate ? new Date(dto.endDate) : null,
      cmsBannerStatus: dto.status ?? banner.cmsBannerStatus,
      cmsBannerAbVariant: dto.abVariant || null,
      cmsBannerAbGroupId: dto.abGroupId || null,
    });
    return this.bannerRepo.save(banner);
  }

  async deleteBanner(id: string) {
    const banner = await this.getBanner(id);
    await this.bannerRepo.remove(banner);
  }

  /**
   * Sap xep lai thu tu banner
   */
  async reorderBanners(ids: string[]) {
    const updates = ids.map((id, i) =>
      this.bannerRepo.update(id, { cmsBannerSort: i + 1 }),
    );
    await Promise.all(updates);
  }

  /**
   * Tang click count cho banner (storefront tracking)
   */
  async trackBannerClick(id: string) {
    await this.bannerRepo.increment({ cmsBannerId: id }, 'cmsBannerClickCount', 1);
  }

  /**
   * Tang view count cho banner (storefront tracking)
   */
  async trackBannerView(id: string) {
    await this.bannerRepo.increment({ cmsBannerId: id }, 'cmsBannerViewCount', 1);
  }

  // ==================== Menus ====================

  async getMenus() {
    return this.menuRepo.find({ order: { cmsMenuType: 'ASC' } });
  }

  /**
   * Lay menu items theo type (header/footer/mobile), tra ve dang tree
   */
  async getMenuItems(menuType: string) {
    const menu = await this.menuRepo.findOne({ where: { cmsMenuType: menuType } });
    if (!menu) throw new NotFoundException('Menu khong ton tai');

    const items = await this.menuItemRepo.find({
      where: { cmsMenuId: menu.cmsMenuId },
      order: { cmsMenuItemSort: 'ASC' },
    });

    // Build tree: loc cap 1 (parentId = null), gan children
    const rootItems = items.filter(i => !i.cmsMenuItemParentId);
    const childItems = items.filter(i => i.cmsMenuItemParentId);

    const tree = rootItems.map(root => ({
      ...root,
      children: childItems.filter(c => c.cmsMenuItemParentId === root.cmsMenuItemId),
    }));

    return { menu, items: tree };
  }

  /**
   * Cap nhat full tree menu — xoa cu, insert moi
   */
  async updateMenu(menuType: string, dto: UpdateMenuDto) {
    const menu = await this.menuRepo.findOne({ where: { cmsMenuType: menuType } });
    if (!menu) throw new NotFoundException('Menu khong ton tai');

    // Xoa tat ca items cu
    await this.menuItemRepo.delete({ cmsMenuId: menu.cmsMenuId });

    // Insert items moi (flatten tree)
    const entities: MenuItemEntity[] = [];

    for (const item of dto.items) {
      const parentEntity = this.createMenuItemEntity(item, menu.cmsMenuId, null);
      entities.push(parentEntity);

      if (item.children?.length) {
        for (const child of item.children) {
          const childEntity = this.createMenuItemEntity(child, menu.cmsMenuId, parentEntity.cmsMenuItemId);
          entities.push(childEntity);
        }
      }
    }

    // Save theo thu tu: parents truoc, children sau (vi FK constraint)
    const parents = entities.filter(e => !e.cmsMenuItemParentId);
    const children = entities.filter(e => e.cmsMenuItemParentId);
    await this.menuItemRepo.save(parents);
    if (children.length > 0) {
      await this.menuItemRepo.save(children);
    }

    return entities;
  }

  private createMenuItemEntity(dto: MenuItemDto, menuId: string, parentId: string | null): MenuItemEntity {
    const entity = new MenuItemEntity();
    entity.cmsMenuItemId = dto.id || uuidv4();
    entity.cmsMenuId = menuId;
    entity.cmsMenuItemParentId = parentId;
    entity.cmsMenuItemLabel = dto.label;
    entity.cmsMenuItemType = dto.type;
    entity.cmsMenuItemValue = dto.value;
    entity.cmsMenuItemIcon = dto.icon || null;
    entity.cmsMenuItemBadge = dto.badge || null;
    entity.cmsMenuItemOpenNewTab = dto.openNewTab || 0;
    entity.cmsMenuItemMobileVisible = dto.mobileVisible ?? 1;
    entity.cmsMenuItemSort = dto.sort;
    return entity;
  }

  // ==================== Theme Config ====================

  async getThemeConfig() {
    return this.themeConfigRepo.find({ order: { cmsThemeConfigGroup: 'ASC' } });
  }

  /**
   * Batch update theme config entries
   */
  async updateThemeConfig(dto: UpdateThemeConfigDto) {
    for (const entry of dto.entries) {
      await this.themeConfigRepo.update(
        { cmsThemeConfigKey: entry.key },
        { cmsThemeConfigValue: entry.value },
      );
    }
    return this.getThemeConfig();
  }

  // ==================== Email Templates ====================

  async getEmailTemplates() {
    return this.emailTemplateRepo.find({ order: { cmsEmailTemplateKey: 'ASC' } });
  }

  async getEmailTemplate(key: string) {
    const template = await this.emailTemplateRepo.findOne({
      where: { cmsEmailTemplateKey: key },
    });
    if (!template) throw new NotFoundException('Template khong ton tai');
    return template;
  }

  async updateEmailTemplate(key: string, dto: UpdateEmailTemplateDto) {
    const template = await this.getEmailTemplate(key);
    template.cmsEmailTemplateSubject = dto.subject;
    template.cmsEmailTemplateBody = dto.body;
    if (dto.variables !== undefined) {
      template.cmsEmailTemplateVariables = dto.variables ?? null;
    }
    return this.emailTemplateRepo.save(template);
  }
}
