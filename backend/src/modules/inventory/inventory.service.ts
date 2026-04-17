import { randomUUID } from 'crypto';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { InventoryLevelEntity } from './entities/inventory-level.entity';
import { InventoryLogEntity } from './entities/inventory-log.entity';
import { WarehouseEntity } from './entities/warehouse.entity';
import { ProductVariantEntity } from '../products/entities/product-variant.entity';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { ImportInventoryDto } from './dto/import-inventory.dto';
import { BaseService } from '@/common/services/base.service';

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
    private readonly dataSource: DataSource,
  ) {
    super(levelRepo, 'invInventoryLevelId', 'Ton kho');
  }

  /**
   * Danh sach ton kho — join variant (color/size) + product + warehouse
   */
  async findAll(query: InventoryQueryDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);

    const qb = this.levelRepo.createQueryBuilder('il')
      .leftJoinAndSelect(ProductVariantEntity, 'v', 'v.catProductVariantId = il.catProductVariantId')
      .leftJoin('cat_product', 'p', 'p.cat_product_id = v.catProductId')
      .leftJoin('inv_warehouse', 'w', 'w.inv_warehouse_id = il.invWarehouseId')
      .leftJoin('cat_color', 'clr', 'clr.cat_color_id = v.catColorId')
      .leftJoin('cat_size', 'sz', 'sz.cat_size_id = v.catSizeId');

    if (query.search) {
      qb.andWhere('(v.catProductVariantSku LIKE :s)', { s: `%${query.search}%` });
    }
    if (query.warehouseId) {
      qb.andWhere('il.invWarehouseId = :wid', { wid: query.warehouseId });
    }
    // Filter theo mau sac
    if (query.colorId) {
      qb.andWhere('v.catColorId = :cid', { cid: query.colorId });
    }
    // Filter theo size
    if (query.sizeId) {
      qb.andWhere('v.catSizeId = :sid', { sid: query.sizeId });
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
   * Dieu chinh ton kho — pessimistic lock tranh race condition
   */
  async adjust(dto: AdjustInventoryDto, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate warehouse ton tai
      const warehouse = await queryRunner.manager.findOne(WarehouseEntity, {
        where: { invWarehouseId: dto.warehouseId },
      });
      if (!warehouse) {
        throw new NotFoundException('Kho hang khong ton tai');
      }

      // Pessimistic write lock — dam bao chi 1 request cap nhat tai 1 thoi diem
      let level = await queryRunner.manager.findOne(InventoryLevelEntity, {
        where: {
          catProductVariantId: dto.variantId,
          invWarehouseId: dto.warehouseId,
        },
        lock: { mode: 'pessimistic_write' },
      });

      if (!level) {
        level = queryRunner.manager.create(InventoryLevelEntity, {
          invInventoryLevelId: randomUUID(),
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
      await queryRunner.manager.save(level);

      // Ghi log trong cung transaction
      const log = queryRunner.manager.create(InventoryLogEntity, {
        invInventoryLogId: randomUUID(),
        catProductVariantId: dto.variantId,
        invWarehouseId: dto.warehouseId,
        invInventoryLogQty: dto.qty,
        invInventoryLogType: 'adjustment',
        invInventoryLogReason: dto.reason,
        invInventoryLogNote: dto.note || null,
        sysUserId: userId,
      });
      await queryRunner.manager.save(log);

      await queryRunner.commitTransaction();
      return level;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Nhap kho hang loat tu danh sach items
   * Toi uu: batch fetch variants + warehouses, chay trong 1 transaction duy nhat
   * thay vi N+1 queries va N transactions nhu truoc.
   */
  async bulkImport(dto: ImportInventoryDto, userId: string) {
    const errors: string[] = [];
    const total = dto.items?.length || 0;

    if (total === 0) {
      return { imported: 0, errors, total: 0 };
    }

    // Buoc 1: gom tat ca SKU + warehouseId duy nhat tu input
    const skus = Array.from(new Set(dto.items.map((i) => i.sku)));
    const warehouseIds = Array.from(new Set(dto.items.map((i) => i.warehouseId)));

    // Buoc 2: batch fetch variants + warehouses — chi 2 queries thay vi 2*N
    const [variants, warehouses] = await Promise.all([
      this.variantRepo.find({ where: { catProductVariantSku: In(skus) } }),
      this.warehouseRepo.find({ where: { invWarehouseId: In(warehouseIds) } }),
    ]);

    // Map de lookup O(1) trong loop
    const variantBySku = new Map<string, ProductVariantEntity>();
    for (const v of variants) {
      variantBySku.set(v.catProductVariantSku, v);
    }
    const warehouseIdSet = new Set(warehouses.map((w) => w.invWarehouseId));

    // Buoc 3: filter items hop le truoc khi mo transaction
    // de tranh giu lock vo nghia cho item loi
    type ValidItem = {
      sku: string;
      variantId: string;
      warehouseId: string;
      qty: number;
    };
    const validItems: ValidItem[] = [];
    for (const item of dto.items) {
      const variant = variantBySku.get(item.sku);
      if (!variant) {
        errors.push(`SKU ${item.sku} khong ton tai`);
        continue;
      }
      if (!warehouseIdSet.has(item.warehouseId)) {
        errors.push(`SKU ${item.sku}: Kho hang khong ton tai`);
        continue;
      }
      validItems.push({
        sku: item.sku,
        variantId: variant.catProductVariantId,
        warehouseId: item.warehouseId,
        qty: item.qty,
      });
    }

    if (validItems.length === 0) {
      return { imported: 0, errors, total };
    }

    // Buoc 4: mo 1 transaction duy nhat cho toan bo bulk
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let imported = 0;
    try {
      // Loop qua cac item hop le, moi item van can pessimistic lock
      // tren tung (variant, warehouse) de tranh race condition voi request khac
      for (const item of validItems) {
        try {
          let level = await queryRunner.manager.findOne(InventoryLevelEntity, {
            where: {
              catProductVariantId: item.variantId,
              invWarehouseId: item.warehouseId,
            },
            lock: { mode: 'pessimistic_write' },
          });

          if (!level) {
            level = queryRunner.manager.create(InventoryLevelEntity, {
              invInventoryLevelId: randomUUID(),
              catProductVariantId: item.variantId,
              invWarehouseId: item.warehouseId,
              invInventoryLevelAvailable: 0,
              invInventoryLevelLocked: 0,
            });
          }

          // Kiem tra ton kho khong am (bulkImport qty luon > 0 theo DTO
          // nhung van check cho an toan neu sau nay mo rong)
          const newAvailable = Number(level.invInventoryLevelAvailable) + item.qty;
          if (newAvailable < 0) {
            errors.push(`SKU ${item.sku}: Ton kho khong du de tru`);
            continue;
          }

          level.invInventoryLevelAvailable = newAvailable;
          await queryRunner.manager.save(level);

          // Ghi audit log trong cung transaction
          const log = queryRunner.manager.create(InventoryLogEntity, {
            invInventoryLogId: randomUUID(),
            catProductVariantId: item.variantId,
            invWarehouseId: item.warehouseId,
            invInventoryLogQty: item.qty,
            invInventoryLogType: 'adjustment',
            invInventoryLogReason: 'import',
            invInventoryLogNote: null,
            sysUserId: userId,
          });
          await queryRunner.manager.save(log);

          imported++;
        } catch (err) {
          // Loi tren 1 item rieng le — rollback toan bo de dam bao consistency
          const message = err instanceof Error ? err.message : 'Unknown error';
          errors.push(`SKU ${item.sku}: ${message}`);
          throw err;
        }
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      // Neu rollback thi khong co item nao duoc ghi nhan
      imported = 0;
      if (!(err instanceof Error && errors.some((e) => e.includes(err.message)))) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`Bulk import failed: ${message}`);
      }
    } finally {
      await queryRunner.release();
    }

    return { imported, errors, total };
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
