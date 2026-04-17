import { randomUUID } from 'crypto';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, In, DataSource } from 'typeorm';
import { DiscountCodeEntity } from './entities/discount-code.entity';
import { DiscountUsageEntity } from './entities/discount-usage.entity';
import { FlashSaleEntity } from './entities/flash-sale.entity';
import { FlashSaleItemEntity } from './entities/flash-sale-item.entity';
import { CreateDiscountDto, UpdateDiscountDto, ApplyDiscountDto, DiscountQueryDto } from './dto/discount.dto';
import { CreateFlashSaleDto, UpdateFlashSaleDto, FlashSaleQueryDto } from './dto/flash-sale.dto';

@Injectable()
export class PromotionsService {
  private readonly logger = new Logger(PromotionsService.name);

  constructor(
    @InjectRepository(DiscountCodeEntity)
    private readonly discountRepo: Repository<DiscountCodeEntity>,
    @InjectRepository(DiscountUsageEntity)
    private readonly usageRepo: Repository<DiscountUsageEntity>,
    @InjectRepository(FlashSaleEntity)
    private readonly flashSaleRepo: Repository<FlashSaleEntity>,
    @InjectRepository(FlashSaleItemEntity)
    private readonly flashSaleItemRepo: Repository<FlashSaleItemEntity>,
    private readonly dataSource: DataSource,
  ) {}

  // ==================== Discount Codes ====================

  async getDiscounts(query: DiscountQueryDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);

    const qb = this.discountRepo.createQueryBuilder('d');

    if (query.search) {
      qb.andWhere('d.prmDiscountCode LIKE :s', { s: `%${query.search}%` });
    }

    if (query.status !== undefined) {
      qb.andWhere('d.prmDiscountStatus = :st', { st: query.status });
    }

    qb.orderBy('d.createdDate', 'DESC');

    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getDiscount(id: string) {
    const discount = await this.discountRepo.findOne({ where: { prmDiscountId: id } });
    if (!discount) throw new NotFoundException('Ma giam gia khong ton tai');
    return discount;
  }

  /**
   * Validate gia tri discount theo type — chong tao discount bat hop ly
   */
  private validateDiscountValue(type: number, value: number) {
    // Khuyen mai khong vuot qua 60% gia tri san pham
    if (type === 1 && value > 60) {
      throw new BadRequestException('Giam gia phan tram toi da 60%');
    }
    if (type === 1 && value > 50) {
      this.logger.warn(`[SECURITY] Discount phan tram cao bat thuong: ${value}%`);
    }
    if (type === 2 && value > 50_000_000) {
      throw new BadRequestException('Giam gia co dinh toi da 50,000,000 VND');
    }
  }

  async createDiscount(dto: CreateDiscountDto) {
    // BAO MAT: Validate discount value theo type
    this.validateDiscountValue(dto.type, dto.value);

    // Check trung code
    const existing = await this.discountRepo.findOne({
      where: { prmDiscountCode: dto.code.toUpperCase() },
    });
    if (existing) throw new ConflictException('Ma giam gia da ton tai');

    this.logger.log(`[AUDIT] Create discount: code=${dto.code}, type=${dto.type}, value=${dto.value}`);

    const entity = new DiscountCodeEntity();
    entity.prmDiscountId = randomUUID();
    entity.prmDiscountCode = dto.code.toUpperCase();
    entity.prmDiscountType = dto.type;
    entity.prmDiscountValue = dto.value;
    entity.prmDiscountMaxAmount = dto.maxAmount || 0;
    entity.prmDiscountConditionsJson = dto.conditionsJson ? (dto.conditionsJson as unknown as Record<string, unknown>) : null;
    entity.prmDiscountMaxUsage = dto.maxUsage ?? null;
    entity.prmDiscountMaxPerCustomer = dto.maxPerCustomer ?? null;
    entity.prmDiscountStartDate = dto.startDate ? new Date(dto.startDate) : null;
    entity.prmDiscountEndDate = dto.endDate ? new Date(dto.endDate) : null;
    entity.prmDiscountStackable = dto.stackable || 0;
    entity.prmDiscountStatus = dto.status ?? 1;
    entity.prmDiscountCustomerScope = dto.customerScope || 0;
    entity.prmDiscountCustomerIds = dto.customerIds || null;

    return this.discountRepo.save(entity);
  }

