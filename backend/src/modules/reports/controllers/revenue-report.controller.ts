import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { RevenueReportService } from '../services/revenue-report.service';
import { ExportService } from '../services/export.service';
import { RevenueQueryDto, ExportQueryDto } from '../dto/revenue-query.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/constants/roles.constant';

@Controller('reports/revenue')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
export class RevenueReportController {
  constructor(
    private readonly revenueService: RevenueReportService,
    private readonly exportService: ExportService,
  ) {}

  @Get()
  async getRevenue(@Query() query: RevenueQueryDto) {
    const data = await this.revenueService.getRevenue(query);
    return { success: true, data };
  }

  @Get('export')
  async exportRevenue(
    @Query() query: RevenueQueryDto & ExportQueryDto,
    @Res() res: Response,
  ) {
    const data = await this.revenueService.getRevenue(query) as { rows: Record<string, unknown>[]; summary: Record<string, unknown>; chart_data: unknown[] };
    const columns = this.exportService.getRevenueColumns();

    if (query.format === 'xlsx') {
      const buffer = await this.exportService.generateXlsx(columns, data.rows);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=revenue-report.xlsx');
      res.send(buffer);
    } else {
      const buffer = this.exportService.generateCsv(columns, data.rows);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=revenue-report.csv');
      res.send(buffer);
    }
  }
}
