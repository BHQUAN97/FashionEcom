import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { ImportJobEntity } from '../entities/import-job.entity';
import { SyncConfigEntity } from '../entities/sync-config.entity';
import { GoogleSheetsService } from './google-sheets.service';
import { DataMapperService } from './data-mapper.service';
import { FileParserService } from './file-parser.service';

/**
 * SyncEngineService — dieu phoi import/sync data
 * Xu ly: file upload, Google Sheets sync, auto-sync cron
 * Ghi DB truc tiep vao bang product/inventory/customer thong qua raw query
 */
/** Max rows per import — tranh overload DB */
const MAX_IMPORT_ROWS = 5000;

@Injectable()
export class SyncEngineService {
  private readonly logger = new Logger(SyncEngineService.name);

  /**
   * Server-side cache cho parsed data — key: jobId, value: validated rows
   * TTL: 30 phut, tu dong xoa khi confirm hoac expire
   * KHONG gui data parsed tu client de tranh data injection
   */
  private readonly parsedDataCache = new Map<string, {
    rows: Record<string, unknown>[];
    target: string;
    mapping: Record<string, string>;
    expireAt: number;
  }>();

  constructor(
    @InjectRepository(ImportJobEntity)
    private readonly importJobRepo: Repository<ImportJobEntity>,
    @InjectRepository(SyncConfigEntity)
    private readonly syncConfigRepo: Repository<SyncConfigEntity>,
    private readonly googleSheets: GoogleSheetsService,
    private readonly dataMapper: DataMapperService,
    private readonly fileParser: FileParserService,
    private readonly dataSource: DataSource,
  ) {}

  // ==================== FILE UPLOAD IMPORT ====================

  /**
   * Parse file upload va tao preview (chua ghi DB)
   * Tra ve job ID + preview data de admin xac nhan
   */
  async parseFileUpload(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    target: string,
    userId: string,
  ): Promise<{
    jobId: string;
    headers: string[];
    mapping: Record<string, string>;
    preview: Record<string, unknown>[];
    totalRows: number;
    validRows: number;
    errors: Array<{ row: number; field: string; message: string }>;
  }> {
    // Parse file
    const parsed = await this.fileParser.parseFile(buffer, originalName, mimeType);

    // Auto-detect column mapping
    const mapping = this.dataMapper.autoDetectMapping(parsed.headers, target);

    // Validate toan bo data
    const validated = this.dataMapper.mapAndValidateAll(parsed.rows, mapping, target);

    // Tao import job (status: pending — chua ghi DB)
    const job = this.importJobRepo.create({
      sysImportJobSource: 'file_upload',
      sysImportJobTarget: target,
      sysImportJobFileName: originalName,
      sysImportJobStatus: 'pending',
      sysImportJobTotalRows: parsed.totalRows,
      sysImportJobErrors: validated.errors.length,
      sysImportJobErrorDetails: validated.errors.length > 0 ? validated.errors : null,
      createdBy: userId,
    });
    const saved = await this.importJobRepo.save(job);

    // Luu TOAN BO valid rows vao server-side cache (khong gui ve client de tranh injection)
    this.parsedDataCache.set(saved.sysImportJobId, {
      rows: validated.validRows.slice(0, MAX_IMPORT_ROWS),
      target,
      mapping,
      expireAt: Date.now() + 30 * 60 * 1000, // 30 phut
    });
    this.cleanExpiredCache();

    return {
      jobId: saved.sysImportJobId,
      headers: parsed.headers,
      mapping,
      preview: validated.validRows.slice(0, 20), // Preview 20 dong dau (chi de hien thi)
      totalRows: parsed.totalRows,
      validRows: Math.min(validated.validRows.length, MAX_IMPORT_ROWS),
      errors: validated.errors.slice(0, 50), // Toi da 50 loi
    };
  }

  /** Xoa cache da het han */
  private cleanExpiredCache() {
    const now = Date.now();
    for (const [key, val] of this.parsedDataCache.entries()) {
      if (val.expireAt < now) this.parsedDataCache.delete(key);
    }
  }

  // ==================== GOOGLE SHEETS SYNC ====================

