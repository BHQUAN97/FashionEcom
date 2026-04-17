import { randomUUID } from 'crypto';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource, QueryRunner } from 'typeorm';
import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { OrderTimelineEntity } from './entities/order-timeline.entity';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderStatusDto } from './dto/update-status.dto';
import { UpdateShippingStatusDto } from './dto/update-shipping-status.dto';
import { BulkOrderActionDto, BulkShippingStatusDto, QuickOrderActionDto } from './dto/bulk-action.dto';
import { UpdateOrderShippingDto } from './dto/shipping.dto';
import { StateMachine } from '@/common/patterns/state-machine';
import { safeSortField, safeSortOrder } from '@/common/utils/safe-sort.util';
import { BaseService } from '@/common/services/base.service';

/**
 * Map trang thai don hang — business rules chuyen trang thai
 * 0=ChoXacNhan, 1=DaXacNhan, 2=DangDongGoi, 3=DangGiao, 4=HoanThanh, 5=DaHuy, 6=DoiTra
 */
const STATUS_LABELS: Record<number, string> = {
  0: 'Chờ xác nhận',
  1: 'Đã xác nhận',
  2: 'Đang đóng gói',
  3: 'Đang giao',
  4: 'Hoàn thành',
  5: 'Đã hủy',
  6: 'Đổi trả',
};

// State machine cho don hang — reuse pattern chung
const orderMachine = new StateMachine<number>({
  labels: STATUS_LABELS,
  transitions: [
    { from: 0, to: 1 }, { from: 0, to: 5 },   // ChoXacNhan -> DaXacNhan hoac DaHuy
    { from: 1, to: 2 }, { from: 1, to: 5 },   // DaXacNhan -> DangDongGoi hoac DaHuy
    { from: 2, to: 3 }, { from: 2, to: 5 },   // DangDongGoi -> DangGiao hoac DaHuy
    { from: 3, to: 4 }, { from: 3, to: 6 },   // DangGiao -> HoanThanh hoac DoiTra
    { from: 4, to: 6 },                         // HoanThanh -> DoiTra
  ],
});

/**
 * Trang thai van chuyen — delivery flow rieng biet
 * 0=ChuaGiao → 1=ChoLayHang → 2=DaLayHang → 3=DangVanChuyen → 4=DangGiao → 5=GiaoThanhCong
 * Nhanh su co: 4→6 GiaoThatBai, 6→7 DangGiaoLai, 6→8 HoanHang
 * Su co nang: 3/4→9 MatHang, 3/4→10 HuHong
 */
export const SHIPPING_STATUS_LABELS: Record<number, string> = {
  0: 'Chưa giao',
  1: 'Chờ lấy hàng',
  2: 'Đã lấy hàng',
  3: 'Đang vận chuyển',
  4: 'Đang giao',
  5: 'Giao thành công',
  6: 'Giao thất bại',
  7: 'Đang giao lại',
  8: 'Hoàn hàng',
  9: 'Mất hàng',
  10: 'Hư hỏng',
};

const shippingMachine = new StateMachine<number>({
  labels: SHIPPING_STATUS_LABELS,
  transitions: [
    // Happy path
    { from: 0, to: 1 },   // ChuaGiao -> ChoLayHang
    { from: 1, to: 2 },   // ChoLayHang -> DaLayHang
    { from: 2, to: 3 },   // DaLayHang -> DangVanChuyen
    { from: 3, to: 4 },   // DangVanChuyen -> DangGiao
    { from: 4, to: 5 },   // DangGiao -> GiaoThanhCong

    // Giao that bai (KH tu choi, vang nha, dia chi sai)
    { from: 4, to: 6 },   // DangGiao -> GiaoThatBai

    // Sau giao that bai
    { from: 6, to: 7 },   // GiaoThatBai -> DangGiaoLai
    { from: 6, to: 8 },   // GiaoThatBai -> HoanHang (tra ve kho)

    // Giao lai thanh cong hoac that bai tiep
    { from: 7, to: 5 },   // DangGiaoLai -> GiaoThanhCong
    { from: 7, to: 6 },   // DangGiaoLai -> GiaoThatBai (lan 2, 3)

    // Su co nang — tu dang van chuyen hoac dang giao
    { from: 3, to: 9 },   // DangVanChuyen -> MatHang
    { from: 3, to: 10 },  // DangVanChuyen -> HuHong
    { from: 4, to: 9 },   // DangGiao -> MatHang
    { from: 4, to: 10 },  // DangGiao -> HuHong
  ],
});

