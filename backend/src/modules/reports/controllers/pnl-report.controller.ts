import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { PnLReportService } from '../services/pnl-report.service';
import { ExportService } from '../services/export.service';
import { PnLQueryDto, ExportQueryDto } from '../dto/revenue-query.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/constants/roles.constant';

@Controller('reports/pnl')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
export class PnLReportController {
  constructor(
    private readonly pnlService: PnLReportService,
    private readonly exportService: ExportService,
  ) {}

  @Get()
  async getPnL(@Query() query: PnLQueryDto) {
    const data = await this.pnlService.getPnL(query);
    return { success: true, data };
  }

  @Get('export')
  async exportPnL(
    @Query() query: PnLQueryDto & ExportQueryDto,
    @Res() res: Response,
  ) {
    const data = await this.pnlService.getPnL(query) as { pnl: Record<string, unknown>[]; comparison: Record<string, unknown>[]; chart_data: unknown[] };
    const columns = this.exportService.getPnLColumns();
    const rows = Array.isArray(data.pnl) ? data.pnl : [data.pnl];

    if (query.format === 'xlsx') {
      const buffer = await this.exportService.generateXlsx(columns, rows);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=pnl-report.xlsx');
      res.send(buffer);
    } else {
      const buffer = this.exportService.generateCsv(columns, rows);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=pnl-report.csv');
      res.send(buffer);
    }
  }
}
