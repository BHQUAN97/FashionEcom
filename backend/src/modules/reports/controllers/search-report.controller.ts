import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchReportService } from '../services/search-report.service';
import { SearchQueryDto } from '../dto/revenue-query.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/constants/roles.constant';

@Controller('reports/search')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
export class SearchReportController {
  constructor(private readonly searchService: SearchReportService) {}

  @Get()
  async getSearchReport(@Query() query: SearchQueryDto) {
    const data = await this.searchService.getSearchReport(query);
    return { success: true, data };
  }
}
