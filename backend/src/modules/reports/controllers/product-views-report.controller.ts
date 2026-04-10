import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ProductViewsReportService } from '../services/product-views-report.service';
import { ProductViewsQueryDto } from '../dto/revenue-query.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/constants/roles.constant';

@Controller('reports/product-views')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
export class ProductViewsReportController {
  constructor(private readonly viewsService: ProductViewsReportService) {}

  @Get()
  async getProductViews(@Query() query: ProductViewsQueryDto) {
    const data = await this.viewsService.getProductViews(query);
    return { success: true, data };
  }
}
