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
}
