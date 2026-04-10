import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { FunnelQueryDto } from '../dto/revenue-query.dto';
import { ReportCacheService } from './cache.service';

/**
 * Funnel checkout — 6 buoc tu product_view → complete_order
 * Tinh drop-off rate giua cac buoc
 */
@Injectable()
export class FunnelReportService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly cacheService: ReportCacheService,
  ) {}

  async getFunnel(query: FunnelQueryDto) {
    const cacheKey = this.cacheService.buildKey('funnel', query as Record<string, unknown>);
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const endDate = query.to ? new Date(query.to) : new Date();
    const startDate = query.from ? new Date(query.from) : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    let deviceFilter = '';
    let sourceFilter = '';
    const params: unknown[] = [startDate, endDate];

    if (query.device) {
      deviceFilter = 'AND log_analytics_event_device = ?';
      params.push(query.device);
    }
    if (query.source) {
      sourceFilter = 'AND log_analytics_event_source = ?';
      params.push(query.source);
    }

    const sql = `
      SELECT
        SUM(CASE WHEN log_analytics_event_type = 'product_view' THEN 1 ELSE 0 END) AS step_1_views,
        SUM(CASE WHEN log_analytics_event_type = 'add_to_cart' THEN 1 ELSE 0 END) AS step_2_cart,
        SUM(CASE WHEN log_analytics_event_type = 'begin_checkout' THEN 1 ELSE 0 END) AS step_3_checkout,
        SUM(CASE WHEN log_analytics_event_type = 'enter_shipping' THEN 1 ELSE 0 END) AS step_4_shipping,
        SUM(CASE WHEN log_analytics_event_type = 'select_payment' THEN 1 ELSE 0 END) AS step_5_payment,
        SUM(CASE WHEN log_analytics_event_type = 'complete_order' THEN 1 ELSE 0 END) AS step_6_complete,
        COUNT(DISTINCT log_analytics_event_session_id) AS total_sessions
      FROM log_analytics_event
      WHERE created_date BETWEEN ? AND ?
        ${deviceFilter}
        ${sourceFilter}
    `;

    const [raw] = await this.dataSource.query(sql, params);

    const stepNames = [
      'Xem san pham',
      'Them gio hang',
      'Bat dau thanh toan',
      'Nhap dia chi',
      'Chon thanh toan',
      'Hoan thanh',
    ];

    const stepValues = [
      Number(raw.step_1_views),
      Number(raw.step_2_cart),
      Number(raw.step_3_checkout),
      Number(raw.step_4_shipping),
      Number(raw.step_5_payment),
      Number(raw.step_6_complete),
    ];

    const steps = stepNames.map((name, i) => ({
      name,
      count: stepValues[i],
      percentage: stepValues[0] > 0 ? Math.round((stepValues[i] / stepValues[0]) * 10000) / 100 : 0,
      dropoff_rate: i > 0 && stepValues[i - 1] > 0
        ? Math.round(((stepValues[i - 1] - stepValues[i]) / stepValues[i - 1]) * 10000) / 100
        : 0,
    }));

    const result = { steps, total_sessions: Number(raw.total_sessions) };
    await this.cacheService.set(cacheKey, result, 600);
    return result;
  }
}