  async updateDiscount(id: string, dto: UpdateDiscountDto) {
    // BAO MAT: Validate discount value theo type
    const effectiveType = dto.type ?? (await this.getDiscount(id)).prmDiscountType;
    if (dto.value !== undefined) {
      this.validateDiscountValue(effectiveType, dto.value);
    }

    const discount = await this.getDiscount(id);

    this.logger.log(`[AUDIT] Update discount: id=${id}, code=${discount.prmDiscountCode}, changes=${JSON.stringify(dto)}`);

    // Neu doi code, check trung
    if (dto.code && dto.code.toUpperCase() !== discount.prmDiscountCode) {
      const existing = await this.discountRepo.findOne({
        where: { prmDiscountCode: dto.code.toUpperCase() },
      });
      if (existing) throw new ConflictException('Ma giam gia da ton tai');
    }

    Object.assign(discount, {
      prmDiscountCode: dto.code?.toUpperCase() ?? discount.prmDiscountCode,
      prmDiscountType: dto.type ?? discount.prmDiscountType,
      prmDiscountValue: dto.value ?? discount.prmDiscountValue,
      prmDiscountMaxAmount: dto.maxAmount ?? discount.prmDiscountMaxAmount,
      prmDiscountConditionsJson: dto.conditionsJson !== undefined ? (dto.conditionsJson as unknown as Record<string, unknown>) : discount.prmDiscountConditionsJson,
      prmDiscountMaxUsage: dto.maxUsage !== undefined ? dto.maxUsage : discount.prmDiscountMaxUsage,
      prmDiscountMaxPerCustomer: dto.maxPerCustomer !== undefined ? dto.maxPerCustomer : discount.prmDiscountMaxPerCustomer,
      prmDiscountStartDate: dto.startDate ? new Date(dto.startDate) : discount.prmDiscountStartDate,
      prmDiscountEndDate: dto.endDate ? new Date(dto.endDate) : discount.prmDiscountEndDate,
      prmDiscountStackable: dto.stackable ?? discount.prmDiscountStackable,
      prmDiscountStatus: dto.status ?? discount.prmDiscountStatus,
      prmDiscountCustomerScope: dto.customerScope ?? discount.prmDiscountCustomerScope,
      prmDiscountCustomerIds: dto.customerIds !== undefined ? dto.customerIds : discount.prmDiscountCustomerIds,
    });

    return this.discountRepo.save(discount);
  }

  async deleteDiscount(id: string) {
    const discount = await this.getDiscount(id);
    this.logger.warn(`[AUDIT] Delete discount: id=${id}, code=${discount.prmDiscountCode}`);
    await this.discountRepo.remove(discount);
  }

