import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProductViewsQueryDto } from '../dto/revenue-query.dto';
import { ReportCacheService } from './cache.service';

/**
 * Bao cao luot xem san pham — views, unique viewers, conversion rates
 */
@Injectable()
export class ProductViewsReportService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly cacheService: ReportCacheService,
  ) {}

  async getProductViews(query: ProductViewsQueryDto) {
    const cacheKey = this.cacheService.buildKey('product-views', query as Record<string, unknown>);
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const endDate = query.to ? new Date(query.to) : new Date();
    const startDate = query.from ? new Date(query.from) : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    let categoryFilter = '';
    let deviceFilter = '';
    const params: unknown[] = [startDate, endDate];

    if (query.device) {
      deviceFilter = "AND e.log_analytics_event_device = ?";
      params.push(query.device);
    }

    // Tong hop views theo product_id tu event data JSON
    const sql = `
      SELECT
        JSON_UNQUOTE(JSON_EXTRACT(e.log_analytics_event_data, '$.product_id')) AS product_id,
        COUNT(*) AS total_views,
        COUNT(DISTINCT e.log_analytics_event_session_id) AS unique_viewers,
        p.cat_product_name AS product_name,
        c.cat_category_name AS category_name
      FROM log_analytics_event e
      LEFT JOIN cat_product p ON p.cat_product_id = JSON_UNQUOTE(JSON_EXTRACT(e.log_analytics_event_data, '$.product_id'))
      LEFT JOIN cat_category c ON c.cat_category_id = p.cat_category_id
      WHERE e.log_analytics_event_type = 'product_view'
        AND e.created_date BETWEEN ? AND ?
        ${deviceFilter}
        ${query.category_id ? 'AND p.cat_category_id = ?' : ''}
      GROUP BY product_id
      ORDER BY total_views DESC
      LIMIT ? OFFSET ?
    `;

    if (query.category_id) {
      params.push(query.category_id);
    }
    params.push(limit, offset);

    const rows = await this.dataSource.query(sql, params);

    // Summary
    const summaryParams: unknown[] = [startDate, endDate];
    if (query.device) summaryParams.push(query.device);
    const [summary] = await this.dataSource.query(`
      SELECT
        COUNT(*) AS total_views,
        COUNT(DISTINCT log_analytics_event_session_id) AS unique_sessions
      FROM log_analytics_event
      WHERE log_analytics_event_type = 'product_view'
        AND created_date BETWEEN ? AND ?
        ${query.device ? 'AND log_analytics_event_device = ?' : ''}
    `, summaryParams);

    const result = {
      rows,
      summary: {
        total_views: Number(summary.total_views),
        unique_sessions: Number(summary.unique_sessions),
      },
    };

    await this.cacheService.set(cacheKey, result, 600);
    return result;
  }
}
