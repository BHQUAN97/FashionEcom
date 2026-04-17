import { randomUUID } from 'crypto';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { SaleCampaignEntity } from './entities/sale-campaign.entity';
import { SaleCampaignVariantEntity } from './entities/sale-campaign-variant.entity';
import { FlashSaleItemEntity } from './entities/flash-sale-item.entity';
import { ProductVariantEntity } from '../products/entities/product-variant.entity';
import {
  CreateSaleCampaignDto,
  UpdateSaleCampaignDto,
  BulkSetCampaignPriceDto,
  SaleCampaignQueryDto,
} from './dto/sale-campaign.dto';

/** Ket qua gia sale tot nhat cho 1 variant */
export interface BestSalePrice {
  salePrice: number;
  originalPrice: number;
  discountPct: number;
  campaignName: string;
  campaignType: 'campaign' | 'flash_sale';
}

@Injectable()
export class SaleCampaignService {
  private readonly logger = new Logger(SaleCampaignService.name);

  constructor(
    @InjectRepository(SaleCampaignEntity)
    private readonly campaignRepo: Repository<SaleCampaignEntity>,
    @InjectRepository(SaleCampaignVariantEntity)
    private readonly campaignVariantRepo: Repository<SaleCampaignVariantEntity>,
    @InjectRepository(FlashSaleItemEntity)
    private readonly flashSaleItemRepo: Repository<FlashSaleItemEntity>,
    @InjectRepository(ProductVariantEntity)
    private readonly variantRepo: Repository<ProductVariantEntity>,
    private readonly dataSource: DataSource,
  ) {}

  // ==================== CRUD Campaign ====================

  async findAll(query: SaleCampaignQueryDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);

    const qb = this.campaignRepo.createQueryBuilder('c')
      .leftJoin('c.variants', 'cv')
      .addSelect('COUNT(cv.prmSaleCampaignVariantId)', 'variant_count')
      .groupBy('c.prmSaleCampaignId');

    if (query.status !== undefined) {
      qb.andWhere('c.prmSaleCampaignStatus = :st', { st: query.status });
    }

    qb.orderBy('c.createdDate', 'DESC');
    const total = await qb.getCount();
    const items = await qb.skip((page - 1) * limit).take(limit).getRawAndEntities();

