import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ReturnRequestEntity } from './entities/return-request.entity';
import { ReturnRequestItemEntity } from './entities/return-request-item.entity';
import { ReturnRequestMediaEntity } from './entities/return-request-media.entity';
import { OrderEntity } from '../orders/entities/order.entity';
import { CreateReturnDto, UpdateReturnStatusDto, ReturnQueryDto } from './dto/return-request.dto';
import { StateMachine } from '../../common/patterns/state-machine';
import { generateEntityCode } from '../../common/utils/code-generation.util';
import { BaseService } from '../../common/services/base.service';

/**
 * RMA Status: 0=Requested, 1=Reviewing, 2=Approved, 3=Rejected,
 *             4=Refunding, 5=Refunded, 6=Exchanging, 7=Exchanged
 */
const RMA_STATUS_LABELS: Record<number, string> = {
  0: 'Yeu cau', 1: 'Dang xem xet', 2: 'Da duyet',
  3: 'Tu choi', 4: 'Dang hoan tien', 5: 'Da hoan tien',
  6: 'Dang doi hang', 7: 'Da doi hang',
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
  constructor(
    @InjectRepository(ReturnRequestEntity)
    private readonly returnRepo: Repository<ReturnRequestEntity>,
    @InjectRepository(ReturnRequestItemEntity)
    private readonly itemRepo: Repository<ReturnRequestItemEntity>,
    @InjectRepository(ReturnRequestMediaEntity)
    private readonly mediaRepo: Repository<ReturnRequestMediaEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
  ) {
    super(returnRepo, 'salReturnRequestId', 'Yeu cau doi tra');
  }

  /**
   * Tao yeu cau doi tra — chi cho don hang da giao thanh cong (status=4)
   */
  async create(dto: CreateReturnDto, customerId: string) {
    const order = await this.orderRepo.findOne({
      where: { salOrderId: dto.orderId, sysCustomerId: customerId },
    });
    if (!order) throw new NotFoundException('Don hang khong ton tai');

    // Chi cho phep RMA khi don da giao thanh cong
    if (order.salOrderStatus !== 4) {
      throw new BadRequestException('Chi co the doi tra don hang da giao thanh cong');
    }

    // Kiem tra thoi han 7 ngay
    const daysSinceDelivered = (Date.now() - new Date(order.modifiedDate || order.createdDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceDelivered > 7) {
      throw new BadRequestException('Da qua thoi han 7 ngay de yeu cau doi tra');
    }

    // Tao ma RMA
    const code = await generateEntityCode('RMA', this.returnRepo);

    const returnRequest = this.returnRepo.create({
      salReturnRequestId: uuidv4(),
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

    // Tao items
    for (const item of dto.items) {
      const returnItem = this.itemRepo.create({
        salReturnRequestItemId: uuidv4(),
        salReturnRequestId: returnRequest.salReturnRequestId,
        salOrderItemId: item.orderItemId,
        catProductVariantId: item.orderItemId, // Se duoc map chinh xac tu order_item
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
        `Khong the chuyen tu "${RMA_STATUS_LABELS[rma.salReturnRequestStatus]}" sang "${RMA_STATUS_LABELS[dto.status]}"`,
      );
    }

    await rmaMachine.transition(rma.salReturnRequestStatus, dto.status);

    rma.salReturnRequestStatus = dto.status;
    rma.sysUserId = userId;
    if (dto.staffNotes) rma.salReturnRequestStaffNotes = dto.staffNotes;
    if (dto.refundAmount) rma.salReturnRequestRefundAmount = dto.refundAmount;

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