  /**
   * Validate va apply ma giam gia — 9-step validation flow
   */
  async applyDiscount(dto: ApplyDiscountDto) {
    // Step 1: Lookup code
    const discount = await this.discountRepo.findOne({
      where: { prmDiscountCode: dto.code.toUpperCase() },
    });
    if (!discount || discount.prmDiscountStatus !== 1) {
      throw new BadRequestException('Ma giam gia khong hop le hoac da bi vo hieu hoa');
    }

    // Step 2: Check date range
    const now = new Date();
    if (discount.prmDiscountStartDate && now < discount.prmDiscountStartDate) {
      throw new BadRequestException('Ma giam gia chua co hieu luc');
    }
    if (discount.prmDiscountEndDate && now > discount.prmDiscountEndDate) {
      throw new BadRequestException('Ma giam gia da het han');
    }

    // Step 3: Check global usage
    if (discount.prmDiscountMaxUsage !== null && discount.prmDiscountUsageCount >= discount.prmDiscountMaxUsage) {
      throw new BadRequestException('Ma giam gia da het luot su dung');
    }

    // Step 4: Check per-customer usage
    if (dto.customerId && discount.prmDiscountMaxPerCustomer !== null) {
      const customerUsageCount = await this.usageRepo.count({
        where: { prmDiscountId: discount.prmDiscountId, sysCustomerId: dto.customerId },
      });
      if (customerUsageCount >= discount.prmDiscountMaxPerCustomer) {
        throw new BadRequestException('Ban da su dung het luot cho ma nay');
      }
    }

    // Step 5: Check customer scope
    if (discount.prmDiscountCustomerScope === 1 && !dto.customerId) {
      throw new BadRequestException('Ma nay chi danh cho khach hang da dang nhap');
    }
    if (discount.prmDiscountCustomerScope === 2 && dto.customerId) {
      const allowedIds = discount.prmDiscountCustomerIds || [];
      if (!allowedIds.includes(dto.customerId)) {
        throw new BadRequestException('Ma nay khong ap dung cho tai khoan cua ban');
      }
    }

    // Step 6: Parse conditions
    const conditions = discount.prmDiscountConditionsJson as Record<string, unknown> | null;
    if (conditions) {
      // 6a: min_order_value
      if (conditions.min_order_value && dto.cartSubtotal < Number(conditions.min_order_value)) {
        throw new BadRequestException(
          `Don hang toi thieu ${Number(conditions.min_order_value).toLocaleString()}d de ap dung ma nay`,
        );
      }

      // 6b: min_quantity
      if (conditions.min_quantity && dto.cartItemCount < Number(conditions.min_quantity)) {
        throw new BadRequestException(
          `Can toi thieu ${conditions.min_quantity} san pham de ap dung ma nay`,
        );
      }
    }

    // Step 7: Check stacking
    if (dto.existingDiscountCodes?.length) {
      // Neu discount hien tai khong stackable va da co ma khac → reject
      if (!discount.prmDiscountStackable) {
        throw new BadRequestException('Ma nay khong the ket hop voi ma giam gia khac');
      }
    }

    // Step 8: Calculate discount amount
    // BAO MAT: server-side validation — gia tri discount KHONG vuot qua gioi han
    const discountValue = Number(discount.prmDiscountValue);
    if (discount.prmDiscountType === 1 && (discountValue < 0 || discountValue > 60)) {
      this.logger.error(`[SECURITY] Invalid discount value in DB: id=${discount.prmDiscountId}, type=%, value=${discountValue}`);
      throw new BadRequestException('Gia tri khuyen mai khong hop le');
    }

    let discountAmount = 0;
    if (discount.prmDiscountType === 1) {
      // Giam theo phan tram
      discountAmount = dto.cartSubtotal * discountValue / 100;
      // Cap tai max_amount
      if (Number(discount.prmDiscountMaxAmount) > 0) {
        discountAmount = Math.min(discountAmount, Number(discount.prmDiscountMaxAmount));
      }
    } else {
      // Giam co dinh
      discountAmount = Math.min(discountValue, dto.cartSubtotal);
    }

    // BAO MAT: dam bao discount khong vuot qua gia tri don hang
    discountAmount = Math.max(0, Math.round(discountAmount));
    if (discountAmount > dto.cartSubtotal) {
      discountAmount = dto.cartSubtotal;
    }

    // Step 9: Atomic increment usage counter — chong race condition
    // Dung raw SQL UPDATE voi WHERE clause dam bao khong vuot max usage
    const updateResult = await this.dataSource.query(
      `UPDATE prm_discount_code
       SET prm_discount_usage_count = prm_discount_usage_count + 1
       WHERE prm_discount_id = ?
         AND (prm_discount_max_usage IS NULL OR prm_discount_usage_count < prm_discount_max_usage)`,
      [discount.prmDiscountId],
    );

    // Kiem tra row affected — neu 0 thi da het luot (race condition caught!)
    if (updateResult.affectedRows === 0) {
      throw new BadRequestException('Ma giam gia da het luot su dung');
    }

    this.logger.log(
      `[AUDIT] Discount applied: code=${discount.prmDiscountCode}, amount=${discountAmount}, customer=${dto.customerId || 'guest'}`,
    );

    // Step 10: Return discount details
    return {
      discountId: discount.prmDiscountId,
      code: discount.prmDiscountCode,
      type: discount.prmDiscountType,
      value: Number(discount.prmDiscountValue),
      discountAmount,
      message: `Ap dung ma ${discount.prmDiscountCode} thanh cong — giam ${discountAmount.toLocaleString()}d`,
    };
  }

  // ==================== Flash Sales ====================

  async getFlashSales(query: FlashSaleQueryDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);

    const qb = this.flashSaleRepo.createQueryBuilder('fs')
      .leftJoinAndSelect('fs.items', 'item');

    if (query.status !== undefined) {
      qb.andWhere('fs.prmFlashSaleStatus = :st', { st: query.status });
    }

    qb.orderBy('fs.createdDate', 'DESC');

    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getFlashSale(id: string) {
    const flashSale = await this.flashSaleRepo.findOne({
      where: { prmFlashSaleId: id },
      relations: ['items'],
    });
    if (!flashSale) throw new NotFoundException('Flash sale khong ton tai');
    return flashSale;
  }

