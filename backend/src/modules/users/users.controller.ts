import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/roles.constant';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Query() query: PaginationDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.usersService.findById(id);
    return { data };
  }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const data = await this.usersService.create(dto);
    return { data, message: 'Tao user thanh cong' };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser('role') role: number,
  ) {
    const data = await this.usersService.update(id, dto, role);
    return { data, message: 'Cap nhat user thanh cong' };
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  async remove(
    @Param('id') id: string,
    @CurrentUser('userId') currentUserId: string,
  ) {
    await this.usersService.remove(id, currentUserId);
    return { data: null, message: 'Xoa user thanh cong' };
  }
}
