import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

/**
 * Cron job: 02:00 ngay 1 moi thang — xoa events cu > 12 thang, snapshots > 6 thang
 * Giu DB size nho, tranh query cham
 */
@Injectable()
export class AnalyticsCleanupJob {
  private readonly logger = new Logger(AnalyticsCleanupJob.name);

  constructor(private readonly dataSource: DataSource) {}

  async execute(): Promise<void> {
    this.logger.log('Bat dau don dep analytics data cu...');

    // Xoa events cu hon 12 thang
    const eventsResult = await this.dataSource.query(
      'DELETE FROM log_analytics_event WHERE created_date < DATE_SUB(CURDATE(), INTERVAL 12 MONTH)',
    );
    this.logger.log(`Xoa ${eventsResult.affectedRows || 0} events cu`);

    // Xoa snapshots cu hon 6 thang
    const snapshotResult = await this.dataSource.query(
      'DELETE FROM log_inventory_snapshot WHERE snapshot_date < DATE_SUB(CURDATE(), INTERVAL 6 MONTH)',
    );
    this.logger.log(`Xoa ${snapshotResult.affectedRows || 0} snapshots cu`);
  }
}
