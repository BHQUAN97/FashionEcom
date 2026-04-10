import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { CustomerRfmEntity } from './entities/customer-rfm.entity';
import { InventorySnapshotEntity } from './entities/inventory-snapshot.entity';
import { PaymentFeeConfigEntity } from './entities/payment-fee-config.entity';
import { AnalyticsEventEntity } from '../analytics/entities/analytics-event.entity';

// Services
import { ReportCacheService } from './services/cache.service';
import { RevenueReportService } from './services/revenue-report.service';
import { PnLReportService } from './services/pnl-report.service';
import { InventoryReportService } from './services/inventory-report.service';
import { RfmService } from './services/rfm.service';
import { FunnelReportService } from './services/funnel-report.service';
import { ProductViewsReportService } from './services/product-views-report.service';
import { SearchReportService } from './services/search-report.service';
import { ExportService } from './services/export.service';

// Controllers
import { RevenueReportController } from './controllers/revenue-report.controller';
import { PnLReportController } from './controllers/pnl-report.controller';
import { InventoryReportController } from './controllers/inventory-report.controller';
import { RfmReportController } from './controllers/rfm-report.controller';
import { FunnelReportController } from './controllers/funnel-report.controller';
import { ProductViewsReportController } from './controllers/product-views-report.controller';
import { SearchReportController } from './controllers/search-report.controller';

// Jobs
import { InventorySnapshotJob } from './jobs/inventory-snapshot.job';
import { RfmCalculationJob } from './jobs/rfm-calculation.job';
import { AnalyticsCleanupJob } from './jobs/analytics-cleanup.job';
import { CacheWarmupJob } from './jobs/cache-warmup.job';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerRfmEntity,
      InventorySnapshotEntity,
      PaymentFeeConfigEntity,
      AnalyticsEventEntity,
    ]),
  ],
  controllers: [
    RevenueReportController,
    PnLReportController,
    InventoryReportController,
    RfmReportController,
    FunnelReportController,
    ProductViewsReportController,
    SearchReportController,
  ],
  providers: [
    // Cache
    ReportCacheService,
    // Report services
    RevenueReportService,
    PnLReportService,
    InventoryReportService,
    RfmService,
    FunnelReportService,
    ProductViewsReportService,
    SearchReportService,
    ExportService,
    // Jobs
    InventorySnapshotJob,
    RfmCalculationJob,
    AnalyticsCleanupJob,
    CacheWarmupJob,
  ],
  exports: [ReportCacheService, RfmService],
})
export class ReportsModule {}
