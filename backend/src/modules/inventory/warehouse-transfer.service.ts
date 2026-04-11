import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { WarehouseTransferEntity } from './entities/warehouse-transfer.entity';
import { WarehouseTransferItemEntity } from './entities/warehouse-transfer-item.entity';
import { InventoryLevelEntity } from './entities/inventory-level.entity';
import { InventoryLogEntity } from './entities/inventory-log.entity';
import { StateMachine } from '../../common/patterns/state-machine';
import { generateEntityCode } from '../../common/utils/code-generation.util';

/** Warehouse transfer state machine — reuse pattern chung */
const transferMachine = new StateMachine<number>({
  labels: {
    0: 'Draft', 1: 'Cho xuat kho', 2: 'Dang van chuyen',
    3: 'Da nhan', 4: 'Nhan 1 phan', 5: 'Hoan thanh',
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
export class WarehouseTransferService {
  constructor(
    @InjectRepository(WarehouseTransferEntity)
    private readonly transferRepo: Repository<WarehouseTransferEntity>,
    @InjectRepository(WarehouseTransferItemEntity)
    private readonly itemRepo: Repository<WarehouseTransferItemEntity>,
    @InjectRepository(InventoryLevelEntity)
    private readonly levelRepo: Repository<InventoryLevelEntity>,
    @InjectRepository(InventoryLogEntity)
    private readonly logRepo: Repository<InventoryLogEntity>,
  ) {}

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
      throw new BadRequestException('Kho xuat va kho nhan phai khac nhau');
    }

    const code = await generateEntityCode('WTR', this.transferRepo);

    const transfer = this.transferRepo.create({
      invWarehouseTransferId: uuidv4(),
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
        invWarehouseTransferItemId: uuidv4(),
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
   */
  async updateStatus(id: string, newStatus: number, userId: string) {
    const transfer = await this.transferRepo.findOne({
      where: { invWarehouseTransferId: id },
      relations: ['items'],
    });
    if (!transfer) throw new NotFoundException('Phieu dieu chuyen khong ton tai');

    if (!transferMachine.canTransition(transfer.invWarehouseTransferStatus, newStatus)) {
      throw new BadRequestException('Khong the chuyen trang thai');
    }

    // Side effect: tru kho xuat khi chuyen sang In Transit
    if (newStatus === 2) {
      for (const item of transfer.items) {
        const level = await this.levelRepo.findOne({
          where: { catProductVariantId: item.catProductVariantId, invWarehouseId: transfer.invWarehouseFromId },
        });
        if (!level || Number(level.invInventoryLevelAvailable) < Number(item.invWarehouseTransferItemQty)) {
          throw new BadRequestException(`Ton kho khong du cho variant ${item.catProductVariantId}`);
        }
        level.invInventoryLevelAvailable = Number(level.invInventoryLevelAvailable) - Number(item.invWarehouseTransferItemQty);
        await this.levelRepo.save(level);

        // Log
        await this.logRepo.save(this.logRepo.create({
          invInventoryLogId: uuidv4(),
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
        let level = await this.levelRepo.findOne({
          where: { catProductVariantId: item.catProductVariantId, invWarehouseId: transfer.invWarehouseToId },
        });
        if (!level) {
          level = this.levelRepo.create({
            invInventoryLevelId: uuidv4(),
            catProductVariantId: item.catProductVariantId,
            invWarehouseId: transfer.invWarehouseToId,
            invInventoryLevelAvailable: 0,
            invInventoryLevelLocked: 0,
          });
        }
        level.invInventoryLevelAvailable = Number(level.invInventoryLevelAvailable) + qty;
        await this.levelRepo.save(level);

        await this.logRepo.save(this.logRepo.create({
          invInventoryLogId: uuidv4(),
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
    await this.transferRepo.save(transfer);
    return transfer;
  }

  async findAll(page = 1, limit = 20) {
    const total = await this.transferRepo.count();
    const data = await this.transferRepo.find({
      order: { createdDate: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, pagination: { page, limit, total, total_pages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const transfer = await this.transferRepo.findOne({
      where: { invWarehouseTransferId: id },
      relations: ['items'],
    });
    if (!transfer) throw new NotFoundException('Phieu dieu chuyen khong ton tai');
    return transfer;
  }
}
