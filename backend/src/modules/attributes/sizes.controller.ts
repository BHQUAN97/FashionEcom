import {
  Controller, Get, Post, Put, Delete,
  Body, Param, UseGuards,
} from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { CreateSizeGroupDto, UpdateSizeGroupDto } from './dto/create-size-group.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/constants/roles.constant';

@Controller('admin/attributes/sizes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
export class SizesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Get()
  async findAll() {
    const data = await this.attributesService.findAllSizeGroups();
    return { data, message: 'OK' };
  }

  @Post()
  async create(@Body() dto: CreateSizeGroupDto) {
    const data = await this.attributesService.createSizeGroup(dto);
    return { data, message: 'Tao nhom size thanh cong' };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSizeGroupDto) {
    const data = await this.attributesService.updateSizeGroup(id, dto);
    return { data, message: 'Cap nhat nhom size thanh cong' };
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    await this.attributesService.removeSizeGroup(id);
    return { data: null, message: 'Xoa nhom size thanh cong' };
  }

  // --- Size values trong nhom ---

  /** Lay tat ca size values cua 1 nhom */
  @Get(':groupId/values')
  async findSizesByGroup(@Param('groupId') groupId: string) {
    const data = await this.attributesService.findSizesByGroup(groupId);
    return { data, message: 'OK' };
  }

  /** Sync sizes tu JSON values cua nhom (tao moi cai chua co) */
  @Post(':groupId/sync')
  async syncSizes(@Param('groupId') groupId: string) {
    const data = await this.attributesService.syncSizesFromGroup(groupId);
    return { data, message: 'Sync sizes thanh cong' };
  }

  /** Tao 1 size value moi trong nhom */
  @Post(':groupId/values')
  async createSize(
    @Param('groupId') groupId: string,
    @Body() body: { value: string; sort?: number },
  ) {
    const data = await this.attributesService.createSize(groupId, body.value, body.sort);
    return { data, message: 'Tao size thanh cong' };
  }

  /** Xoa 1 size value */
  @Delete('values/:sizeId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async removeSize(@Param('sizeId') sizeId: string) {
    await this.attributesService.removeSize(sizeId);
    return { data: null, message: 'Xoa size thanh cong' };
  }
}
