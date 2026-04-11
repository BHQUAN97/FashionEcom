import {
  Controller, Get, Post, Put, Body, Query, UseGuards,
} from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';
import { RedeemPointsDto, AdjustPointsDto, UpdateLoyaltyConfigDto } from './dto/loyalty.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/roles.constant';

/** Customer endpoints */
@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get('balance')
  @UseGuards(JwtAuthGuard)
  async getBalance(@CurrentUser('sub') customerId: string) {
    const data = await this.loyaltyService.getBalance(customerId);
    return { data };
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  async getTransactions(
    @CurrentUser('sub') customerId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.loyaltyService.getTransactions(customerId, page, limit);
  }

  @Post('redeem')
  @UseGuards(JwtAuthGuard)
  async redeem(
    @Body() dto: RedeemPointsDto,
    @CurrentUser('sub') customerId: string,
  ) {
    const data = await this.loyaltyService.redeem(dto, customerId);
    return { data };
  }

  @Get('tiers')
  async getTiers() {
    const config = await this.loyaltyService.getConfig();
    return {
      data: [
        { name: 'Member', threshold: 0, multiplier: 0 },
        { name: 'Silver', threshold: config.prmLoyaltyConfigSilverThreshold, multiplier: 0.10 },
        { name: 'Gold', threshold: config.prmLoyaltyConfigGoldThreshold, multiplier: 0.20 },
        { name: 'Platinum', threshold: config.prmLoyaltyConfigPlatinumThreshold, multiplier: 0.30 },
      ],
    };
  }
}

/** Admin endpoints */
@Controller('admin/loyalty')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminLoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get('config')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async getConfig() {
    const data = await this.loyaltyService.getConfig();
    return { data };
  }

  @Put('config')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async updateConfig(@Body() dto: UpdateLoyaltyConfigDto) {
    const data = await this.loyaltyService.updateConfig(dto);
    return { data, message: 'Cap nhat cau hinh loyalty thanh cong' };
  }

  @Get('transactions')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async getTransactions(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.loyaltyService.getAllTransactions(page, limit);
  }

  @Post('adjust')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async adjustPoints(
    @Body() dto: AdjustPointsDto,
    @CurrentUser('sub') adminId: string,
  ) {
    const data = await this.loyaltyService.adjustPoints(dto, adminId);
    return { data, message: 'Dieu chinh diem thanh cong' };
  }
}
