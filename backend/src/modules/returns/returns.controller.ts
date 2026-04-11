import {
  Controller, Get, Post, Patch, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { CreateReturnDto, UpdateReturnStatusDto, ReturnQueryDto } from './dto/return-request.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/roles.constant';

/** Customer endpoints */
@Controller('returns')
@UseGuards(JwtAuthGuard)
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post()
  async create(
    @Body() dto: CreateReturnDto,
    @CurrentUser('sub') customerId: string,
  ) {
    const data = await this.returnsService.create(dto, customerId);
    return { data, message: 'Gui yeu cau doi tra thanh cong' };
  }

  @Get()
  async findByCustomer(@CurrentUser('sub') customerId: string) {
    const data = await this.returnsService.findByCustomer(customerId);
    return { data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.returnsService.findOne(id);
    return { data };
  }
}

/** Admin endpoints */
@Controller('admin/returns')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
export class AdminReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Get()
  async findAll(@Query() query: ReturnQueryDto) {
    return this.returnsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.returnsService.findOne(id);
    return { data };
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateReturnStatusDto,
    @CurrentUser('sub') userId: string,
  ) {
    const data = await this.returnsService.updateStatus(id, dto, userId);
    return { data, message: 'Cap nhat trang thai thanh cong' };
  }

  @Post(':id/reply')
  async addReply(
    @Param('id') id: string,
    @Body('content') content: string,
    @CurrentUser('sub') userId: string,
  ) {
    const data = await this.returnsService.addReply(id, content, userId);
    return { data };
  }
}