  /**
   * Preview data tu Google Sheet (chua ghi DB)
   */
  async previewGoogleSheet(
    sourceUrl: string,
    sheetName: string = 'Sheet1',
    target: string,
    customMapping?: Record<string, string> | null,
  ): Promise<{
    sheetId: string;
    headers: string[];
    mapping: Record<string, string>;
    preview: Record<string, unknown>[];
    totalRows: number;
    validRows: number;
    errors: Array<{ row: number; field: string; message: string }>;
    sheetNames: string[];
  }> {
    const sheetId = this.googleSheets.extractSheetId(sourceUrl);

    // Doc data tu sheet
    const parsed = await this.googleSheets.readSheet(sheetId, sheetName);

    // Lay danh sach tabs
    let sheetNames: string[] = [];
    try {
      sheetNames = await this.googleSheets.getSheetNames(sheetId);
    } catch {
      // Khong lay duoc tab names — khong critical
    }

    // Resolve mapping
    const mapping = customMapping && Object.keys(customMapping).length > 0
      ? customMapping
      : this.dataMapper.autoDetectMapping(parsed.headers, target);

    // Validate
    const validated = this.dataMapper.mapAndValidateAll(parsed.rows, mapping, target);

    return {
      sheetId,
      headers: parsed.headers,
      mapping,
      preview: validated.validRows.slice(0, 20),
      totalRows: parsed.totalRows,
      validRows: validated.validRows.length,
      errors: validated.errors.slice(0, 50),
      sheetNames,
    };
  }

  /**
   * Tao sync config moi
   */
  async createSyncConfig(data: {
    name: string;
    sourceUrl: string;
    target: string;
    sheetName?: string;
    columnMapping?: Record<string, string>;
    autoSync?: boolean;
    intervalMinutes?: number;
    userId: string;
  }): Promise<SyncConfigEntity> {
    const sheetId = this.googleSheets.extractSheetId(data.sourceUrl);

    const config = this.syncConfigRepo.create({
      sysSyncConfigName: data.name,
      sysSyncConfigType: 'google_sheets',
      sysSyncConfigSourceUrl: data.sourceUrl,
      sysSyncConfigSheetId: sheetId,
      sysSyncConfigSheetName: data.sheetName || 'Sheet1',
      sysSyncConfigTarget: data.target,
      sysSyncConfigColumnMapping: data.columnMapping || null,
      sysSyncConfigAutoSync: data.autoSync ? 1 : 0,
      sysSyncConfigIntervalMinutes: data.intervalMinutes || 30,
      sysSyncConfigStatus: 'active',
      createdBy: data.userId,
    });

    return this.syncConfigRepo.save(config);
  }

  // ==================== CONFIRM & EXECUTE IMPORT ====================

  /**
   * Xac nhan import — doc data tu server-side cache (KHONG tin client)
   * Su dung atomic update de tranh race condition (double-import)
   */
  async confirmImport(jobId: string): Promise<ImportJobEntity> {
    // Atomic status check — UPDATE WHERE status='pending', chi 1 request duoc thang
    const updateResult = await this.importJobRepo
      .createQueryBuilder()
      .update()
      .set({ sysImportJobStatus: 'processing', sysImportJobStartedAt: new Date() })
      .where('sys_import_job_id = :id AND sys_import_job_status = :status', { id: jobId, status: 'pending' })
      .execute();

    if (updateResult.affected === 0) {
      throw new BadRequestException('Import job khong ton tai hoac da duoc xu ly');
    }

    // Doc data tu server-side cache
    const cached = this.parsedDataCache.get(jobId);
    if (!cached) {
      // Revert status
      await this.importJobRepo.update(jobId, { sysImportJobStatus: 'failed' });
      throw new BadRequestException('Du lieu import da het han (qua 30 phut). Vui long upload lai');
    }

    const job = await this.importJobRepo.findOne({ where: { sysImportJobId: jobId } });
    if (!job) throw new BadRequestException('Import job khong ton tai');

    try {
      const result = await this.executeImport(cached.rows, cached.target);

      // Update job result
      job.sysImportJobStatus = 'completed';
      job.sysImportJobCreated = result.created;
      job.sysImportJobUpdated = result.updated;
      job.sysImportJobSkipped = result.skipped;
      job.sysImportJobTotalRows = cached.rows.length;
      job.sysImportJobFinishedAt = new Date();
      await this.importJobRepo.save(job);

      // Xoa cache sau khi import thanh cong
      this.parsedDataCache.delete(jobId);

      return job;
    } catch (err) {
      job.sysImportJobStatus = 'failed';
      job.sysImportJobErrorDetails = [{ row: 0, field: 'system', message: err instanceof Error ? err.message : 'Unknown error' }];
      job.sysImportJobFinishedAt = new Date();
      await this.importJobRepo.save(job);
      throw err;
    }
  }

  /**
   * Thuc hien import data vao DB
   * Dung transaction + upsert pattern (INSERT ... ON DUPLICATE KEY UPDATE)
   */
  private async executeImport(
    rows: Record<string, unknown>[],
    target: string,
  ): Promise<{ created: number; updated: number; skipped: number }> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    let created = 0;
    let updated = 0;
    let skipped = 0;

