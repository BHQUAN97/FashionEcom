import { randomUUID } from 'crypto';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupplierEntity } from './entities/supplier.entity';
import { PurchaseOrderEntity } from './entities/purchase-order.entity';
import { PurchaseOrderItemEntity } from './entities/purchase-order-item.entity';
import { GoodsReceiptEntity, GoodsReceiptItemEntity } from './entities/goods-receipt.entity';
import { InventoryLevelEntity } from '../inventory/entities/inventory-level.entity';
import { InventoryLogEntity } from '../inventory/entities/inventory-log.entity';
import {
  CreateSupplierDto,
  CreatePurchaseOrderDto,
  ReceiveGoodsDto,
  SupplierQueryDto,
} from './dto/supplier.dto';
import { StateMachine } from '@/common/patterns/state-machine';
import { generateEntityCode } from '@/common/utils/code-generation.util';
import { BaseService } from '@/common/services/base.service';

/** PO Status state machine — reuse pattern */
const poMachine = new StateMachine<number>({
  labels: {
    0: 'Draft', 1: 'Cho duyet', 2: 'Da dat',
    3: 'Nhan 1 phan', 4: 'Da nhan', 5: 'Hoan thanh', 6: 'Da huy',
  } as Record<number, string>,
  transitions: [
    { from: 0, to: 1 }, { from: 0, to: 6 }, // Draft -> Pending/Cancel
    { from: 1, to: 2 }, { from: 1, to: 6 }, // Pending -> Ordered/Cancel
    { from: 2, to: 3 }, { from: 2, to: 4 }, // Ordered -> Partial/Received
    { from: 3, to: 4 }, { from: 3, to: 5 }, // Partial -> Received/Completed
    { from: 4, to: 5 }, // Received -> Completed
  ],
});

@Injectable()
export class SuppliersService extends BaseService<SupplierEntity> {
  constructor(
    @InjectRepository(SupplierEntity)
    private readonly supplierRepo: Repository<SupplierEntity>,
    @InjectRepository(PurchaseOrderEntity)
    private readonly poRepo: Repository<PurchaseOrderEntity>,
    @InjectRepository(PurchaseOrderItemEntity)
    private readonly poItemRepo: Repository<PurchaseOrderItemEntity>,
    @InjectRepository(GoodsReceiptEntity)
    private readonly receiptRepo: Repository<GoodsReceiptEntity>,
    @InjectRepository(GoodsReceiptItemEntity)
    private readonly receiptItemRepo: Repository<GoodsReceiptItemEntity>,
    @InjectRepository(InventoryLevelEntity)
    private readonly invLevelRepo: Repository<InventoryLevelEntity>,
    @InjectRepository(InventoryLogEntity)
    private readonly invLogRepo: Repository<InventoryLogEntity>,
  ) {
    super(supplierRepo, 'invSupplierId', 'Nha cung cap');
  }

  // ==================== Suppliers CRUD ====================

  async getSuppliers(query: SupplierQueryDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const qb = this.supplierRepo.createQueryBuilder('s');
    if (query.search) qb.andWhere('(s.invSupplierName LIKE :q OR s.invSupplierCode LIKE :q)', { q: `%${query.search}%` });
    if (query.status !== undefined) qb.andWhere('s.invSupplierStatus = :st', { st: query.status });
    qb.orderBy('s.createdDate', 'DESC');
    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();
    return this.paginate(data, total, page, limit);
  }

  async createSupplier(dto: CreateSupplierDto) {
    const supplier = this.supplierRepo.create({
      invSupplierId: randomUUID(),
      invSupplierCode: dto.code,
      invSupplierName: dto.name,
      invSupplierTaxCode: dto.taxCode || null,
      invSupplierAddress: dto.address || null,
      invSupplierContactName: dto.contactName || null,
      invSupplierPhone: dto.phone || null,
      invSupplierEmail: dto.email || null,
      invSupplierPaymentTerms: dto.paymentTerms || null,
    });
    return this.supplierRepo.save(supplier);
  }

  async updateSupplier(id: string, dto: Partial<CreateSupplierDto>) {
    const supplier = await super.findOne(id);
    if (dto.name) supplier.invSupplierName = dto.name;
    if (dto.phone) supplier.invSupplierPhone = dto.phone;
    if (dto.email) supplier.invSupplierEmail = dto.email;
    if (dto.address) supplier.invSupplierAddress = dto.address;
    if (dto.contactName) supplier.invSupplierContactName = dto.contactName;
    if (dto.paymentTerms) supplier.invSupplierPaymentTerms = dto.paymentTerms;
    return this.supplierRepo.save(supplier);
  }

  async getSupplier(id: string) {
    return super.findOne(id);
  }

  // ==================== Purchase Orders ====================

  async createPO(dto: CreatePurchaseOrderDto, userId: string) {
    const code = await generateEntityCode('PO', this.poRepo);

    // Tinh tong gia tri PO
    const total = dto.items.reduce((sum, i) => sum + i.qty * i.unitCost, 0);

    const po = this.poRepo.create({
      invPurchaseOrderId: randomUUID(),
      invPurchaseOrderCode: code,
      invSupplierId: dto.supplierId,
      invWarehouseId: dto.warehouseId,
      invPurchaseOrderStatus: 0,
      invPurchaseOrderTotal: total,
      invPurchaseOrderExpectedDate: dto.expectedDate || null,
      invPurchaseOrderNotes: dto.notes || null,
      sysUserId: userId,
    });
    await this.poRepo.save(po);

    // Tao items
    for (const item of dto.items) {
      const poItem = this.poItemRepo.create({
        invPurchaseOrderItemId: randomUUID(),
        invPurchaseOrderId: po.invPurchaseOrderId,
        catProductVariantId: item.variantId,
        invPurchaseOrderItemQty: item.qty,
        invPurchaseOrderItemReceivedQty: 0,
        invPurchaseOrderItemUnitCost: item.unitCost,
        invPurchaseOrderItemSupplierSku: item.supplierSku || null,
      });
      await this.poItemRepo.save(poItem);
    }

    return po;
  }

