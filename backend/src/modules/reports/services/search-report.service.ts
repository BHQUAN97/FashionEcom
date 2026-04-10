import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { SearchQueryDto } from '../dto/revenue-query.dto';
import { ReportCacheService } from './cache.service';

/**
 * Bao cao hanh vi tim kiem — top terms, no-result, conversion
 */
@Injectable()
export class SearchReportService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly cacheService: ReportCacheService,
  ) {}

  async getSearchReport(query: SearchQueryDto) {
    const cacheKey = this.cacheService.buildKey('search', query as Record<string, unknown>);
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const endDate = query.to ? new Date(query.to) : new Date();
    const startDate = query.from ? new Date(query.from) : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    const limit = query.limit || 20;

    const params: unknown[] = [startDate, endDate];

    // Top search terms
    const topTermsSql = `
      SELECT
        JSON_UNQUOTE(JSON_EXTRACT(log_analytics_event_data, '$.search_term')) AS term,
        COUNT(*) AS search_count,
        AVG(CAST(JSON_EXTRACT(log_analytics_event_data, '$.result_count') AS UNSIGNED)) AS avg_results
      FROM log_analytics_event
      WHERE log_analytics_event_type = 'search'
        AND created_date BETWEEN ? AND ?
      GROUP BY term
      HAVING term IS NOT NULL
      ORDER BY search_count DESC
      LIMIT ?
    `;

    const topTerms = await this.dataSource.query(topTermsSql, [...params, limit]);

    // No-result searches
    const noResultSql = `
      SELECT
        JSON_UNQUOTE(JSON_EXTRACT(log_analytics_event_data, '$.search_term')) AS term,
        COUNT(*) AS search_count
      FROM log_analytics_event
      WHERE log_analytics_event_type = 'search'
        AND created_date BETWEEN ? AND ?
        AND CAST(JSON_EXTRACT(log_analytics_event_data, '$.result_count') AS UNSIGNED) = 0
      GROUP BY term
      HAVING term IS NOT NULL
      ORDER BY search_count DESC
      LIMIT ?
    `;

    const noResultTerms = await this.dataSource.query(noResultSql, [...params, limit]);

    // Summary
    const [summary] = await this.dataSource.query(`
      SELECT
        COUNT(*) AS total_searches,
        COUNT(DISTINCT JSON_UNQUOTE(JSON_EXTRACT(log_analytics_event_data, '$.search_term'))) AS unique_terms,
        COUNT(DISTINCT log_analytics_event_session_id) AS search_sessions
      FROM log_analytics_event
      WHERE log_analytics_event_type = 'search'
        AND created_date BETWEEN ? AND ?
    `, params);

    const result = {
      top_terms: topTerms.map((r: Record<string, unknown>) => ({
        term: r.term,
        count: Number(r.search_count),
        avg_results: Math.round(Number(r.avg_results) || 0),
      })),
      no_result_terms: noResultTerms.map((r: Record<string, unknown>) => ({
        term: r.term,
        count: Number(r.search_count),
      })),
      summary: {
        total_searches: Number(summary.total_searches),
        unique_terms: Number(summary.unique_terms),
        search_sessions: Number(summary.search_sessions),
      },
    };

    await this.cacheService.set(cacheKey, result, 600);
    return result;
  }
}
