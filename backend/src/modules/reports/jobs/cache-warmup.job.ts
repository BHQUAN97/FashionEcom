import { Injectable, Logger } from '@nestjs/common';
import { RevenueReportService } from '../services/revenue-report.service';
import { ReportPeriod } from '../dto/revenue-query.dto';

/**
 * Cron job: 00:10 daily — pre-compute dashboard KPIs cho ngay hom truoc
 * Warm up cache de user truy cap nhanh vao buoi sang
 */
@Injectable()
export class CacheWarmupJob {
  private readonly logger = new Logger(CacheWarmupJob.name);

  constructor(private readonly revenueService: RevenueReportService) {}

  async execute(): Promise<void> {
    this.logger.log('Bat dau warm up cache...');

    try {
      // Pre-compute revenue 30 ngay (dashboard chart mac dinh)
      await this.revenueService.getRevenue({
        period: ReportPeriod.DAY,
      });

      // Pre-compute revenue thang nay
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      await this.revenueService.getRevenue({
        period: ReportPeriod.DAY,
        from: firstDay.toISOString().split('T')[0],
        to: now.toISOString().split('T')[0],
      });

      this.logger.log('Warm up cache xong');
    } catch (error) {
      this.logger.error('Cache warmup failed', error);
    }
  }
}
