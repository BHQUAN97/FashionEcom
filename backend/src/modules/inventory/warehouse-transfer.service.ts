import { randomUUID } from 'crypto';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { WarehouseTransferEntity } from './entities/warehouse-transfer.entity';
import { WarehouseTransferItemEntity } from './entities/warehouse-transfer-item.entity';
import { InventoryLevelEntity } from './entities/inventory-level.entity';
import { InventoryLogEntity } from './entities/inventory-log.entity';
import { StateMachine } from '@/common/patterns/state-machine';
import { generateEntityCode } from '@/common/utils/code-generation.util';
import { BaseService } from '@/common/services/base.service';

/** Warehouse transfer state machine — reuse pattern chung */
const transferMachine = new StateMachine<number>({
  labels: {
    0: 'Draft', 1: 'Chờ xuất kho', 2: 'Đang vận chuyển',
    3: 'Đã nhận', 4: 'Nhận 1 phần', 5: 'Hoàn thành',
  } as Record<number, string>,
  transitions: [
    { from: 0, to: 1 },
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 2, to: 4 },
    { from: 3, to: 5 },
    { from: 4, to: 5 },
  ],
});

@Injectable()
export class WarehouseTransferService extends BaseService<WarehouseTransferEntity> {
  constructor(
    @InjectRepository(WarehouseTransferEntity)
    private readonly transferRepo: Repository<WarehouseTransferEntity>,
    @InjectRepository(WarehouseTransferItemEntity)
    private readonly itemRepo: Repository<WarehouseTransferItemEntity>,
    @InjectRepository(InventoryLevelEntity)
    private readonly levelRepo: Repository<InventoryLevelEntity>,
    @InjectRepository(InventoryLogEntity)
    private readonly logRepo: Repository<InventoryLogEntity>,
    private readonly dataSource: DataSource,
  ) {
    super(transferRepo, 'invWarehouseTransferId', 'Điều chuyển kho');
  }

  /**
   * Tao phieu dieu chuyen kho — tru ton kho xuat ngay
   */
  async create(dto: {
    fromWarehouseId: string;
    toWarehouseId: string;
    reason?: string;
    items: { variantId: string; qty: number }[];
  }, userId: string) {
    if (dto.fromWarehouseId === dto.toWarehouseId) {
      throw new BadRequestException('Kho xuất và kho nhận phải khác nhau');
    }

    // Validate items
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Phieu dieu chuyen phai co it nhat 1 san pham');
    }
    for (const item of dto.items) {
      if (!item.variantId) {
        throw new BadRequestException('Moi item phai co variantId');
      }
      if (!item.qty || item.qty <= 0) {
        throw new BadRequestException('So luong dieu chuyen phai lon hon 0');
      }
    }

    const code = await generateEntityCode('WTR', this.transferRepo);

    const transfer = this.transferRepo.create({
      invWarehouseTransferId: randomUUID(),
      invWarehouseTransferCode: code,
      invWarehouseFromId: dto.fromWarehouseId,
      invWarehouseToId: dto.toWarehouseId,
      invWarehouseTransferStatus: 0,
      invWarehouseTransferReason: dto.reason || null,
      sysUserId: userId,
    });
    await this.transferRepo.save(transfer);

    for (const item of dto.items) {
      const transferItem = this.itemRepo.create({
        invWarehouseTransferItemId: randomUUID(),
        invWarehouseTransferId: transfer.invWarehouseTransferId,
        catProductVariantId: item.variantId,
        invWarehouseTransferItemQty: item.qty,
        invWarehouseTransferItemReceivedQty: 0,
      });
      await this.itemRepo.save(transferItem);
    }

    return transfer;
  }

  /**
   * Cap nhat trang thai phieu dieu chuyen + side effects ton kho
   * Tat ca operations trong 1 transaction voi pessimistic lock
   */
  async updateStatus(id: string, newStatus: number, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Pessimistic write lock — chong race condition
      const transfer = await queryRunner.manager.findOne(WarehouseTransferEntity, {
        where: { invWarehouseTransferId: id },
        relations: ['items'],
        lock: { mode: 'pessimistic_write' },
      });
      if (!transfer) throw new NotFoundException('Phiếu điều chuyển không tồn tại');

      if (!transferMachine.canTransition(transfer.invWarehouseTransferStatus, newStatus)) {
        throw new BadRequestException('Không thể chuyển trạng thái');
      }

      // Side effect: tru kho xuat khi chuyen sang In Transit
      if (newStatus === 2) {
        for (const item of transfer.items) {
          const level = await queryRunner.manager.findOne(InventoryLevelEntity, {
            where: { catProductVariantId: item.catProductVariantId, invWarehouseId: transfer.invWarehouseFromId },
            lock: { mode: 'pessimistic_write' },
          });
          if (!level || Number(level.invInventoryLevelAvailable) < Number(item.invWarehouseTransferItemQty)) {
            throw new BadRequestException(`Tồn kho không đủ cho variant ${item.catProductVariantId}`);
          }
          level.invInventoryLevelAvailable = Number(level.invInventoryLevelAvailable) - Number(item.invWarehouseTransferItemQty);
          await queryRunner.manager.save(level);

          // Log
          await queryRunner.manager.save(queryRunner.manager.create(InventoryLogEntity, {
            invInventoryLogId: randomUUID(),
            catProductVariantId: item.catProductVariantId,
            invWarehouseId: transfer.invWarehouseFromId,
            invInventoryLogQty: -Number(item.invWarehouseTransferItemQty),
            invInventoryLogType: 'transfer_out',
            invInventoryLogReason: `Xuat kho -> ${transfer.invWarehouseTransferCode}`,
            invInventoryLogRefId: transfer.invWarehouseTransferId,
            sysUserId: userId,
          }));
        }
      }

      // Side effect: cong kho nhan khi Received
      if (newStatus === 3 || newStatus === 4) {
        for (const item of transfer.items) {
          const qty = Number(item.invWarehouseTransferItemQty);
          let level = await queryRunner.manager.findOne(InventoryLevelEntity, {
            where: { catProductVariantId: item.catProductVariantId, invWarehouseId: transfer.invWarehouseToId },
            lock: { mode: 'pessimistic_write' },
          });
          if (!level) {
            level = queryRunner.manager.create(InventoryLevelEntity, {
              invInventoryLevelId: randomUUID(),
              catProductVariantId: item.catProductVariantId,
              invWarehouseId: transfer.invWarehouseToId,
              invInventoryLevelAvailable: 0,
              invInventoryLevelLocked: 0,
            });
          }
          level.invInventoryLevelAvailable = Number(level.invInventoryLevelAvailable) + qty;
          await queryRunner.manager.save(level);

          await queryRunner.manager.save(queryRunner.manager.create(InventoryLogEntity, {
            invInventoryLogId: randomUUID(),
            catProductVariantId: item.catProductVariantId,
            invWarehouseId: transfer.invWarehouseToId,
            invInventoryLogQty: qty,
            invInventoryLogType: 'transfer_in',
            invInventoryLogReason: `Nhap kho tu ${transfer.invWarehouseTransferCode}`,
            invInventoryLogRefId: transfer.invWarehouseTransferId,
            sysUserId: userId,
          }));
        }
      }

      transfer.invWarehouseTransferStatus = newStatus;
      await queryRunner.manager.save(transfer);

      await queryRunner.commitTransaction();
      return transfer;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(page = 1, limit = 20) {
    const total = await this.transferRepo.count();
    const data = await this.transferRepo.find({
      order: { createdDate: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return this.paginate(data, total, page, limit);
  }

  async findOne(id: string) {
    return super.findOne(id, ['items']);
  }
}
