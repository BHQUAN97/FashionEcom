import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/roles.constant';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Controller('admin/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async findAll(
    @Query() query: PaginationDto,
    @Query('entityType') entityType?: string,
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.auditService.findAll({ ...query, entityType, userId, action, dateFrom, dateTo });
  }

  @Get('export')
  async exportCsv(
    @Query('entityType') entityType?: string,
    @Query('userId') userId?: string,
    @Res() res?: Response,
  ) {
    const result = await this.auditService.findAll({
      page: 1, limit: 10000, entityType, userId,
    });

    const header = 'ID,Action,Entity Type,Entity ID,User ID,IP,Date\n';
    const rows = result.data
      .map((r: any) => `${r.logAuditId},${r.logAuditAction},${r.logAuditEntityType},${r.logAuditEntityId},${r.sysUserId},${r.logAuditIp || ''},${r.createdDate}`)
      .join('\n');

    res!.setHeader('Content-Type', 'text/csv');
    res!.setHeader('Content-Disposition', 'attachment; filename=audit-log.csv');
    res!.send(header + rows);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.auditService.findOne(id);
    return { data };
  }
}
