import {
  Controller, Get, Post, Put, Delete,
  Body, Param, UseGuards,
} from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { CreateColorDto, UpdateColorDto } from './dto/create-color.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/constants/roles.constant';

@Controller('admin/attributes/colors')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
export class ColorsController {
  constructor(private readonly attributesService: AttributesService) {}

  @Get()
  async findAll() {
    const data = await this.attributesService.findAllColors();
    return { data, message: 'OK' };
  }

  @Post()
  async create(@Body() dto: CreateColorDto) {
    const data = await this.attributesService.createColor(dto);
    return { data, message: 'Tao mau sac thanh cong' };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateColorDto) {
    const data = await this.attributesService.updateColor(id, dto);
    return { data, message: 'Cap nhat mau sac thanh cong' };
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    await this.attributesService.removeColor(id);
    return { data: null, message: 'Xoa mau sac thanh cong' };
  }
}
