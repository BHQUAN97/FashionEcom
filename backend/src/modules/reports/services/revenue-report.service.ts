import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RevenueQueryDto, ReportPeriod } from '../dto/revenue-query.dto';
import { ReportCacheService } from './cache.service';

@Injectable()
export class RevenueReportService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly cacheService: ReportCacheService,
  ) {}

  /**
   * Bao cao doanh thu theo ky — aggregate tu sal_order + sal_order_item
   * Chi tinh don hoan thanh (status=4), loai tru huy(5) va doi tra(6)
   */
  async getRevenue(query: RevenueQueryDto) {
    const cacheKey = this.cacheService.buildKey('revenue', query as Record<string, unknown>);
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const { period = ReportPeriod.DAY, from, to, category_id, payment_type } = query;

    // Date range mac dinh: 30 ngay gan nhat
    const endDate = to ? new Date(to) : new Date();
    const startDate = from ? new Date(from) : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const dateGroup = this.getDateGroupExpression(period);

    let sql = `
      SELECT
        ${dateGroup} AS period_label,
        COUNT(DISTINCT o.sal_order_id) AS order_count,
        COALESCE(SUM(oi.sal_order_item_qty * oi.sal_order_item_price), 0) AS gross_revenue,
        COALESCE(SUM(o.sal_order_discount), 0) AS total_discount,
        COALESCE(SUM(oi.sal_order_item_qty * oi.sal_order_item_price), 0) - COALESCE(SUM(o.sal_order_discount), 0) AS net_revenue
      FROM sal_order o
      JOIN sal_order_item oi ON oi.sal_order_id = o.sal_order_id
    `;

    const params: unknown[] = [startDate, endDate];
    const conditions = ['o.sal_order_status = 4', 'o.created_date BETWEEN ? AND ?'];

    if (category_id) {
      sql += ` JOIN cat_product_variant v ON v.cat_product_variant_id = oi.cat_product_variant_id
               JOIN cat_product p ON p.cat_product_id = v.cat_product_id`;
      conditions.push('p.cat_category_id = ?');
      params.push(category_id);
    }

    if (payment_type !== undefined && payment_type !== '') {
      conditions.push('o.sal_order_payment_type = ?');
      params.push(Number(payment_type));
    }

    sql += ` WHERE ${conditions.join(' AND ')}`;
    sql += ` GROUP BY period_label ORDER BY period_label ASC`;

    const rows = await this.dataSource.query(sql, params);

    // Tinh summary
    const summary = rows.reduce(
      (acc: Record<string, number>, row: Record<string, number>) => {
        acc.total_orders += Number(row.order_count);
        acc.gross_revenue += Number(row.gross_revenue);
        acc.total_discount += Number(row.total_discount);
        acc.net_revenue += Number(row.net_revenue);
        return acc;
      },
      { total_orders: 0, gross_revenue: 0, total_discount: 0, net_revenue: 0 },
    );

    if (summary.total_orders > 0) {
      summary.aov = Math.round(summary.net_revenue / summary.total_orders);
    } else {
      summary.aov = 0;
    }

    const result = { rows, summary, chart_data: rows };
    await this.cacheService.set(cacheKey, result, 600); // 10 phut
    return result;
  }

  /**
   * Tao SQL expression group by period
   */
  private getDateGroupExpression(period: ReportPeriod): string {
    switch (period) {
      case ReportPeriod.DAY:
        return "DATE_FORMAT(o.created_date, '%Y-%m-%d')";
      case ReportPeriod.WEEK:
        return "DATE_FORMAT(o.created_date, '%x-W%v')";
      case ReportPeriod.MONTH:
        return "DATE_FORMAT(o.created_date, '%Y-%m')";
      case ReportPeriod.QUARTER:
        return "CONCAT(YEAR(o.created_date), '-Q', QUARTER(o.created_date))";
      case ReportPeriod.YEAR:
        return "YEAR(o.created_date)";
      default:
        return "DATE_FORMAT(o.created_date, '%Y-%m-%d')";
    }
  }
}
