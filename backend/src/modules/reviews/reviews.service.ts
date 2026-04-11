import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ReviewEntity } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(ReviewEntity)
    private readonly reviewRepo: Repository<ReviewEntity>,
  ) {}

  /** Tao review — chi KH da mua, moi order_item chi 1 lan */
  async create(params: {
    productId: string;
    orderItemId: string;
    customerId: string;
    rating: number;
    content?: string;
    photos?: string[];
  }) {
    // Kiem tra da review chua
    const existing = await this.reviewRepo.findOne({
      where: { salOrderItemId: params.orderItemId },
    });
    if (existing) {
      throw new BadRequestException('Ban da danh gia san pham nay roi');
    }

    const review = this.reviewRepo.create({
      salReviewId: uuidv4(),
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
    const total = await this.reviewRepo.count({
      where: { catProductId: productId, salReviewStatus: 1 },
    });
    const data = await this.reviewRepo.find({
      where: { catProductId: productId, salReviewStatus: 1 },
      order: { createdDate: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, pagination: { page, limit, total, total_pages: Math.ceil(total / limit) } };
  }

  /** Moderation queue — admin */
  async findAllAdmin(page = 1, limit = 20, status?: number) {
    const qb = this.reviewRepo.createQueryBuilder('r');
    if (status !== undefined) qb.andWhere('r.salReviewStatus = :s', { s: status });
    qb.orderBy('r.createdDate', 'DESC');
    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();
    return { data, pagination: { page, limit, total, total_pages: Math.ceil(total / limit) } };
  }

  /** Duyet / Tu choi review */
  async updateStatus(reviewId: string, status: number) {
    const review = await this.reviewRepo.findOne({ where: { salReviewId: reviewId } });
    if (!review) throw new NotFoundException('Review khong ton tai');
    review.salReviewStatus = status;
    return this.reviewRepo.save(review);
  }

  /** Admin reply (Official Reply) */
  async addReply(reviewId: string, content: string, adminId: string) {
    const review = await this.reviewRepo.findOne({ where: { salReviewId: reviewId } });
    if (!review) throw new NotFoundException('Review khong ton tai');
    review.salReviewAdminReply = content;
    review.salReviewAdminReplyDate = new Date();
    review.salReviewAdminReplyBy = adminId;
    return this.reviewRepo.save(review);
  }

  /** Thong ke review — diem TB, phan bo sao */
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