    try {
      for (const row of rows) {
        const result = await this.upsertRow(qr, row, target);
        if (result === 'created') created++;
        else if (result === 'updated') updated++;
        else skipped++;
      }

      await qr.commitTransaction();
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }

    return { created, updated, skipped };
  }

  /**
   * Upsert 1 row — kiem tra SKU ton tai → update, chua co → insert
   */
  private async upsertRow(
    qr: import('typeorm').QueryRunner,
    row: Record<string, unknown>,
    target: string,
  ): Promise<'created' | 'updated' | 'skipped'> {
    if (target === 'product' || target === 'price') {
      return this.upsertProduct(qr, row, target);
    }
    if (target === 'inventory') {
      return this.upsertInventory(qr, row);
    }
    if (target === 'customer') {
      return this.upsertCustomer(qr, row);
    }
    return 'skipped';
  }

  private async upsertProduct(
    qr: import('typeorm').QueryRunner,
    row: Record<string, unknown>,
    target: string,
  ): Promise<'created' | 'updated' | 'skipped'> {
    const sku = String(row.sku || '').trim();
    if (!sku) return 'skipped';

    // Tim variant theo SKU
    const existing = await qr.query(
      'SELECT v.cat_product_variant_id, v.cat_product_id FROM cat_product_variant v WHERE v.cat_product_variant_sku = ? LIMIT 1',
      [sku],
    );

    if (existing.length > 0) {
      // Update gia cua variant (+ product neu la full import)
      const updates: string[] = [];
      const values: unknown[] = [];

      if (row.catProductPrice !== undefined) {
        updates.push('cat_product_variant_price = ?');
        values.push(row.catProductPrice);
      }
      if (row.catProductComparePrice !== undefined) {
        updates.push('cat_product_variant_compare_price = ?');
        values.push(row.catProductComparePrice);
      }
      if (row.catProductCostPrice !== undefined) {
        updates.push('cat_product_variant_cost_price = ?');
        values.push(row.catProductCostPrice);
      }

      if (updates.length > 0) {
        values.push(existing[0].cat_product_variant_id);
        await qr.query(`UPDATE cat_product_variant SET ${updates.join(', ')} WHERE cat_product_variant_id = ?`, values);
      }

      // Update ten san pham neu import day du
      if (target === 'product' && row.catProductName) {
        await qr.query(
          'UPDATE cat_product SET cat_product_name = ? WHERE cat_product_id = ?',
          [row.catProductName, existing[0].cat_product_id],
        );
      }

      return 'updated';
    }

    // Tao product moi (chi khi target = product, khong tao khi chi update gia)
    if (target === 'price') return 'skipped';

    // Tao product
    const productId = await this.generateUUID(qr);
    await qr.query(
      `INSERT INTO cat_product (cat_product_id, cat_product_name, cat_product_slug, cat_product_status, cat_product_price, cat_product_compare_price, cat_product_description, created_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        productId,
        row.catProductName || 'San pham import',
        this.slugify(String(row.catProductName || 'san-pham-import')),
        row.catProductStatus || 'active',
        row.catProductPrice || 0,
        row.catProductComparePrice || 0,
        row.catProductDescription || '',
      ],
    );

    // Tao variant mac dinh
    const variantId = await this.generateUUID(qr);
    await qr.query(
      `INSERT INTO cat_product_variant (cat_product_variant_id, cat_product_id, cat_product_variant_sku, cat_product_variant_price, cat_product_variant_compare_price, cat_product_variant_cost_price, cat_product_variant_status, created_date)
       VALUES (?, ?, ?, ?, ?, ?, 'active', NOW())`,
      [
        variantId,
        productId,
        sku,
        row.catProductPrice || 0,
        row.catProductComparePrice || 0,
        row.catProductCostPrice || 0,
      ],
    );

    return 'created';
  }

  private async upsertInventory(
    qr: import('typeorm').QueryRunner,
    row: Record<string, unknown>,
  ): Promise<'created' | 'updated' | 'skipped'> {
    const sku = String(row.sku || '').trim();
    if (!sku) return 'skipped';

    // Tim variant theo SKU
    const variant = await qr.query(
      'SELECT cat_product_variant_id FROM cat_product_variant WHERE cat_product_variant_sku = ? LIMIT 1',
      [sku],
    );
    if (variant.length === 0) return 'skipped';

    const variantId = variant[0].cat_product_variant_id;
    const qty = Number(row.quantity) || 0;

    // Tim warehouse (dung kho dau tien neu khong chi dinh)
    let warehouseId: string;
    if (row.warehouse) {
      const wh = await qr.query(
        'SELECT inv_warehouse_id FROM inv_warehouse WHERE inv_warehouse_name LIKE ? LIMIT 1',
        [`%${row.warehouse}%`],
      );
      if (wh.length === 0) return 'skipped';
      warehouseId = wh[0].inv_warehouse_id;
    } else {
      const wh = await qr.query('SELECT inv_warehouse_id FROM inv_warehouse LIMIT 1');
      if (wh.length === 0) return 'skipped';
      warehouseId = wh[0].inv_warehouse_id;
    }

    // Upsert inventory level
    const existing = await qr.query(
      'SELECT inv_inventory_level_id FROM inv_inventory_level WHERE cat_product_variant_id = ? AND inv_warehouse_id = ? LIMIT 1',
      [variantId, warehouseId],
    );

    if (existing.length > 0) {
      await qr.query(
        'UPDATE inv_inventory_level SET inv_inventory_level_available = ? WHERE inv_inventory_level_id = ?',
        [qty, existing[0].inv_inventory_level_id],
      );
      return 'updated';
    }

    const levelId = await this.generateUUID(qr);
    await qr.query(
      'INSERT INTO inv_inventory_level (inv_inventory_level_id, cat_product_variant_id, inv_warehouse_id, inv_inventory_level_available, inv_inventory_level_locked) VALUES (?, ?, ?, ?, 0)',
      [levelId, variantId, warehouseId, qty],
    );
    return 'created';
  }

  private async upsertCustomer(
    qr: import('typeorm').QueryRunner,
    row: Record<string, unknown>,
  ): Promise<'created' | 'updated' | 'skipped'> {
    const email = String(row.saleCustomerEmail || '').trim();
    const phone = String(row.saleCustomerPhone || '').trim();

    if (!email && !phone) return 'skipped';

    // Tim khach hang theo email hoac SDT
    let existing: Array<Record<string, unknown>> = [];
    if (email) {
      existing = await qr.query(
        'SELECT sale_customer_id FROM sale_customer WHERE sale_customer_email = ? LIMIT 1',
        [email],
      );
    }
    if (existing.length === 0 && phone) {
      existing = await qr.query(
        'SELECT sale_customer_id FROM sale_customer WHERE sale_customer_phone = ? LIMIT 1',
        [phone],
      );
    }

    if (existing.length > 0) {
      // Update thong tin
      const updates: string[] = [];
      const values: unknown[] = [];

      if (row.saleCustomerName) { updates.push('sale_customer_name = ?'); values.push(row.saleCustomerName); }
      if (row.saleCustomerAddress) { updates.push('sale_customer_address = ?'); values.push(row.saleCustomerAddress); }

      if (updates.length > 0) {
        values.push(existing[0].sale_customer_id);
        await qr.query(`UPDATE sale_customer SET ${updates.join(', ')} WHERE sale_customer_id = ?`, values);
      }
      return 'updated';
    }

    // Tao khach hang moi
    const customerId = await this.generateUUID(qr);
    await qr.query(
      `INSERT INTO sale_customer (sale_customer_id, sale_customer_name, sale_customer_email, sale_customer_phone, created_date)
       VALUES (?, ?, ?, ?, NOW())`,
      [customerId, row.saleCustomerName || '', email, phone],
    );
    return 'created';
  }

  // ==================== AUTO SYNC CRON ====================

  /**
   * Cron job — chay moi 5 phut, kiem tra sync configs can chay
   */
  @Cron('2-59/5 * * * *') // Offset 2 phut, tranh trung voi payment expiry cron (*/5)
  async handleAutoSync() {
    const configs = await this.syncConfigRepo.find({
      where: { sysSyncConfigAutoSync: 1, sysSyncConfigStatus: 'active' },
    });

    for (const config of configs) {
      const lastSync = config.sysSyncConfigLastSyncAt;
      const intervalMs = config.sysSyncConfigIntervalMinutes * 60 * 1000;

      // Kiem tra da den gio sync chua
      if (lastSync && (Date.now() - lastSync.getTime()) < intervalMs) {
        continue;
      }

      try {
        await this.executeSyncConfig(config);
      } catch (err) {
        this.logger.error(`Auto-sync failed for config ${config.sysSyncConfigId}: ${err}`);
        config.sysSyncConfigStatus = 'error';
        config.sysSyncConfigErrorMessage = err instanceof Error ? err.message : 'Unknown error';
        await this.syncConfigRepo.save(config);
      }
    }
  }

  /**
   * Thuc hien sync tu 1 config
   */
  async executeSyncConfig(config: SyncConfigEntity): Promise<ImportJobEntity> {
    const sheetId = config.sysSyncConfigSheetId;
    if (!sheetId) throw new BadRequestException('Sheet ID khong hop le');

    // Doc data tu Google Sheet
    const parsed = await this.googleSheets.readSheet(sheetId, config.sysSyncConfigSheetName);

    // Resolve mapping
    const mapping = config.sysSyncConfigColumnMapping && Object.keys(config.sysSyncConfigColumnMapping).length > 0
      ? config.sysSyncConfigColumnMapping
      : this.dataMapper.autoDetectMapping(parsed.headers, config.sysSyncConfigTarget);

    // Validate
    const validated = this.dataMapper.mapAndValidateAll(parsed.rows, mapping, config.sysSyncConfigTarget);

    // Tao import job
    const job = this.importJobRepo.create({
      sysSyncConfigId: config.sysSyncConfigId,
      sysImportJobSource: 'google_sheets',
      sysImportJobTarget: config.sysSyncConfigTarget,
      sysImportJobStatus: 'processing',
      sysImportJobTotalRows: parsed.totalRows,
      sysImportJobStartedAt: new Date(),
      createdBy: config.createdBy,
    });
    const savedJob = await this.importJobRepo.save(job);

    // Execute import
    const result = await this.executeImport(validated.validRows, config.sysSyncConfigTarget);

    // Update job
    savedJob.sysImportJobStatus = 'completed';
    savedJob.sysImportJobCreated = result.created;
    savedJob.sysImportJobUpdated = result.updated;
    savedJob.sysImportJobSkipped = result.skipped;
    savedJob.sysImportJobErrors = validated.errors.length;
    savedJob.sysImportJobErrorDetails = validated.errors.length > 0 ? validated.errors : null;
    savedJob.sysImportJobFinishedAt = new Date();
    await this.importJobRepo.save(savedJob);

    // Update sync config
    config.sysSyncConfigLastSyncAt = new Date();
    config.sysSyncConfigErrorMessage = null;
    await this.syncConfigRepo.save(config);

    this.logger.log(
      `Sync completed: ${config.sysSyncConfigName} — created: ${result.created}, updated: ${result.updated}, skipped: ${result.skipped}`,
    );

    return savedJob;
  }

  // ==================== QUERY ====================

  /**
   * Lay lich su import (moi nhat truoc)
   */
  async getImportHistory(limit: number = 20): Promise<ImportJobEntity[]> {
    return this.importJobRepo.find({
      order: { createdDate: 'DESC' },
      take: limit,
    });
  }

  /**
   * Lay danh sach sync configs
   */
  async getSyncConfigs(): Promise<SyncConfigEntity[]> {
    return this.syncConfigRepo.find({
      order: { createdDate: 'DESC' },
    });
  }

  /**
   * Lay chi tiet 1 sync config
   */
  async getSyncConfig(id: string): Promise<SyncConfigEntity | null> {
    return this.syncConfigRepo.findOne({ where: { sysSyncConfigId: id } });
  }

  /**
   * Cap nhat sync config
   */
  async updateSyncConfig(id: string, data: Partial<{
    name: string;
    sheetName: string;
    columnMapping: Record<string, string>;
    autoSync: boolean;
    intervalMinutes: number;
  }>): Promise<SyncConfigEntity> {
    const config = await this.syncConfigRepo.findOne({ where: { sysSyncConfigId: id } });
    if (!config) throw new BadRequestException('Sync config khong ton tai');

    if (data.name !== undefined) config.sysSyncConfigName = data.name;
    if (data.sheetName !== undefined) config.sysSyncConfigSheetName = data.sheetName;
    if (data.columnMapping !== undefined) config.sysSyncConfigColumnMapping = data.columnMapping;
    if (data.autoSync !== undefined) config.sysSyncConfigAutoSync = data.autoSync ? 1 : 0;
    if (data.intervalMinutes !== undefined) config.sysSyncConfigIntervalMinutes = data.intervalMinutes;

    // Reset error khi update
    config.sysSyncConfigStatus = 'active';
    config.sysSyncConfigErrorMessage = null;

    return this.syncConfigRepo.save(config);
  }

  /**
   * Xoa sync config
   */
  async deleteSyncConfig(id: string): Promise<void> {
    await this.syncConfigRepo.delete(id);
  }

  // ==================== HELPERS ====================

  private async generateUUID(qr: import('typeorm').QueryRunner): Promise<string> {
    const result = await qr.query('SELECT UUID() AS id');
    return result[0].id;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 200);
  }
}
