import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { SaleCampaignService } from './sale-campaign.service';
import {
  CreateSaleCampaignDto,
  UpdateSaleCampaignDto,
  BulkSetCampaignPriceDto,
  SaleCampaignQueryDto,
} from './dto/sale-campaign.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/constants/roles.constant';

@Controller('admin/promotions/campaigns')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
export class SaleCampaignController {
  constructor(private readonly service: SaleCampaignService) {}

  @Get()
  async findAll(@Query() query: SaleCampaignQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(id);
    return { data, message: 'OK' };
  }

  @Post()
  async create(@Body() dto: CreateSaleCampaignDto) {
    const data = await this.service.create(dto);
    return { data, message: 'Tao chuong trinh sale thanh cong' };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSaleCampaignDto) {
    const data = await this.service.update(id, dto);
    return { data, message: 'Cap nhat thanh cong' };
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { data: null, message: 'Xoa thanh cong' };
  }

  /** Bulk set gia cho nhieu variant trong campaign */
  @Put(':id/bulk-price')
  async bulkSetPrice(@Param('id') id: string, @Body() dto: BulkSetCampaignPriceDto) {
    const data = await this.service.bulkSetPrice(id, dto);
    return { data, message: 'Cap nhat gia hang loat thanh cong' };
  }
}
