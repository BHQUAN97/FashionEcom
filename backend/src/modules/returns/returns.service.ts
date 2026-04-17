import { randomUUID } from 'crypto';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReturnRequestEntity } from './entities/return-request.entity';
import { ReturnRequestItemEntity } from './entities/return-request-item.entity';
import { ReturnRequestMediaEntity } from './entities/return-request-media.entity';
import { OrderEntity } from '../orders/entities/order.entity';
import { OrderItemEntity } from '../orders/entities/order-item.entity';
import { CreateReturnDto, UpdateReturnStatusDto, ReturnQueryDto } from './dto/return-request.dto';
import { StateMachine } from '@/common/patterns/state-machine';
import { generateEntityCode } from '@/common/utils/code-generation.util';
import { BaseService } from '@/common/services/base.service';

/**
 * RMA Status: 0=Requested, 1=Reviewing, 2=Approved, 3=Rejected,
 *             4=Refunding, 5=Refunded, 6=Exchanging, 7=Exchanged
 */
const RMA_STATUS_LABELS: Record<number, string> = {
  0: 'Yêu cầu', 1: 'Đang xem xét', 2: 'Đã duyệt',
  3: 'Từ chối', 4: 'Đang hoàn tiền', 5: 'Đã hoàn tiền',
  6: 'Đang đổi hàng', 7: 'Đã đổi hàng',
};

// State machine cho RMA — reuse pattern chung
const rmaMachine = new StateMachine<number>({
  labels: RMA_STATUS_LABELS,
  transitions: [
    { from: 0, to: 1 }, // Requested -> Reviewing
    { from: 1, to: 2 }, // Reviewing -> Approved
    { from: 1, to: 3 }, // Reviewing -> Rejected
    { from: 2, to: 4 }, // Approved -> Refunding
    { from: 2, to: 6 }, // Approved -> Exchanging
    { from: 4, to: 5 }, // Refunding -> Refunded
    { from: 6, to: 7 }, // Exchanging -> Exchanged
  ],
});

@Injectable()
export class ReturnsService extends BaseService<ReturnRequestEntity> {
  private readonly logger = new Logger(ReturnsService.name);

  constructor(
    @InjectRepository(ReturnRequestEntity)
    private readonly returnRepo: Repository<ReturnRequestEntity>,
    @InjectRepository(ReturnRequestItemEntity)
    private readonly itemRepo: Repository<ReturnRequestItemEntity>,
    @InjectRepository(ReturnRequestMediaEntity)
    private readonly mediaRepo: Repository<ReturnRequestMediaEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepo: Repository<OrderItemEntity>,
  ) {
    super(returnRepo, 'salReturnRequestId', 'Yêu cầu đổi trả');
  }