@Injectable()
export class OrdersService extends BaseService<OrderEntity> {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly itemRepo: Repository<OrderItemEntity>,
    @InjectRepository(OrderTimelineEntity)
    private readonly timelineRepo: Repository<OrderTimelineEntity>,
    private readonly dataSource: DataSource,
  ) {
    super(orderRepo, 'salOrderId', 'Đơn hàng');
  }

  /**
   * Danh sach don hang + filter + pagination
   */
  async findAll(query: OrderQueryDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);

    const qb = this.orderRepo.createQueryBuilder('o');

    if (query.search) {
      qb.andWhere('(o.salOrderCode LIKE :s)', { s: `%${query.search}%` });
    }
    if (query.status !== undefined) {
      qb.andWhere('o.salOrderStatus = :status', { status: query.status });
    }
    if (query.paymentStatus !== undefined) {
      qb.andWhere('o.salOrderPaymentStatus = :ps', { ps: query.paymentStatus });
    }
    if (query.paymentType !== undefined) {
      qb.andWhere('o.salOrderPaymentType = :pt', { pt: query.paymentType });
    }
    if (query.shippingStatus !== undefined) {
      qb.andWhere('o.salOrderShippingStatus = :ss', { ss: query.shippingStatus });
    }
    if (query.hasIncident !== undefined) {
      qb.andWhere('o.salOrderHasIncident = :hi', { hi: query.hasIncident });
    }
    if (query.dateFrom) {
      qb.andWhere('o.createdDate >= :df', { df: query.dateFrom });
    }
    if (query.dateTo) {
      qb.andWhere('o.createdDate <= :dt', { dt: query.dateTo });
    }

    // Sort — whitelist validation chong SQL injection
    const sortField = safeSortField(query.sort, 'order', 'createdDate');
    const sortOrder = safeSortOrder(query.order);
    qb.orderBy(`o.${sortField}`, sortOrder);

    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();

    // Quick stats — so don theo trang thai don hang (chi 90 ngay gan nhat)
    // Gioi han 90 ngay de tranh scan toan bo bang sal_order khi data lon
    const statsRaw = await this.orderRepo
      .createQueryBuilder('o')
      .select('o.salOrderStatus', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('o.createdDate >= (NOW() - INTERVAL 90 DAY)')
      .groupBy('o.salOrderStatus')
      .getRawMany();

    const stats = Object.fromEntries(
      statsRaw.map((r) => [r.status, Number(r.count)]),
    );

    // Shipping stats — so don theo trang thai van chuyen (chi 90 ngay gan nhat)
    const shippingStatsRaw = await this.orderRepo
      .createQueryBuilder('o')
      .select('o.salOrderShippingStatus', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('o.salOrderStatus IN (3, 4)') // Chi don dang giao + hoan thanh
      .andWhere('o.createdDate >= (NOW() - INTERVAL 90 DAY)')
      .groupBy('o.salOrderShippingStatus')
      .getRawMany();

    const shippingStats = Object.fromEntries(
      shippingStatsRaw.map((r) => [r.status, Number(r.count)]),
    );

    // So don co su co (chi 90 ngay gan nhat) — tranh full table scan
    const incidentCount = await this.orderRepo
      .createQueryBuilder('o')
      .where('o.salOrderHasIncident = :hi', { hi: 1 })
      .andWhere('o.createdDate >= (NOW() - INTERVAL 90 DAY)')
      .getCount();

    return {
      ...this.paginate(data, total, page, limit),
      stats,
      shippingStats,
      incidentCount,
    };
  }

  /**
   * Chi tiet don hang + items + timeline
   * Timeline: chi lay 20 entry moi nhat de tranh scan toan bo lich su
   */
  override async findOne(id: string) {
    // Load order + items; timeline query rieng co LIMIT 20
    const order = await super.findOne(id, ['items']);

    // Lay 20 timeline entry moi nhat (DESC) — tranh load hang tram entries khi don co lich su dai
    const timeline = await this.timelineRepo.find({
      where: { salOrderId: id },
      order: { createdDate: 'DESC' },
      take: 20,
    });
    order.timeline = timeline;

    return order;
  }

  /**
   * Cap nhat trang thai don hang — kiem tra business rules + ghi timeline
   * Wrap transaction: update order + insert timeline phai atomic (rollback neu 1 buoc fail)
   */
  async updateStatus(id: string, dto: UpdateOrderStatusDto, actor: string) {
    const order = await super.findOne(id);

    // Kiem tra transition hop le bang state machine
    if (!orderMachine.canTransition(order.salOrderStatus, dto.status)) {
      throw new BadRequestException(
        `Không thể chuyển từ "${STATUS_LABELS[order.salOrderStatus]}" sang "${STATUS_LABELS[dto.status]}"`,
      );
    }

    // Cap nhat trang thai
    order.salOrderStatus = dto.status;
    if (dto.note) order.salOrderInternalNote = dto.note;

    // Auto-sync shipping status khi order chuyen trang thai
    if (dto.status === 3 && order.salOrderShippingStatus === 0) {
      // DangGiao → auto set shipping = ChoLayHang
      order.salOrderShippingStatus = 1;
    }

    // Transaction: order save + timeline insert phai cung thanh cong hoac cung rollback
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(OrderEntity, order);

      // Ghi timeline entry trong cung transaction
      const timeline = this.timelineRepo.create({
        salOrderTimelineId: randomUUID(),
        salOrderId: id,
        salOrderTimelineStep: dto.status,
        salOrderTimelineStatus: STATUS_LABELS[dto.status] || 'unknown',
        salOrderTimelineLabel: STATUS_LABELS[dto.status] || 'Unknown',
        salOrderTimelineNote: dto.note || null,
        salOrderTimelineActor: actor,
      });
      await queryRunner.manager.save(OrderTimelineEntity, timeline);

      await queryRunner.commitTransaction();
      return order;
    } catch (err) {
      // Rollback toan bo neu co loi o bat ky buoc nao
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Bulk action trang thai don hang — confirm, cancel, packing, shipping
   */
  async bulkAction(dto: BulkOrderActionDto, actor: string) {
    const ACTION_MAP: Record<string, number> = {
      confirm: 1,
      pack: 2, packing: 2,
      ship: 3, shipping: 3,
      complete: 4,
      cancel: 5,
    };
    const newStatus = ACTION_MAP[dto.action];
    if (newStatus === undefined) {
      throw new BadRequestException(
        `Action "${dto.action}" khong hop le. Cho phep: confirm, packing, shipping, complete, cancel`,
      );
    }

    const details: { id: string; success: boolean; error?: string }[] = [];
    let processed = 0;
    let failed = 0;

    for (const id of dto.ids) {
      try {
        await this.updateStatus(id, { status: newStatus }, actor);
        details.push({ id, success: true });
        processed++;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        details.push({ id, success: false, error: message });
        failed++;
      }
    }

    return { processed, failed, total: dto.ids.length, details };
  }

  /**
   * Bulk update trang thai van chuyen cho nhieu don hang
   * Xu ly tung don, ghi lai ket qua chi tiet
   */
  async bulkShippingStatus(dto: BulkShippingStatusDto, actor: string) {
    const details: { id: string; success: boolean; error?: string }[] = [];
    let processed = 0;
    let failed = 0;

    for (const id of dto.ids) {
      try {
        await this.updateShippingStatus(id, {
          status: dto.status,
          note: dto.note,
          trackingCode: dto.trackingCode,
        }, actor);
        details.push({ id, success: true });
        processed++;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        details.push({ id, success: false, error: message });
        failed++;
      }
    }

    this.logger.log(
      `[AUDIT] Bulk shipping status: status=${SHIPPING_STATUS_LABELS[dto.status]}, ` +
      `total=${dto.ids.length}, processed=${processed}, failed=${failed}, actor=${actor}`,
    );

    return { processed, failed, total: dto.ids.length, details };
  }

  /**
   * Quick action cho 1 don — chuyen trang thai nhanh bang action name
   * Gom ca order status + shipping status trong 1 endpoint
   */
  async quickAction(id: string, dto: QuickOrderActionDto, actor: string) {
    // Order status actions — chap nhan ca dang ngan (pack) va dai (packing)
    const ORDER_ACTIONS: Record<string, number> = {
      confirm: 1, pack: 2, packing: 2, ship: 3, shipping: 3, complete: 4, cancel: 5,
    };

    // Shipping status actions
    const SHIPPING_ACTIONS: Record<string, number> = {
      pickup: 1,       // Cho lay hang
      picked: 2,       // Da lay hang
      in_transit: 3,   // Dang van chuyen
      delivering: 4,   // Dang giao
      delivered: 5,    // Giao thanh cong
      failed: 6,       // Giao that bai
      re_deliver: 7,   // Dang giao lai
      return: 8,       // Hoan hang
      lost: 9,         // Mat hang
      damaged: 10,     // Hu hong
    };

    if (ORDER_ACTIONS[dto.action] !== undefined) {
      return this.updateStatus(id, { status: ORDER_ACTIONS[dto.action], note: dto.note }, actor);
    }

    if (SHIPPING_ACTIONS[dto.action] !== undefined) {
      return this.updateShippingStatus(id, {
        status: SHIPPING_ACTIONS[dto.action],
        note: dto.note,
        trackingCode: dto.trackingCode,
      }, actor);
    }

    throw new BadRequestException(
      `Action "${dto.action}" khong hop le. ` +
      `Order: ${Object.keys(ORDER_ACTIONS).join(', ')}. ` +
      `Shipping: ${Object.keys(SHIPPING_ACTIONS).join(', ')}`,
    );
  }

  /**
   * Lay timeline cua don hang
   */
  async getTimeline(orderId: string) {
    return this.timelineRepo.find({
      where: { salOrderId: orderId },
      order: { createdDate: 'DESC' },
    });
  }

  /**
   * Cap nhat trang thai van chuyen — state machine rieng biet
   * Auto-sync: GiaoThanhCong → order HoanThanh, HoanHang/MatHang/HuHong → tao su co
   * Wrap transaction: update order + timeline + inventory adjustment phai atomic
   */
  async updateShippingStatus(id: string, dto: UpdateShippingStatusDto, actor: string) {
    const order = await super.findOne(id);

    // Khong cho cap nhat van chuyen khi don da huy hoac chua xac nhan
    if (order.salOrderStatus === 5) {
      throw new BadRequestException('Khong the cap nhat van chuyen cho don hang da huy');
    }
    if (order.salOrderStatus === 0) {
      throw new BadRequestException('Khong the cap nhat van chuyen cho don hang chua xac nhan');
    }

    // Validate transition
    if (!shippingMachine.canTransition(order.salOrderShippingStatus, dto.status)) {
      throw new BadRequestException(
        `Không thể chuyển từ "${SHIPPING_STATUS_LABELS[order.salOrderShippingStatus]}" sang "${SHIPPING_STATUS_LABELS[dto.status]}"`,
      );
    }

    const oldStatus = order.salOrderShippingStatus;
    order.salOrderShippingStatus = dto.status;

    // Tracking code
    if (dto.trackingCode) {
      order.salOrderTrackingCode = dto.trackingCode;
    }

    // Load items truoc transaction — read-only, khong can nam trong TX
    const items = await this.itemRepo.find({ where: { salOrderId: id } });

    // Transaction: update order + ghi timeline + adjust inventory (neu hoan hang) phai atomic
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Luu order voi shipping status moi
      await queryRunner.manager.save(OrderEntity, order);

      // 2. Ghi timeline trong cung transaction
      const timeline = this.timelineRepo.create({
        salOrderTimelineId: randomUUID(),
        salOrderId: id,
        salOrderTimelineStep: order.salOrderStatus,
        salOrderTimelineStatus: `Ship: ${SHIPPING_STATUS_LABELS[dto.status]}`,
        salOrderTimelineLabel: `${SHIPPING_STATUS_LABELS[oldStatus]} → ${SHIPPING_STATUS_LABELS[dto.status]}`,
        salOrderTimelineNote: dto.note || null,
        salOrderTimelineActor: actor,
      });
      await queryRunner.manager.save(OrderTimelineEntity, timeline);

      // 3. Inventory impact — hoan hang cong lai ton kho (cung trong TX)
      if (dto.status === 8) {
        for (const item of items) {
          await this.adjustInventoryForShipping(
            queryRunner,
            item.catProductVariantId,
            Math.round(Number(item.salOrderItemQty)),
            `Hoàn hàng đơn ${order.salOrderCode}`,
            actor,
          );
        }
        this.logger.warn(
          `[AUDIT] Inventory restored: order=${order.salOrderCode}, ${items.length} items returned to stock`,
        );
      }

      // 4. Auto-sync order status: Giao thanh cong → Don hoan thanh
      // Cung trong TX: update order + timeline cho status moi
      if (dto.status === 5 && order.salOrderStatus === 3) {
        order.salOrderStatus = 4;
        await queryRunner.manager.save(OrderEntity, order);

        const completeTimeline = this.timelineRepo.create({
          salOrderTimelineId: randomUUID(),
          salOrderId: id,
          salOrderTimelineStep: 4,
          salOrderTimelineStatus: STATUS_LABELS[4],
          salOrderTimelineLabel: STATUS_LABELS[4],
          salOrderTimelineNote: 'Auto-hoan thanh: giao thanh cong',
          salOrderTimelineActor: actor,
        });
        await queryRunner.manager.save(OrderTimelineEntity, completeTimeline);
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    // Mat hang / hu hong → chi ghi log, khong write DB (da xuat kho khi giao)
    if (dto.status === 9 || dto.status === 10) {
      const reason = dto.status === 9 ? 'Mất hàng' : 'Hư hỏng vận chuyển';
      for (const item of items) {
        this.logger.warn(
          `[AUDIT] Inventory loss: order=${order.salOrderCode}, variant=${item.catProductVariantId}, ` +
          `qty=${item.salOrderItemQty}, reason=${reason}`,
        );
      }
    }

    this.logger.log(
      `[AUDIT] Shipping status: order=${order.salOrderCode}, ${SHIPPING_STATUS_LABELS[oldStatus]}→${SHIPPING_STATUS_LABELS[dto.status]}, actor=${actor}`,
    );

    return order;
  }

  /**
   * Cong/tru ton kho khi shipping status thay doi
   * Dung raw SQL de goi truc tiep — tranh circular dependency voi InventoryService
   * Chay qua queryRunner.manager de nam trong transaction cua caller
   */
  private async adjustInventoryForShipping(
    queryRunner: QueryRunner,
    variantId: string,
    qty: number,
    note: string,
    actor: string,
  ) {
    const manager = queryRunner.manager;

    // Tim kho mac dinh (kho dau tien co ton)
    const [warehouse] = await manager.query(
      `SELECT inv_warehouse_id FROM inv_inventory_level
       WHERE cat_product_variant_id = ? AND inv_inventory_level_available > 0
       ORDER BY inv_inventory_level_available DESC LIMIT 1`,
      [variantId],
    );

    if (!warehouse) {
      // Khong tim thay kho → lay kho dau tien
      const [defaultWh] = await manager.query(
        `SELECT inv_warehouse_id FROM inv_warehouse WHERE inv_warehouse_status = 1 LIMIT 1`,
      );
      if (!defaultWh) return;

      // Tao inventory level moi
      await manager.query(
        `INSERT INTO inv_inventory_level (inv_inventory_level_id, cat_product_variant_id, inv_warehouse_id, inv_inventory_level_available, inv_inventory_level_locked)
         VALUES (UUID(), ?, ?, ?, 0)
         ON DUPLICATE KEY UPDATE inv_inventory_level_available = inv_inventory_level_available + ?`,
        [variantId, defaultWh.inv_warehouse_id, qty, qty],
      );
      return;
    }

    // Update ton kho
    await manager.query(
      `UPDATE inv_inventory_level SET inv_inventory_level_available = inv_inventory_level_available + ?
       WHERE cat_product_variant_id = ? AND inv_warehouse_id = ?`,
      [qty, variantId, warehouse.inv_warehouse_id],
    );

    // Ghi log
    await manager.query(
      `INSERT INTO inv_inventory_log (inv_inventory_log_id, cat_product_variant_id, inv_warehouse_id, inv_inventory_log_qty, inv_inventory_log_type, inv_inventory_log_reason, inv_inventory_log_note, sys_user_id)
       VALUES (UUID(), ?, ?, ?, 'shipping_return', 'return', ?, ?)`,
      [variantId, warehouse.inv_warehouse_id, qty, note, actor],
    );
  }

  /**
   * Cap nhat phi ship cho don hang — admin override
   * Tu dong recalc order total
   */
  async updateShipping(id: string, dto: UpdateOrderShippingDto, actor: string) {
    const order = await super.findOne(id);

    // Chi cho edit don chua hoan thanh/huy
    if (order.salOrderStatus >= 4) {
      throw new BadRequestException('Khong the sua phi ship don da hoan thanh hoac da huy');
    }

    const oldFee = Number(order.salOrderShippingFee);
    const oldActual = Number(order.salOrderShippingCostActual);

    // Cap nhat phi ship
    order.salOrderShippingFee = dto.shippingFee;
    order.salOrderShippingCostActual = dto.shippingCostActual;

    if (dto.freeShip !== undefined) {
      order.salOrderFreeShip = dto.freeShip;
    }

    if (dto.shippingProvider) {
      order.salOrderShippingProvider = dto.shippingProvider;
    }

    // Recalc order total: subtotal - discount + shippingFee
    order.salOrderTotal = Number(order.salOrderSubtotal) - Number(order.salOrderDiscount) + dto.shippingFee;

    if (dto.note) {
      const timestamp = new Date().toISOString();
      const noteEntry = `[${timestamp}] Ship edit: ${oldFee}→${dto.shippingFee} (actual: ${oldActual}→${dto.shippingCostActual}) by ${actor}. ${dto.note}`;
      order.salOrderInternalNote = order.salOrderInternalNote
        ? `${order.salOrderInternalNote}\n${noteEntry}`
        : noteEntry;
    }

    // Transaction: update order + ghi timeline cung thanh cong hoac cung rollback
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(OrderEntity, order);

      const timeline = this.timelineRepo.create({
        salOrderTimelineId: randomUUID(),
        salOrderId: id,
        salOrderTimelineStep: order.salOrderStatus,
        salOrderTimelineStatus: 'Cập nhật phí ship',
        salOrderTimelineLabel: `Phí ship: ${oldFee.toLocaleString()}đ → ${dto.shippingFee.toLocaleString()}đ`,
        salOrderTimelineNote: dto.note || null,
        salOrderTimelineActor: actor,
      });
      await queryRunner.manager.save(OrderTimelineEntity, timeline);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    this.logger.log(
      `[AUDIT] Order shipping updated: order=${order.salOrderCode}, fee=${oldFee}->${dto.shippingFee}, ` +
      `actual=${oldActual}->${dto.shippingCostActual}, freeShip=${order.salOrderFreeShip}, actor=${actor}`,
    );

    return order;
  }
}