    const data = items.entities.map((c, i) => ({
      ...c,
      variantCount: Number(items.raw[i]?.variant_count || 0),
    }));

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const campaign = await this.campaignRepo.findOne({
      where: { prmSaleCampaignId: id },
      relations: ['variants', 'variants.variant', 'variants.variant.color', 'variants.variant.size'],
    });
    if (!campaign) throw new NotFoundException('Chuong trinh sale khong ton tai');
    return campaign;
  }

  /** Validate discount value theo type — chong gia tri bat hop ly */
  private validateCampaignDiscount(discountType?: number, discountValue?: number) {
    // Khuyen mai khong vuot qua 60% gia tri san pham
    if (discountType === 1 && discountValue !== undefined && discountValue > 60) {
      throw new BadRequestException('Giam gia phan tram toi da 60%');
    }
    if (discountType === 1 && discountValue !== undefined && discountValue > 50) {
      this.logger.warn(`[SECURITY] Campaign discount phan tram cao: ${discountValue}%`);
    }
  }

  async create(dto: CreateSaleCampaignDto) {
    // BAO MAT: validate discount value
    this.validateCampaignDiscount(dto.discountType, dto.discountValue);

    this.logger.log(`[AUDIT] Create campaign: name=${dto.name}, type=${dto.discountType}, value=${dto.discountValue}`);

    const campaign = this.campaignRepo.create({
      prmSaleCampaignId: randomUUID(),
      prmSaleCampaignName: dto.name,
      prmSaleCampaignDesc: dto.desc || null,
      prmSaleCampaignStartDate: new Date(dto.startDate),
      prmSaleCampaignEndDate: new Date(dto.endDate),
      prmSaleCampaignDiscountType: dto.discountType || 1,
      prmSaleCampaignDiscountValue: dto.discountValue || 0,
      prmSaleCampaignPriority: dto.priority || 0,
      prmSaleCampaignStatus: dto.status || 0,
    });
    const saved = await this.campaignRepo.save(campaign);

    // Them variants neu co
    if (dto.variants?.length) {
      await this.addVariants(saved.prmSaleCampaignId, dto.variants);
    }

    return this.findOne(saved.prmSaleCampaignId);
  }

  async update(id: string, dto: UpdateSaleCampaignDto) {
    // BAO MAT: validate discount value
    this.validateCampaignDiscount(dto.discountType, dto.discountValue);

    this.logger.log(`[AUDIT] Update campaign: id=${id}, changes=${JSON.stringify({
      name: dto.name, discountType: dto.discountType, discountValue: dto.discountValue,
    })}`);

    const campaign = await this.findOne(id);

    campaign.prmSaleCampaignName = dto.name;
    campaign.prmSaleCampaignDesc = dto.desc || null;
    campaign.prmSaleCampaignStartDate = new Date(dto.startDate);
    campaign.prmSaleCampaignEndDate = new Date(dto.endDate);
    campaign.prmSaleCampaignDiscountType = dto.discountType ?? campaign.prmSaleCampaignDiscountType;
    campaign.prmSaleCampaignDiscountValue = dto.discountValue ?? campaign.prmSaleCampaignDiscountValue;
    campaign.prmSaleCampaignPriority = dto.priority ?? campaign.prmSaleCampaignPriority;
    campaign.prmSaleCampaignStatus = dto.status ?? campaign.prmSaleCampaignStatus;

    await this.campaignRepo.save(campaign);

    // Replace variants neu dto co
    if (dto.variants !== undefined) {
      await this.campaignVariantRepo.delete({ prmSaleCampaignId: id });
      if (dto.variants.length) {
        await this.addVariants(id, dto.variants);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    const campaign = await this.findOne(id);
    await this.campaignRepo.remove(campaign);
  }

  /** Them danh sach variant vao campaign */
  private async addVariants(
    campaignId: string,
    items: { variantId: string; discountType?: number; discountValue?: number; salePrice?: number; status?: number }[],
  ) {
    const entities = items.map((item) =>
      this.campaignVariantRepo.create({
        prmSaleCampaignVariantId: randomUUID(),
        prmSaleCampaignId: campaignId,
        catProductVariantId: item.variantId,
        prmSaleCvDiscountType: item.discountType ?? null,
        prmSaleCvDiscountValue: item.discountValue ?? null,
        prmSaleCvSalePrice: item.salePrice ?? null,
        prmSaleCvStatus: item.status ?? 1,
      }),
    );
    await this.campaignVariantRepo.save(entities);
  }

  /** Bulk set gia cho nhieu variant trong 1 campaign */
  async bulkSetPrice(campaignId: string, dto: BulkSetCampaignPriceDto) {
    const updateData: Partial<SaleCampaignVariantEntity> = {};
    if (dto.discountType !== undefined) updateData.prmSaleCvDiscountType = dto.discountType;
    if (dto.discountValue !== undefined) updateData.prmSaleCvDiscountValue = dto.discountValue;
    if (dto.salePrice !== undefined) updateData.prmSaleCvSalePrice = dto.salePrice;

    await this.campaignVariantRepo.update(
      {
        prmSaleCampaignId: campaignId,
        catProductVariantId: In(dto.variantIds),
      },
      updateData,
    );

    return { updated: dto.variantIds.length };
  }

  // ==================== Tinh gia sale tot nhat ====================

  /**
   * Tinh gia sale tot nhat cho 1 variant — gom ca campaign + flash sale
   * Tra ve gia thap nhat trong tat ca chuong trinh active
   */
  async getBestSalePrice(variantId: string): Promise<BestSalePrice | null> {
    const variant = await this.variantRepo.findOne({
      where: { catProductVariantId: variantId },
    });
    if (!variant) return null;

    const originalPrice = Number(variant.catProductVariantPrice);
    const now = new Date();
    const candidates: BestSalePrice[] = [];

    // 1. Tim tu sale campaigns active
    const campaignVariants = await this.campaignVariantRepo.createQueryBuilder('cv')
      .innerJoinAndSelect('cv.campaign', 'c')
      .where('cv.catProductVariantId = :vid', { vid: variantId })
      .andWhere('cv.prmSaleCvStatus = 1')
      .andWhere('c.prmSaleCampaignStatus = 2')
      .andWhere('c.prmSaleCampaignStartDate <= :now', { now })
      .andWhere('c.prmSaleCampaignEndDate >= :now', { now })
      .getMany();

    for (const cv of campaignVariants) {
      const salePrice = this.calcSalePrice(
        originalPrice,
        cv.prmSaleCvSalePrice,
        cv.prmSaleCvDiscountType ?? cv.campaign.prmSaleCampaignDiscountType,
        cv.prmSaleCvDiscountValue != null ? cv.prmSaleCvDiscountValue : cv.campaign.prmSaleCampaignDiscountValue,
      );
      if (salePrice < originalPrice) {
        candidates.push({
          salePrice,
          originalPrice,
          discountPct: Math.round((1 - salePrice / originalPrice) * 100),
          campaignName: cv.campaign.prmSaleCampaignName,
          campaignType: 'campaign',
        });
      }
    }

    // 2. Tim tu flash sales active
    const flashItems = await this.flashSaleItemRepo.createQueryBuilder('fsi')
      .innerJoinAndSelect('fsi.flashSale', 'fs')
      .where('fs.prmFlashSaleStatus = 2')
      .andWhere('fs.prmFlashSaleStartDate <= :now', { now })
      .andWhere('fs.prmFlashSaleEndDate >= :now', { now })
      .andWhere('(fsi.catProductVariantId = :vid OR (fsi.catProductVariantId IS NULL AND fsi.catProductId = :pid))',
        { vid: variantId, pid: variant.catProductId })
      .getMany();

    for (const fi of flashItems) {
      const salePrice = this.calcSalePrice(
        originalPrice,
        fi.prmFlashSaleItemSalePrice,
        1, // flash sale luon dung %
        Number(fi.prmFlashSaleItemDiscountPct),
      );
      // Kiem tra con hang trong flash sale
      if (salePrice < originalPrice && (fi.prmFlashSaleItemMaxQty === 0 || fi.prmFlashSaleItemSoldQty < fi.prmFlashSaleItemMaxQty)) {
        candidates.push({
          salePrice,
          originalPrice,
          discountPct: Math.round((1 - salePrice / originalPrice) * 100),
          campaignName: fi.flashSale.prmFlashSaleTitle,
          campaignType: 'flash_sale',
        });
      }
    }

    if (candidates.length === 0) return null;

    // Tra ve gia thap nhat
    candidates.sort((a, b) => a.salePrice - b.salePrice);
    return candidates[0];
  }

  /**
   * Batch tinh gia sale cho nhieu variant — 1 raw SQL, khong N+1
   * Tra ve Map<variantId, BestSalePrice>
   */
  async getBestSalePricesBatch(variantIds: string[]): Promise<Map<string, BestSalePrice>> {
    if (variantIds.length === 0) return new Map();

    const placeholders = variantIds.map(() => '?').join(',');
    const now = new Date();

    // Query campaign sale prices
    const campaignSql = `
      SELECT
        cv.cat_product_variant_id AS variant_id,
        v.cat_product_variant_price AS original_price,
        c.prm_sale_campaign_name AS campaign_name,
        'campaign' AS campaign_type,
        COALESCE(cv.prm_sale_cv_discount_type, c.prm_sale_campaign_discount_type) AS discount_type,
        COALESCE(cv.prm_sale_cv_discount_value, c.prm_sale_campaign_discount_value) AS discount_value,
        cv.prm_sale_cv_sale_price AS fixed_sale_price
      FROM prm_sale_campaign_variant cv
      INNER JOIN prm_sale_campaign c ON c.prm_sale_campaign_id = cv.prm_sale_campaign_id
      INNER JOIN cat_product_variant v ON v.cat_product_variant_id = cv.cat_product_variant_id
      WHERE cv.cat_product_variant_id IN (${placeholders})
        AND cv.prm_sale_cv_status = 1
        AND c.prm_sale_campaign_status = 2
        AND c.prm_sale_campaign_start_date <= ?
        AND c.prm_sale_campaign_end_date >= ?
    `;

    // Query flash sale prices
    const flashSql = `
      SELECT
        COALESCE(fsi.cat_product_variant_id, v.cat_product_variant_id) AS variant_id,
        v.cat_product_variant_price AS original_price,
        fs.prm_flash_sale_title AS campaign_name,
        'flash_sale' AS campaign_type,
        1 AS discount_type,
        fsi.prm_flash_sale_item_discount_pct AS discount_value,
        fsi.prm_flash_sale_item_sale_price AS fixed_sale_price
      FROM prm_flash_sale_item fsi
      INNER JOIN prm_flash_sale fs ON fs.prm_flash_sale_id = fsi.prm_flash_sale_id
      INNER JOIN cat_product_variant v ON (
        v.cat_product_variant_id = fsi.cat_product_variant_id
        OR (fsi.cat_product_variant_id IS NULL AND v.cat_product_id = fsi.cat_product_id)
      )
      WHERE v.cat_product_variant_id IN (${placeholders})
        AND fs.prm_flash_sale_status = 2
        AND fs.prm_flash_sale_start_date <= ?
        AND fs.prm_flash_sale_end_date >= ?
        AND (fsi.prm_flash_sale_item_max_qty = 0 OR fsi.prm_flash_sale_item_sold_qty < fsi.prm_flash_sale_item_max_qty)
    `;

    const [campaignRows, flashRows] = await Promise.all([
      this.dataSource.query(campaignSql, [...variantIds, now, now]),
      this.dataSource.query(flashSql, [...variantIds, now, now]),
    ]);

    // Merge tat ca ket qua, tim gia thap nhat per variant
    const result = new Map<string, BestSalePrice>();

    const processRow = (row: any) => {
      const originalPrice = Number(row.original_price);
      const salePrice = this.calcSalePrice(
        originalPrice,
        row.fixed_sale_price ? Number(row.fixed_sale_price) : null,
        Number(row.discount_type),
        Number(row.discount_value),
      );

      if (salePrice >= originalPrice) return;

      const existing = result.get(row.variant_id);
      if (!existing || salePrice < existing.salePrice) {
        result.set(row.variant_id, {
          salePrice,
          originalPrice,
          discountPct: Math.round((1 - salePrice / originalPrice) * 100),
          campaignName: row.campaign_name,
          campaignType: row.campaign_type,
        });
      }
    };

    for (const row of campaignRows) processRow(row);
    for (const row of flashRows) processRow(row);

    return result;
  }

  /** Tinh gia sale tu cac tham so */
  private calcSalePrice(
    originalPrice: number,
    fixedSalePrice: number | null | undefined,
    discountType: number,
    discountValue: number,
  ): number {
    // Gia co dinh override tat ca
    if (fixedSalePrice != null && fixedSalePrice > 0) {
      return Number(fixedSalePrice);
    }
    // Tinh tu %
    if (discountType === 1 && discountValue > 0) {
      return Math.round(originalPrice * (1 - Number(discountValue) / 100));
    }
    // Tinh tu so tien giam
    if (discountType === 2 && discountValue > 0) {
      return Math.max(0, originalPrice - Number(discountValue));
    }
    return originalPrice;
  }
}