  async getPOs(page = 1, limit = 20, status?: number) {
    const qb = this.poRepo.createQueryBuilder('po');
    if (status !== undefined) qb.andWhere('po.invPurchaseOrderStatus = :s', { s: status });
    qb.orderBy('po.createdDate', 'DESC');
    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();
    return this.paginate(data as any, total, page, limit);
  }

  async getPO(id: string) {
    const po = await this.poRepo.findOne({
      where: { invPurchaseOrderId: id },
      relations: ['items'],
    });
    if (!po) throw new NotFoundException('PO khong ton tai');
    return po;
  }

  async updatePOStatus(id: string, newStatus: number, userId: string) {
    const po = await this.poRepo.findOne({ where: { invPurchaseOrderId: id } });
    if (!po) throw new NotFoundException('PO khong ton tai');

    if (!poMachine.canTransition(po.invPurchaseOrderStatus, newStatus)) {
      throw new BadRequestException(`Khong the chuyen trang thai PO`);
    }

    po.invPurchaseOrderStatus = newStatus;
    if (newStatus === 1) po.sysUserApprovedId = userId;
    return this.poRepo.save(po);
  }

  /**
   * Nhap kho tu PO — cap nhat ton kho + gia von weighted average
   */
  async receiveGoods(poId: string, dto: ReceiveGoodsDto, userId: string) {
    const po = await this.poRepo.findOne({
      where: { invPurchaseOrderId: poId },
      relations: ['items'],
    });
    if (!po) throw new NotFoundException('PO khong ton tai');

    // Tao phieu nhap kho
    const receiptCode = await generateEntityCode('GRN', this.receiptRepo);

    const receipt = this.receiptRepo.create({
      invGoodsReceiptId: randomUUID(),
      invPurchaseOrderId: poId,
      invWarehouseId: dto.warehouseId,
      invGoodsReceiptCode: receiptCode,
      sysUserId: userId,
    });
    await this.receiptRepo.save(receipt);

    // Xu ly tung item
    for (const item of dto.items) {
      // Tao receipt item
      const receiptItem = this.receiptItemRepo.create({
        invGoodsReceiptItemId: randomUUID(),
        invGoodsReceiptId: receipt.invGoodsReceiptId,
        catProductVariantId: item.variantId,
        invGoodsReceiptItemQty: item.receivedQty,
        invGoodsReceiptItemNotes: item.notes || null,
      });
      await this.receiptItemRepo.save(receiptItem);

      // Cap nhat received_qty trong PO item
      const poItem = po.items.find((i) => i.catProductVariantId === item.variantId);
      if (poItem) {
        poItem.invPurchaseOrderItemReceivedQty =
          Number(poItem.invPurchaseOrderItemReceivedQty) + item.receivedQty;
        await this.poItemRepo.save(poItem);
      }

      // Cap nhat ton kho
      let level = await this.invLevelRepo.findOne({
        where: { catProductVariantId: item.variantId, invWarehouseId: dto.warehouseId },
      });
      if (!level) {
        level = this.invLevelRepo.create({
          invInventoryLevelId: randomUUID(),
          catProductVariantId: item.variantId,
          invWarehouseId: dto.warehouseId,
          invInventoryLevelAvailable: 0,
          invInventoryLevelLocked: 0,
        });
      }
      level.invInventoryLevelAvailable = Number(level.invInventoryLevelAvailable) + item.receivedQty;
      await this.invLevelRepo.save(level);

      // Ghi inventory log
      const log = this.invLogRepo.create({
        invInventoryLogId: randomUUID(),
        catProductVariantId: item.variantId,
        invWarehouseId: dto.warehouseId,
        invInventoryLogQty: item.receivedQty,
        invInventoryLogType: 'po_receipt',
        invInventoryLogReason: `Nhap kho tu PO ${po.invPurchaseOrderCode}`,
        invInventoryLogRefId: receipt.invGoodsReceiptId,
        sysUserId: userId,
      });
      await this.invLogRepo.save(log);
    }

    // Kiem tra PO da nhan du chua
    const updatedPO = await this.poRepo.findOne({
      where: { invPurchaseOrderId: poId },
      relations: ['items'],
    });
    if (updatedPO) {
      const allReceived = updatedPO.items.every(
        (i) => Number(i.invPurchaseOrderItemReceivedQty) >= Number(i.invPurchaseOrderItemQty),
      );
      const someReceived = updatedPO.items.some(
        (i) => Number(i.invPurchaseOrderItemReceivedQty) > 0,
      );

      if (allReceived) {
        updatedPO.invPurchaseOrderStatus = 4; // Received
      } else if (someReceived) {
        updatedPO.invPurchaseOrderStatus = 3; // Partially Received
      }
      await this.poRepo.save(updatedPO);
    }

    return receipt;
  }
}
