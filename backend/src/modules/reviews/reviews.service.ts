import { randomUUID } from 'crypto';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewEntity } from './entities/review.entity';
import { OrderItemEntity } from '../orders/entities/order-item.entity';
import { OrderEntity } from '../orders/entities/order.entity';
import { BaseService } from '@/common/services/base.service';
import { StateMachine } from '@/common/patterns/state-machine';

/**
 * Review moderation status: 0=Chờ duyệt, 1=Đã duyệt, 2=Từ chối
 */
const REVIEW_STATUS_LABELS: Record<number, string> = {
  0: 'Chờ duyệt',
  1: 'Đã duyệt',
  2: 'Từ chối',
};

const reviewMachine = new StateMachine<number>({
  labels: REVIEW_STATUS_LABELS,
  transitions: [
    { from: 0, to: 1 }, // Chờ duyệt -> Đã duyệt
    { from: 0, to: 2 }, // Chờ duyệt -> Từ chối
    { from: 2, to: 1 }, // Từ chối -> Đã duyệt (re-approve)
    { from: 1, to: 2 }, // Đã duyệt -> Từ chối (revoke)
  ],
});

@Injectable()
export class ReviewsService extends BaseService<ReviewEntity> {
  constructor(
    @InjectRepository(ReviewEntity)
    private readonly reviewRepo: Repository<ReviewEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepo: Repository<OrderItemEntity>,
    @InjectRepository(OrderEntity)
    private readonly orderRepo: Repository<OrderEntity>,
  ) {
    super(reviewRepo, 'salReviewId', 'Đánh giá');
  }

  /** Tao review — chi KH da mua, verify ownership, moi order_item chi 1 lan */
  async create(params: {
    productId: string;
    orderItemId: string;
    customerId: string;
    rating: number;
    content?: string;
    photos?: string[];
  }) {
    // BAO MAT: Verify order item thuoc ve customer nay — chong IDOR/fake review
    const orderItem = await this.orderItemRepo.findOne({
      where: { salOrderItemId: params.orderItemId },
    });
    if (!orderItem) {
      throw new BadRequestException('Order item khong ton tai');
    }

    const order = await this.orderRepo.findOne({
      where: { salOrderId: orderItem.salOrderId },
    });
    if (!order || order.sysCustomerId !== params.customerId) {
      throw new ForbiddenException('Ban khong co quyen danh gia san pham nay');
    }

    // Kiem tra don hang da giao thanh cong (status=4) moi cho review
    if (order.salOrderStatus !== 4 && order.salOrderStatus !== 6) {
      throw new BadRequestException('Chi co the danh gia don hang da giao thanh cong');
    }

    // Kiem tra da review chua
    const existing = await this.reviewRepo.findOne({
      where: { salOrderItemId: params.orderItemId },
    });
    if (existing) {
      throw new BadRequestException('Bạn đã đánh giá sản phẩm này rồi');
    }

    const review = this.reviewRepo.create({
      salReviewId: randomUUID(),
      catProductId: params.productId,
      salOrderItemId: params.orderItemId,
      sysCustomerId: params.customerId,
      salReviewRating: params.rating,
      salReviewContent: params.content || null,
      salReviewPhotos: params.photos || null,
      salReviewStatus: 0, // Pending moderation
    });
    return this.reviewRepo.save(review);
  }

  /** Danh sach review cua san pham — chi hien approved */
  async findByProduct(productId: string, page = 1, limit = 10) {
    const [data, total] = await this.reviewRepo.findAndCount({
      where: { catProductId: productId, salReviewStatus: 1 },
      order: { createdDate: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return this.paginate(data, total, page, limit);
  }

  /** Moderation queue — admin */
  async findAllAdmin(page = 1, limit = 20, status?: number) {
    const qb = this.reviewRepo.createQueryBuilder('r');
    if (status !== undefined) qb.andWhere('r.salReviewStatus = :s', { s: status });
    qb.orderBy('r.createdDate', 'DESC');
    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();
    return this.paginate(data, total, page, limit);
  }

  /** Duyệt / Từ chối review — validate bằng state machine */
  async updateStatus(reviewId: string, status: number) {
    const review = await super.findOne(reviewId);

    if (!reviewMachine.canTransition(review.salReviewStatus, status)) {
      throw new BadRequestException(
        `Không thể chuyển từ "${REVIEW_STATUS_LABELS[review.salReviewStatus]}" sang "${REVIEW_STATUS_LABELS[status]}"`,
      );
    }

    review.salReviewStatus = status;
    return this.reviewRepo.save(review);
  }

  /** Admin reply (Official Reply) */
  async addReply(reviewId: string, content: string, adminId: string) {
    const review = await super.findOne(reviewId);
    review.salReviewAdminReply = content;
    review.salReviewAdminReplyDate = new Date();
    review.salReviewAdminReplyBy = adminId;
    return this.reviewRepo.save(review);
  }

  /** Thống kê review — điểm TB, phân bố sao */
  async getStats() {
    const totalResult = await this.reviewRepo
      .createQueryBuilder('r')
      .select('COUNT(*)', 'total')
      .addSelect('AVG(r.salReviewRating)', 'avg')
      .where('r.salReviewStatus = 1')
      .getRawOne();

    const distResult = await this.reviewRepo
      .createQueryBuilder('r')
      .select('r.salReviewRating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('r.salReviewStatus = 1')
      .groupBy('r.salReviewRating')
      .getRawMany();

    const distribution = Object.fromEntries(
      distResult.map((r: { rating: string; count: string }) => [r.rating, Number(r.count)]),
    );

    return {
      totalReviews: Number(totalResult?.total || 0),
      avgRating: Number(Number(totalResult?.avg || 0).toFixed(1)),
      distribution,
    };
  }
}
