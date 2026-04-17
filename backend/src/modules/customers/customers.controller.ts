import {
  Controller, Get,
  Param, Query, UseGuards,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomerQueryDto } from './dto/customer-query.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/constants/roles.constant';

@Controller('admin/customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  async findAll(@Query() query: CustomerQueryDto) {
    return this.customersService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.customersService.findOne(id);
    return { data, message: 'OK' };
  }

  @Get(':id/orders')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
  async getOrderHistory(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.customersService.getOrderHistory(
      id,
      page ? (parseInt(page) || 1) : 1,
      limit ? Math.min(parseInt(limit) || 10, 100) : 10,
    );
  }

  @Get(':id/addresses')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async getAddresses(@Param('id') id: string) {
    const data = await this.customersService.getAddresses(id);
    return { data, message: 'OK' };
  }
}
