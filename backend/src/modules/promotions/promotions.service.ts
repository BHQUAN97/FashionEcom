import { randomUUID } from 'crypto';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, In } from 'typeorm';
import { DiscountCodeEntity } from './entities/discount-code.entity';
import { DiscountUsageEntity } from './entities/discount-usage.entity';
import { FlashSaleEntity } from './entities/flash-sale.entity';
import { FlashSaleItemEntity } from './entities/flash-sale-item.entity';
import { CreateDiscountDto, UpdateDiscountDto, ApplyDiscountDto, DiscountQueryDto } from './dto/discount.dto';
import { CreateFlashSaleDto, UpdateFlashSaleDto, FlashSaleQueryDto } from './dto/flash-sale.dto';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(DiscountCodeEntity)
    private readonly discountRepo: Repository<DiscountCodeEntity>,
    @InjectRepository(DiscountUsageEntity)
    private readonly usageRepo: Repository<DiscountUsageEntity>,
    @InjectRepository(FlashSaleEntity)
    private readonly flashSaleRepo: Repository<FlashSaleEntity>,
    @InjectRepository(FlashSaleItemEntity)
    private readonly flashSaleItemRepo: Repository<FlashSaleItemEntity>,
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

  async createDiscount(dto: CreateDiscountDto) {
    // Check trung code
    const existing = await this.discountRepo.findOne({
      where: { prmDiscountCode: dto.code.toUpperCase() },
    });
    if (existing) throw new ConflictException('Ma giam gia da ton tai');

    const entity = new DiscountCodeEntity();
    entity.prmDiscountId = randomUUID();
    entity.prmDiscountCode = dto.code.toUpperCase();
    entity.prmDiscountType = dto.type;
    entity.prmDiscountValue = dto.value;
    entity.prmDiscountMaxAmount = dto.maxAmount || 0;
    entity.prmDiscountConditionsJson = dto.conditionsJson || null;
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
    const discount = await this.getDiscount(id);

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
      prmDiscountConditionsJson: dto.conditionsJson !== undefined ? dto.conditionsJson : discount.prmDiscountConditionsJson,
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
    let discountAmount = 0;
    if (discount.prmDiscountType === 1) {
      // Giam theo phan tram
      discountAmount = dto.cartSubtotal * Number(discount.prmDiscountValue) / 100;
      // Cap tai max_amount
      if (Number(discount.prmDiscountMaxAmount) > 0) {
        discountAmount = Math.min(discountAmount, Number(discount.prmDiscountMaxAmount));
      }
    } else {
      // Giam co dinh
      discountAmount = Math.min(Number(discount.prmDiscountValue), dto.cartSubtotal);
    }

    discountAmount = Math.round(discountAmount);

    // Step 9: Return discount details
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
    const entity = new FlashSaleEntity();
    entity.prmFlashSaleId = randomUUID();
    entity.prmFlashSaleTitle = dto.title;
    entity.prmFlashSaleStartDate = new Date(dto.startDate);
    entity.prmFlashSaleEndDate = new Date(dto.endDate);
    entity.prmFlashSaleStatus = dto.status || 0;

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
    const flashSale = await this.getFlashSale(id);

    flashSale.prmFlashSaleTitle = dto.title;
    flashSale.prmFlashSaleStartDate = new Date(dto.startDate);
    flashSale.prmFlashSaleEndDate = new Date(dto.endDate);
    flashSale.prmFlashSaleStatus = dto.status ?? flashSale.prmFlashSaleStatus;

    await this.flashSaleRepo.save(flashSale);

    // Xoa items cu, insert moi
    await this.flashSaleItemRepo.delete({ prmFlashSaleId: id });

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
      await this.flashSaleItemRepo.save(items);
    }

    return this.getFlashSale(id);
  }

  async deleteFlashSale(id: string) {
    const flashSale = await this.getFlashSale(id);
    await this.flashSaleRepo.remove(flashSale);
  }

  /**
   * Lay flash sale dang active (storefront)
   */
  async getActiveFlashSale() {
    const now = new Date();
    const flashSale = await this.flashSaleRepo.findOne({
      where: { prmFlashSaleStatus: 2 },
      relations: ['items'],
      order: { prmFlashSaleStartDate: 'DESC' },
    });

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
      .getOne();

    if (!item) return null;

    return {
      discountPct: Number(item.prmFlashSaleItemDiscountPct),
      soldQty: item.prmFlashSaleItemSoldQty,
      maxQty: item.prmFlashSaleItemMaxQty,
    };
  }
}
