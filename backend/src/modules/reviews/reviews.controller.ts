import {
  Controller, Get, Post, Patch, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/roles.constant';

/** Customer + Public endpoints */
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('reviews')
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() body: {
      productId: string;
      orderItemId: string;
      rating: number;
      content?: string;
      photos?: string[];
    },
    @CurrentUser('sub') customerId: string,
  ) {
    const data = await this.reviewsService.create({
      ...body,
      customerId,
    });
    return { data, message: 'Gui danh gia thanh cong, dang cho duyet' };
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
  async updateStatus(@Param('id') id: string, @Body('status') status: number) {
    const data = await this.reviewsService.updateStatus(id, status);
    return { data, message: 'Cap nhat trang thai review thanh cong' };
  }

  @Post(':id/reply')
  async reply(
    @Param('id') id: string,
    @Body('content') content: string,
    @CurrentUser('sub') adminId: string,
  ) {
    const data = await this.reviewsService.addReply(id, content, adminId);
    return { data, message: 'Phan hoi review thanh cong' };
  }

  @Get('stats')
  async stats() {
    const data = await this.reviewsService.getStats();
    return { data };
  }
}
