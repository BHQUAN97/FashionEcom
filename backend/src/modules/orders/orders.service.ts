import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { OrderTimelineEntity } from './entities/order-timeline.entity';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderStatusDto } from './dto/update-status.dto';
import { BulkOrderActionDto } from './dto/bulk-action.dto';
import { StateMachine } from '../../common/patterns/state-machine';
import { BaseService } from '../../common/services/base.service';

/**
 * Map trang thai don hang — business rules chuyen trang thai
 * 0=ChoXacNhan, 1=DaXacNhan, 2=DangDongGoi, 3=DangGiao, 4=HoanThanh, 5=DaHuy, 6=DoiTra
 */
const STATUS_LABELS: Record<number, string> = {
  0: 'Cho xac nhan',
  1: 'Da xac nhan',
  2: 'Dang dong goi',
  3: 'Dang giao',
  4: 'Hoan thanh',
  5: 'Da huy',
  6: 'Doi tra',
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

@Injectable()
export class OrdersService extends BaseService<OrderEntity> {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly itemRepo: Repository<OrderItemEntity>,
    @InjectRepository(OrderTimelineEntity)
    private readonly timelineRepo: Repository<OrderTimelineEntity>,
  ) {
    super(orderRepo, 'salOrderId', 'Don hang');
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
    if (query.dateFrom) {
      qb.andWhere('o.createdDate >= :df', { df: query.dateFrom });
    }
    if (query.dateTo) {
      qb.andWhere('o.createdDate <= :dt', { dt: query.dateTo });
    }

    const sortField = query.sort || 'createdDate';
    const sortOrder = query.order || 'DESC';
    qb.orderBy(`o.${sortField}`, sortOrder);

    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();

    // Quick stats — so don theo trang thai
    const statsRaw = await this.orderRepo
      .createQueryBuilder('o')
      .select('o.salOrderStatus', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('o.salOrderStatus')
      .getRawMany();

    const stats = Object.fromEntries(
      statsRaw.map((r) => [r.status, Number(r.count)]),
    );

    return {
      ...this.paginate(data, total, page, limit),
      stats,
    };
  }

  /**
   * Chi tiet don hang + items + timeline
   */
  override async findOne(id: string) {
    const order = await super.findOne(id, ['items', 'timeline']);

    // Sort timeline theo created_date desc
    if (order.timeline) {
      order.timeline.sort((a, b) =>
        new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime(),
      );
    }

    return order;
  }

  /**
   * Cap nhat trang thai don hang — kiem tra business rules + ghi timeline
   */
  async updateStatus(id: string, dto: UpdateOrderStatusDto, actor: string) {
    const order = await super.findOne(id);

    // Kiem tra transition hop le bang state machine
    if (!orderMachine.canTransition(order.salOrderStatus, dto.status)) {
      throw new BadRequestException(
        `Khong the chuyen tu "${STATUS_LABELS[order.salOrderStatus]}" sang "${STATUS_LABELS[dto.status]}"`,
      );
    }

    // Cap nhat trang thai
    order.salOrderStatus = dto.status;
    if (dto.note) order.salOrderInternalNote = dto.note;
    await this.orderRepo.save(order);

    // Ghi timeline entry
    const timeline = this.timelineRepo.create({
      salOrderTimelineId: uuidv4(),
      salOrderId: id,
      salOrderTimelineStep: dto.status,
      salOrderTimelineStatus: STATUS_LABELS[dto.status] || 'unknown',
      salOrderTimelineLabel: STATUS_LABELS[dto.status] || 'Unknown',
      salOrderTimelineNote: dto.note || null,
      salOrderTimelineActor: actor,
    });
    await this.timelineRepo.save(timeline);

    return order;
  }

  /**
   * Xac nhan / huy hang loat don hang
   */
  async bulkAction(dto: BulkOrderActionDto, actor: string) {
    let newStatus: number;
    if (dto.action === 'confirm') newStatus = 1;
    else if (dto.action === 'cancel') newStatus = 5;
    else throw new BadRequestException('Action khong hop le');

    let count = 0;
    for (const id of dto.ids) {
      try {
        await this.updateStatus(id, { status: newStatus }, actor);
        count++;
      } catch {
        // Bo qua don khong hop le (VD: da xac nhan roi)
      }
    }

    return { processed: count, total: dto.ids.length };
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
}
