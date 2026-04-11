import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { InventoryLevelEntity } from './entities/inventory-level.entity';
import { InventoryLogEntity } from './entities/inventory-log.entity';
import { WarehouseEntity } from './entities/warehouse.entity';
import { ProductVariantEntity } from '../products/entities/product-variant.entity';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { ImportInventoryDto } from './dto/import-inventory.dto';
import { BaseService } from '../../common/services/base.service';

@Injectable()
export class InventoryService extends BaseService<InventoryLevelEntity> {
  constructor(
    @InjectRepository(InventoryLevelEntity)
    private readonly levelRepo: Repository<InventoryLevelEntity>,
    @InjectRepository(InventoryLogEntity)
    private readonly logRepo: Repository<InventoryLogEntity>,
    @InjectRepository(WarehouseEntity)
    private readonly warehouseRepo: Repository<WarehouseEntity>,
    @InjectRepository(ProductVariantEntity)
    private readonly variantRepo: Repository<ProductVariantEntity>,
  ) {
    super(levelRepo, 'invInventoryLevelId', 'Ton kho');
  }

  /**
   * Danh sach ton kho — join variant + product + warehouse
   */
  async findAll(query: InventoryQueryDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);

    const qb = this.levelRepo.createQueryBuilder('il')
      .leftJoinAndSelect(ProductVariantEntity, 'v', 'v.catProductVariantId = il.catProductVariantId')
      .leftJoin('cat_product', 'p', 'p.cat_product_id = v.catProductId')
      .leftJoin('inv_warehouse', 'w', 'w.inv_warehouse_id = il.invWarehouseId');

    if (query.search) {
      qb.andWhere('(v.catProductVariantSku LIKE :s)', { s: `%${query.search}%` });
    }
    if (query.warehouseId) {
      qb.andWhere('il.invWarehouseId = :wid', { wid: query.warehouseId });
    }

    const total = await qb.getCount();
    const data = await qb
      .orderBy('il.invInventoryLevelAvailable', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return this.paginate(data, total, page, limit);
  }

  /**
   * Dieu chinh ton kho — cap nhat available, ghi log
   */
  async adjust(dto: AdjustInventoryDto, userId: string) {
    // Tim inventory level
    let level = await this.levelRepo.findOne({
      where: {
        catProductVariantId: dto.variantId,
        invWarehouseId: dto.warehouseId,
      },
    });

    if (!level) {
      // Tao moi neu chua co
      level = this.levelRepo.create({
        invInventoryLevelId: uuidv4(),
        catProductVariantId: dto.variantId,
        invWarehouseId: dto.warehouseId,
        invInventoryLevelAvailable: 0,
        invInventoryLevelLocked: 0,
      });
    }

    // Kiem tra ton kho khong am
    const newAvailable = Number(level.invInventoryLevelAvailable) + dto.qty;
    if (newAvailable < 0) {
      throw new BadRequestException('Ton kho khong du de tru');
    }

    level.invInventoryLevelAvailable = newAvailable;
    await this.levelRepo.save(level);

    // Ghi log
    const log = this.logRepo.create({
      invInventoryLogId: uuidv4(),
      catProductVariantId: dto.variantId,
      invWarehouseId: dto.warehouseId,
      invInventoryLogQty: dto.qty,
      invInventoryLogType: 'adjustment',
      invInventoryLogReason: dto.reason,
      invInventoryLogNote: dto.note || null,
      sysUserId: userId,
    });
    await this.logRepo.save(log);

    return level;
  }

  /**
   * Nhap kho hang loat tu danh sach items
   */
  async bulkImport(dto: ImportInventoryDto, userId: string) {
    let imported = 0;
    const errors: string[] = [];

    for (const item of dto.items) {
      // Tim variant theo SKU
      const variant = await this.variantRepo.findOne({
        where: { catProductVariantSku: item.sku },
      });
      if (!variant) {
        errors.push(`SKU ${item.sku} khong ton tai`);
        continue;
      }

      try {
        await this.adjust(
          {
            variantId: variant.catProductVariantId,
            warehouseId: item.warehouseId,
            qty: item.qty,
            reason: 'import',
          },
          userId,
        );
        imported++;
      } catch (err: any) {
        errors.push(`SKU ${item.sku}: ${err.message}`);
      }
    }

    return { imported, errors, total: dto.items.length };
  }

  /**
   * Lich su dieu chinh ton kho
   */
  async getLogs(variantId: string) {
    return this.logRepo.find({
      where: { catProductVariantId: variantId },
      order: { createdDate: 'DESC' },
      take: 50,
    });
  }

  /**
   * Danh sach kho hang
   */
  async getWarehouses() {
    return this.warehouseRepo.find({ order: { invWarehouseCode: 'ASC' } });
  }
}
