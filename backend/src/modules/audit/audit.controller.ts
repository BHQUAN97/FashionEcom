import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuditService } from './audit.service';
import { AuditQueryDto } from './dto/audit-query.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/constants/roles.constant';

@Controller('admin/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async findAll(@Query() query: AuditQueryDto) {
    return this.auditService.findAll(query);
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

    // BAO MAT: Escape CSV values — chong CSV injection (=, +, -, @, tab, \r)
    const escapeCsv = (val: unknown): string => {
      const s = String(val ?? '');
      // Prefix voi ' neu bat dau bang ky tu nguy hiem (chong formula injection trong Excel)
      const needsPrefix = /^[=+\-@\t\r]/.test(s);
      const escaped = s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"` : s;
      return needsPrefix ? `'${escaped}` : escaped;
    };

    const header = 'ID,Action,Entity Type,Entity ID,User ID,IP,Date\n';
    const rows = result.data
      .map((r) => [r.logAuditId, r.logAuditAction, r.logAuditEntityType, r.logAuditEntityId, r.sysUserId, r.logAuditIp || '', r.createdDate].map(escapeCsv).join(','))
      .join('\n');

    res!.setHeader('Content-Type', 'text/csv');
    res!.setHeader('Content-Disposition', 'attachment; filename=audit-log.csv');
    res!.send(header + rows);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.auditService.findOne(id);
    return { data, message: 'OK' };
  }
}
