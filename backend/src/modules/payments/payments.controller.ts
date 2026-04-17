import {
  Controller, Get, Post, Put, Body, Param, Query,
  UseGuards, Req, ForbiddenException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import {
  CreatePaymentDto, PaymentQueryDto, RefundPaymentDto,
  ReviewPaymentDto, UpsertPaymentMethodConfigDto,
} from './dto/create-payment.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserRole } from '@/common/constants/roles.constant';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /** Tao giao dich TT online — Customer, rate limit chong spam */
  @Post('create')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async create(@Body() dto: CreatePaymentDto, @Req() req: Request) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
    const data = await this.paymentsService.createPayment(dto, ip);
    return { data, message: 'OK' };
  }

  // Gateway callback/webhook — hien tai khong su dung (thanh toan thu cong)
  // Giu lai de mo rong khi tich hop gateway tu dong sau nay

  /**
   * Lay danh sach PT thanh toan — cho KH checkout
   * BAO MAT: require auth + rate limit + STK da che
   */
  @Get('methods')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async getPaymentMethods() {
    const data = await this.paymentsService.getActiveMethodConfigsSafe();
    return { data, message: 'OK' };
  }

  /** Query giao dich — Customer (owner) hoac Admin+ */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string; role: number },
  ) {
    const data = await this.paymentsService.findOneWithOwnerCheck(id, user.userId, user.role);
    return { data, message: 'OK' };
  }

  /** Hoan tien — Admin+ */
  @Post(':id/refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async refund(@Param('id') id: string, @Body() dto: RefundPaymentDto) {
    const data = await this.paymentsService.refund(id, dto);
    return { data, message: 'Xu ly hoan tien thanh cong' };
  }
}

/** Admin payment management endpoints */
@Controller('admin/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
export class AdminPaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  async findAll(@Query() query: PaymentQueryDto) {
    return this.paymentsService.findAll(query);
  }

  /** Danh sach don cho duyet thanh toan — Admin/Manager xem, chi Admin duyet */
  @Get('pending-reviews')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async pendingReviews(@Query() query: PaymentQueryDto) {
    return this.paymentsService.findPendingReviews(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.paymentsService.findOne(id);
    return { data, message: 'OK' };
  }

  /**
   * Duyet hoac tu choi thanh toan — CHI SUPER_ADMIN + ADMIN
   * Manager/Staff KHONG co quyen duyet/tu choi
   */
  @Post(':id/review')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async reviewPayment(
    @Param('id') id: string,
    @Body() dto: ReviewPaymentDto,
    @CurrentUser('userId') adminId: string,
  ) {
    const data = await this.paymentsService.reviewPayment(id, dto, adminId);
    return { data, message: dto.action === 'approve' ? 'Duyet thanh toan thanh cong' : 'Da tu choi thanh toan' };
  }

  /**
   * Xem cau hinh QR/STK (day du, khong che) — CHI SUPER_ADMIN + ADMIN
   * Manager/Staff KHONG xem duoc STK goc
   */
  @Get('method-configs')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async getMethodConfigs() {
    const data = await this.paymentsService.getAllMethodConfigs();
    return { data, message: 'OK' };
  }

  /** Cap nhat QR / STK / huong dan — CHI SUPER_ADMIN + ADMIN */
  @Put('method-configs')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async upsertMethodConfig(@Body() dto: UpsertPaymentMethodConfigDto) {
    const data = await this.paymentsService.upsertMethodConfig(dto);
    return { data, message: 'Cap nhat cau hinh thanh toan thanh cong' };
  }
}