  /**
   * Tao yeu cau doi tra — chi cho don hang da giao thanh cong (status=4)
   */
  async create(dto: CreateReturnDto, customerId: string) {
    const order = await this.orderRepo.findOne({
      where: { salOrderId: dto.orderId, sysCustomerId: customerId },
    });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    // Chi cho phep RMA khi don da giao thanh cong
    if (order.salOrderStatus !== 4) {
      throw new BadRequestException('Chỉ có thể đổi trả đơn hàng đã giao thành công');
    }

    // Kiem tra thoi han 7 ngay
    const daysSinceDelivered = (Date.now() - new Date(order.modifiedDate || order.createdDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceDelivered > 7) {
      throw new BadRequestException('Đã quá thời hạn 7 ngày để yêu cầu đổi trả');
    }

    // Tao ma RMA
    const code = await generateEntityCode('RMA', this.returnRepo);

    const returnRequest = this.returnRepo.create({
      salReturnRequestId: randomUUID(),
      salReturnRequestCode: code,
      salOrderId: dto.orderId,
      sysCustomerId: customerId,
      salReturnRequestType: dto.type,
      salReturnRequestReason: dto.reason,
      salReturnRequestReasonDetail: dto.reasonDetail || null,
      salReturnRequestStatus: 0,
      salReturnRequestCustomerNotes: dto.customerNotes || null,
    });
    await this.returnRepo.save(returnRequest);

    // Tao items — lookup order item de lay dung variant ID
    for (const item of dto.items) {
      const orderItem = await this.orderItemRepo.findOne({
        where: { salOrderItemId: item.orderItemId },
      });
      if (!orderItem) {
        throw new BadRequestException(`Order item ${item.orderItemId} khong ton tai`);
      }

      // Validate so luong doi tra khong vuot qua so luong da mua
      if (item.qty > Number(orderItem.salOrderItemQty)) {
        throw new BadRequestException(
          `So luong doi tra (${item.qty}) vuot qua so luong da mua (${orderItem.salOrderItemQty})`,
        );
      }
      if (item.qty <= 0) {
        throw new BadRequestException('So luong doi tra phai lon hon 0');
      }

      const returnItem = this.itemRepo.create({
        salReturnRequestItemId: randomUUID(),
        salReturnRequestId: returnRequest.salReturnRequestId,
        salOrderItemId: item.orderItemId,
        catProductVariantId: orderItem.catProductVariantId,
        salReturnRequestItemQty: item.qty,
        salReturnRequestItemExchangeVariantId: item.exchangeVariantId || null,
      });
      await this.itemRepo.save(returnItem);
    }

    return returnRequest;
  }

  /**
   * Chuyen trang thai RMA — su dung state machine pattern
   */
  async updateStatus(id: string, dto: UpdateReturnStatusDto, userId: string) {
    const rma = await super.findOne(id);

    // Validate transition bang state machine
    if (!rmaMachine.canTransition(rma.salReturnRequestStatus, dto.status)) {
      throw new BadRequestException(
        `Không thể chuyển từ "${RMA_STATUS_LABELS[rma.salReturnRequestStatus]}" sang "${RMA_STATUS_LABELS[dto.status]}"`,
      );
    }

    await rmaMachine.transition(rma.salReturnRequestStatus, dto.status);

    rma.salReturnRequestStatus = dto.status;
    rma.sysUserId = userId;
    if (dto.staffNotes) rma.salReturnRequestStaffNotes = dto.staffNotes;

    // BAO MAT: validate refund amount khong vuot order total
    if (dto.refundAmount !== undefined) {
      const order = await this.orderRepo.findOne({
        where: { salOrderId: rma.salOrderId },
      });
      if (order && dto.refundAmount > Number(order.salOrderTotal)) {
        throw new BadRequestException(
          `So tien hoan tra (${dto.refundAmount.toLocaleString()}) khong duoc vuot tong don hang (${Number(order.salOrderTotal).toLocaleString()})`,
        );
      }
      rma.salReturnRequestRefundAmount = dto.refundAmount;
      this.logger.warn(
        `[AUDIT] Refund amount set: rma=${id}, amount=${dto.refundAmount}, by=${userId}`,
      );
    }

    await this.returnRepo.save(rma);

    // Side effects theo trang thai moi
    if (dto.status === 5) {
      // Refunded — cap nhat order status = 6 (Doi Tra)
      await this.orderRepo.update(rma.salOrderId, { salOrderStatus: 6 });
    }

    return rma;
  }

  /**
   * Danh sach RMA — admin
   */
  async findAll(query: ReturnQueryDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);

    const qb = this.returnRepo.createQueryBuilder('r');

    if (query.status !== undefined) {
      qb.andWhere('r.salReturnRequestStatus = :s', { s: query.status });
    }
    if (query.search) {
      qb.andWhere('r.salReturnRequestCode LIKE :q', { q: `%${query.search}%` });
    }

    qb.orderBy('r.createdDate', 'DESC');

    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();

    return this.paginate(data, total, page, limit);
  }

  /**
   * Chi tiet RMA + items + media
   */
  async findOne(id: string) {
    return super.findOne(id, ['items', 'media']);
  }

  /**
   * BAO MAT: Chi cho customer xem RMA cua chinh minh — chong IDOR
   */
  async findOneWithOwnerCheck(id: string, customerId: string) {
    const rma = await this.findOne(id);
    if (rma.sysCustomerId !== customerId) {
      throw new ForbiddenException('Khong co quyen xem yeu cau doi tra nay');
    }
    return rma;
  }

  /**
   * Danh sach RMA cua 1 khach hang
   */
  async findByCustomer(customerId: string) {
    return this.returnRepo.find({
      where: { sysCustomerId: customerId },
      order: { createdDate: 'DESC' },
    });
  }

  /**
   * Them ghi chu noi bo
   */
  async addReply(id: string, staffNotes: string, userId: string) {
    const rma = await super.findOne(id);

    // Append ghi chu moi
    const timestamp = new Date().toISOString();
    const newNote = `[${timestamp}] ${staffNotes}`;
    rma.salReturnRequestStaffNotes = rma.salReturnRequestStaffNotes
      ? `${rma.salReturnRequestStaffNotes}\n${newNote}`
      : newNote;
    rma.sysUserId = userId;

    await this.returnRepo.save(rma);
    return rma;
  }
}
