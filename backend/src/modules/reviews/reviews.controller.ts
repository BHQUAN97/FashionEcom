import {
  Controller, Get, Post, Patch, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewStatusDto } from './dto/update-review-status.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserRole } from '@/common/constants/roles.constant';

/** Customer + Public endpoints */
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /** Rate limit: 5 reviews/phut — chong spam */
  @Post('reviews')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async create(
    @Body() dto: CreateReviewDto,
    @CurrentUser('userId') customerId: string,
  ) {
    const data = await this.reviewsService.create({
      ...dto,
      customerId,
    });
    return { data, message: 'Gửi đánh giá thành công, đang chờ duyệt' };
  }

  @Get('products/:id/reviews')
  async findByProduct(
    @Param('id') productId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.reviewsService.findByProduct(productId, page, limit);
  }
}

/** Admin moderation */
@Controller('admin/reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
export class AdminReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: number,
  ) {
    return this.reviewsService.findAllAdmin(page, limit, status);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateReviewStatusDto) {
    const data = await this.reviewsService.updateStatus(id, dto.status);
    return { data, message: 'Cập nhật trạng thái review thành công' };
  }

  @Post(':id/reply')
  async reply(
    @Param('id') id: string,
    @Body('content') content: string,
    @CurrentUser('userId') adminId: string,
  ) {
    const data = await this.reviewsService.addReply(id, content, adminId);
    return { data, message: 'Phản hồi review thành công' };
  }

  @Get('stats')
  async stats() {
    const data = await this.reviewsService.getStats();
    return { data, message: 'OK' };
  }
}