  async createFlashSale(dto: CreateFlashSaleDto) {
    this.logger.log(
      `[AUDIT] Create flash sale: title=${dto.title}, items=${dto.items?.length || 0}, ` +
      `start=${dto.startDate}, end=${dto.endDate}`,
    );

    const entity = new FlashSaleEntity();
    entity.prmFlashSaleId = randomUUID();
    entity.prmFlashSaleTitle = dto.title;
    entity.prmFlashSaleStartDate = new Date(dto.startDate);
    entity.prmFlashSaleEndDate = new Date(dto.endDate);
    entity.prmFlashSaleStatus = dto.status || 0;

    // Validate flash sale items
    if (dto.items?.length) {
      for (const item of dto.items) {
        if (item.discountPct < 1 || item.discountPct > 99) {
          throw new BadRequestException(`Phan tram giam gia phai tu 1-99%, nhan duoc: ${item.discountPct}%`);
        }
        if (item.maxQty < 1) {
          throw new BadRequestException('So luong toi da phai >= 1');
        }
      }
    }

    const savedFlashSale = await this.flashSaleRepo.save(entity);

    // Tao items
    if (dto.items?.length) {
      const items = dto.items.map(item => {
        const itemEntity = new FlashSaleItemEntity();
        itemEntity.prmFlashSaleItemId = randomUUID();
        itemEntity.prmFlashSaleId = savedFlashSale.prmFlashSaleId;
        itemEntity.catProductId = item.productId;
        itemEntity.prmFlashSaleItemDiscountPct = item.discountPct;
        itemEntity.prmFlashSaleItemMaxQty = item.maxQty;
        return itemEntity;
      });
      await this.flashSaleItemRepo.save(items);
    }

    return this.getFlashSale(savedFlashSale.prmFlashSaleId);
  }

  async updateFlashSale(id: string, dto: UpdateFlashSaleDto) {
    this.logger.log(`[AUDIT] Update flash sale: id=${id}, title=${dto.title}`);

    // Validate flash sale items
    if (dto.items?.length) {
      for (const item of dto.items) {
        if (item.discountPct < 1 || item.discountPct > 99) {
          throw new BadRequestException(`Phan tram giam gia phai tu 1-99%, nhan duoc: ${item.discountPct}%`);
        }
        if (item.maxQty < 1) {
          throw new BadRequestException('So luong toi da phai >= 1');
        }
      }
    }

    const flashSale = await this.getFlashSale(id);

    flashSale.prmFlashSaleTitle = dto.title;
    flashSale.prmFlashSaleStartDate = new Date(dto.startDate);
    flashSale.prmFlashSaleEndDate = new Date(dto.endDate);
    flashSale.prmFlashSaleStatus = dto.status ?? flashSale.prmFlashSaleStatus;

    // Wrap delete+insert trong transaction de tranh mat data
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(flashSale);

      // Xoa items cu, insert moi
      await queryRunner.manager.delete(FlashSaleItemEntity, { prmFlashSaleId: id });

      if (dto.items?.length) {
        const items = dto.items.map(item => {
          const itemEntity = new FlashSaleItemEntity();
          itemEntity.prmFlashSaleItemId = randomUUID();
          itemEntity.prmFlashSaleId = id;
          itemEntity.catProductId = item.productId;
          itemEntity.prmFlashSaleItemDiscountPct = item.discountPct;
          itemEntity.prmFlashSaleItemMaxQty = item.maxQty;
          return itemEntity;
        });
        await queryRunner.manager.save(items);
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    return this.getFlashSale(id);
  }

  async deleteFlashSale(id: string) {
    const flashSale = await this.getFlashSale(id);
    this.logger.warn(`[AUDIT] Delete flash sale: id=${id}, title=${flashSale.prmFlashSaleTitle}`);
    await this.flashSaleRepo.remove(flashSale);
  }

  /**
   * Lay flash sale dang active (storefront)
   */
  async getActiveFlashSale() {
    const now = new Date();
    const flashSale = await this.flashSaleRepo.createQueryBuilder('fs')
      .leftJoinAndSelect('fs.items', 'item')
      .where('fs.prmFlashSaleStatus = 2')
      .andWhere('fs.prmFlashSaleStartDate <= :now', { now })
      .andWhere('fs.prmFlashSaleEndDate >= :now', { now })
      .orderBy('fs.prmFlashSaleStartDate', 'DESC')
      .getOne();

    return flashSale;
  }

  /**
   * Kiem tra san pham co trong flash sale active khong
   * Tra ve flash price neu co
   */
  async getFlashPriceForProduct(productId: string): Promise<{ discountPct: number; soldQty: number; maxQty: number } | null> {
    const now = new Date();

    const item = await this.flashSaleItemRepo.createQueryBuilder('fsi')
      .innerJoin('fsi.flashSale', 'fs')
      .where('fsi.catProductId = :pid', { pid: productId })
      .andWhere('fs.prmFlashSaleStatus = 2')
      .andWhere('fs.prmFlashSaleStartDate <= :now', { now })
      .andWhere('fs.prmFlashSaleEndDate >= :now', { now })
      .getOne();

    if (!item) return null;

    return {
      discountPct: Number(item.prmFlashSaleItemDiscountPct),
      soldQty: item.prmFlashSaleItemSoldQty,
      maxQty: item.prmFlashSaleItemMaxQty,
    };
  }
}
