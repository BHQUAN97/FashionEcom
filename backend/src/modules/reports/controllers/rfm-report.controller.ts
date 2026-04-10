import { Controller, Get, Post, Param, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { RfmService } from '../services/rfm.service';
import { ExportService } from '../services/export.service';
import { ExportQueryDto } from '../dto/revenue-query.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/constants/roles.constant';

@Controller('reports/rfm')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
export class RfmReportController {
  constructor(
    private readonly rfmService: RfmService,
    private readonly exportService: ExportService,
  ) {}

  @Get()
  async getSegments() {
    const data = await this.rfmService.getSegments();
    return { success: true, data };
  }

  @Get('export')
  async exportRfm(@Query() query: ExportQueryDto, @Res() res: Response) {
    const data = await this.rfmService.getSegments() as { segments: Record<string, unknown>[]; updated_at: string };
    const columns = this.exportService.getRfmColumns();

    if (query.format === 'xlsx') {
      const buffer = await this.exportService.generateXlsx(columns, data.segments);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=rfm-report.xlsx');
      res.send(buffer);
    } else {
      const buffer = this.exportService.generateCsv(columns, data.segments);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=rfm-report.csv');
      res.send(buffer);
    }
  }

  @Get(':segment/customers')
  async getSegmentCustomers(
    @Param('segment') segment: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const data = await this.rfmService.getSegmentCustomers(
      segment,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
    );
    return { success: true, data };
  }

  @Post('recalculate')
  async recalculate() {
    const result = await this.rfmService.recalculate();
    return { success: true, message: `RFM recalculated: ${result.processed} customers` };
  }
}
