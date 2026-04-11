import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { InventoryReportService } from '../services/inventory-report.service';
import { ExportService } from '../services/export.service';
import { InventoryQueryDto, ExportQueryDto } from '../dto/revenue-query.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/constants/roles.constant';

@Controller('reports/inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
export class InventoryReportController {
  constructor(
    private readonly inventoryService: InventoryReportService,
    private readonly exportService: ExportService,
  ) {}

  @Get()
  async getInventory(@Query() query: InventoryQueryDto) {
    const [summary, detail] = await Promise.all([
      this.inventoryService.getSummary(query),
      this.inventoryService.getDetail(query),
    ]);
    return { success: true, data: { summary, ...detail } };
  }

  @Get('dead-stock')
  async getDeadStock(@Query() query: InventoryQueryDto) {
    const data = await this.inventoryService.getDeadStock(query);
    return { success: true, data };
  }

  @Get('turnover')
  async getTurnover(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('category_id') categoryId?: string,
  ) {
    const data = await this.inventoryService.getTurnover(from, to, categoryId);
    return { success: true, data };
  }

  @Get('export')
  async exportInventory(
    @Query() query: InventoryQueryDto & ExportQueryDto,
    @Res() res: Response,
  ) {
    const data = await this.inventoryService.getDetail({ ...query, limit: 10000 });
    const columns = this.exportService.getInventoryColumns();

    if (query.format === 'xlsx') {
      const buffer = await this.exportService.generateXlsx(columns, data.rows);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=inventory-report.xlsx');
      res.send(buffer);
    } else {
      const buffer = this.exportService.generateCsv(columns, data.rows);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=inventory-report.csv');
      res.send(buffer);
    }
  }
}
