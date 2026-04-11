import {
  Controller, Get, Post, Body, Param, Query,
  UseGuards, Req,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, PaymentQueryDto, RefundPaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/roles.constant';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /** Tao giao dich TT online — Customer */
  @Post('create')
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreatePaymentDto, @Req() req: Request) {
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
    const data = await this.paymentsService.createPayment(dto, ip);
    return { data };
  }

  /** Return URL callback (GET redirect) tu gateway */
  @Get('callback/:gateway')
  async callback(
    @Param('gateway') gateway: string,
    @Query() queryParams: Record<string, unknown>,
  ) {
    const data = await this.paymentsService.handleCallback(gateway, queryParams);
    return { data };
  }

  /** Webhook/IPN callback tu gateway (POST) */
  @Post('webhook/:gateway')
  async webhook(
    @Param('gateway') gateway: string,
    @Body() payload: Record<string, unknown>,
  ) {
    const signature = String(payload.signature || payload.vnp_SecureHash || payload.mac || '');
    const data = await this.paymentsService.handleWebhook(gateway, payload, signature);
    return { data };
  }

  /** Query giao dich — Customer (owner) */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    const data = await this.paymentsService.findOne(id);
    return { data };
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

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.paymentsService.findOne(id);
    return { data };
  }
}
