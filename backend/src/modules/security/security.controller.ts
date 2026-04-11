import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SecurityService } from './security.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/constants/roles.constant';

@Controller('admin/security')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Get('login-history')
  async getLoginHistory(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('email') email?: string,
  ) {
    return this.securityService.getLoginHistory(page, limit, email);
  }
}
