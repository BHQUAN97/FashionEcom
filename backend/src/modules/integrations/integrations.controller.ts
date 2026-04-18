import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, Res,
  UseGuards, UseInterceptors,
  UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { UserRole } from '@/common/constants/roles.constant';
import { SyncEngineService } from './services/sync-engine.service';
import { FileParserService } from './services/file-parser.service';
import { DataMapperService } from './services/data-mapper.service';
import { GoogleSheetsService } from './services/google-sheets.service';
import { CreateSyncConfigDto, UpdateSyncConfigDto, ConfirmImportDto, PreviewSheetDto } from './dto/import.dto';

/**
 * IntegrationsController — import/sync data tu file upload va Google Sheets
 * Base path: /admin/integrations
 */
@Controller('admin/integrations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER)
export class IntegrationsController {
  constructor(
    private readonly syncEngine: SyncEngineService,
    private readonly fileParser: FileParserService,
    private readonly dataMapper: DataMapperService,
    private readonly googleSheets: GoogleSheetsService,
  ) {}

  // ==================== FILE UPLOAD ====================

  /**
   * Upload file CSV/Excel de preview truoc khi import
   * POST /admin/integrations/upload
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const ext = file.originalname.toLowerCase().split('.').pop();
      if (['csv', 'xlsx', 'xls'].includes(ext || '')) cb(null, true);
      else cb(new BadRequestException('Chi chap nhan file CSV, XLSX, XLS'), false);
    },
  }))
  async uploadFile(
    @UploadedFile() file: { buffer: Buffer; originalname: string; mimetype: string },
    @Query('target') target: string = 'product',
    @CurrentUser('userId') userId: string,
  ) {
    // Validate target
    const VALID_TARGETS = ['product', 'inventory', 'customer', 'price'];
    if (!VALID_TARGETS.includes(target)) {
      return { success: false, message: `Target khong hop le. Chap nhan: ${VALID_TARGETS.join(', ')}` };
    }

    if (!file) {
      return { success: false, message: 'Khong co file nao duoc upload' };
    }

    const result = await this.syncEngine.parseFileUpload(
      file.buffer,
      file.originalname,
      file.mimetype,
      target,
      userId,
    );

    return {
      success: true,
      data: result,
      message: `Da parse ${result.totalRows} dong, ${result.validRows} hop le, ${result.errors.length} loi`,
    };
  }

  /**
   * Xac nhan import sau khi preview — data doc tu server-side cache, KHONG nhan tu client
   * POST /admin/integrations/confirm
   */
  @Post('confirm')
  async confirmImport(
    @Body() body: ConfirmImportDto,
  ) {
    const result = await this.syncEngine.confirmImport(body.jobId);

    return {
      success: true,
      data: {
        jobId: result.sysImportJobId,
        status: result.sysImportJobStatus,
        created: result.sysImportJobCreated,
        updated: result.sysImportJobUpdated,
        skipped: result.sysImportJobSkipped,
        errors: result.sysImportJobErrors,
      },
      message: `Import hoan tat: ${result.sysImportJobCreated} tao moi, ${result.sysImportJobUpdated} cap nhat`,
    };
  }

  /**
   * Tai template import mau
   * GET /admin/integrations/template?target=product
   */
  @Get('template')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.CONTENT_EDITOR, UserRole.WAREHOUSE)
  async downloadTemplate(
    @Query('target') target: string = 'product',
    @Res() res: Response,
  ) {
    const buffer = await this.fileParser.generateTemplate(target);
    const fileName = `import_template_${target}.xlsx`;

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }

  // ==================== GOOGLE SHEETS ====================

  /**
   * Preview data tu Google Sheet
   * POST /admin/integrations/sheets/preview
   */
  @Post('sheets/preview')
  async previewGoogleSheet(
    @Body() body: PreviewSheetDto,
  ) {
    const result = await this.syncEngine.previewGoogleSheet(
      body.sourceUrl,
      body.sheetName,
      body.target,
      body.columnMapping,
    );

    return {
      success: true,
      data: result,
      message: `Da doc ${result.totalRows} dong tu Google Sheet`,
    };
  }

  /**
   * Kiem tra Google Sheets API da cau hinh chua
   * GET /admin/integrations/sheets/status
   */
  @Get('sheets/status')
  getGoogleSheetsStatus() {
    return {
      success: true,
      data: {
        configured: this.googleSheets.isConfigured(),
        message: this.googleSheets.isConfigured()
          ? 'Google Sheets API da san sang'
          : 'Chua cau hinh. Them GOOGLE_API_KEY vao file .env',
      },
    };
  }

  // ==================== SYNC CONFIGS ====================

  /**
   * Danh sach sync configs
   * GET /admin/integrations/sync-configs
   */
  @Get('sync-configs')
  async getSyncConfigs() {
    const configs = await this.syncEngine.getSyncConfigs();
    return { success: true, data: configs };
  }

  /**
   * Tao sync config moi
   * POST /admin/integrations/sync-configs
   */
  @Post('sync-configs')
  async createSyncConfig(
    @Body() dto: CreateSyncConfigDto,
    @CurrentUser('userId') userId: string,
  ) {
    const config = await this.syncEngine.createSyncConfig({
      ...dto,
      sheetName: dto.sheetName,
      columnMapping: dto.columnMapping,
      autoSync: dto.autoSync,
      intervalMinutes: dto.intervalMinutes,
      userId,
    });

    return {
      success: true,
      data: config,
      message: `Da tao cau hinh sync "${config.sysSyncConfigName}"`,
    };
  }

  /**
   * Cap nhat sync config
   * PUT /admin/integrations/sync-configs/:id
   */
  @Put('sync-configs/:id')
  async updateSyncConfig(
    @Param('id') id: string,
    @Body() dto: UpdateSyncConfigDto,
  ) {
    const config = await this.syncEngine.updateSyncConfig(id, dto);
    return { success: true, data: config, message: 'Da cap nhat cau hinh sync' };
  }

  /**
   * Xoa sync config
   * DELETE /admin/integrations/sync-configs/:id
   */
  @Delete('sync-configs/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  async deleteSyncConfig(@Param('id') id: string) {
    await this.syncEngine.deleteSyncConfig(id);
    return { success: true, message: 'Da xoa cau hinh sync' };
  }

  /**
   * Trigger sync thu cong cho 1 config
   * POST /admin/integrations/sync-configs/:id/sync
   */
  @Post('sync-configs/:id/sync')
  async triggerSync(@Param('id') id: string) {
    const config = await this.syncEngine.getSyncConfig(id);
    if (!config) return { success: false, message: 'Sync config khong ton tai' };

    const job = await this.syncEngine.executeSyncConfig(config);
    return {
      success: true,
      data: {
        jobId: job.sysImportJobId,
        created: job.sysImportJobCreated,
        updated: job.sysImportJobUpdated,
        skipped: job.sysImportJobSkipped,
        errors: job.sysImportJobErrors,
      },
      message: `Sync hoan tat: ${job.sysImportJobCreated} tao moi, ${job.sysImportJobUpdated} cap nhat`,
    };
  }

  // ==================== IMPORT HISTORY ====================

  /**
   * Lich su import
   * GET /admin/integrations/history
   */
  @Get('history')
  async getImportHistory(@Query('limit') limit: string = '20') {
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const jobs = await this.syncEngine.getImportHistory(parsedLimit);
    return { success: true, data: jobs };
  }
}
