import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PnLQueryDto, ReportPeriod } from '../dto/revenue-query.dto';
import { ReportCacheService } from './cache.service';

/**
 * Bao cao Lo/Lai — tinh day du P&L tu doanh thu → COGS → chi phi → lai rong
 */
@Injectable()
export class PnLReportService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly cacheService: ReportCacheService,
  ) {}

  async getPnL(query: PnLQueryDto) {
    const cacheKey = this.cacheService.buildKey('pnl', query as Record<string, unknown>);
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const { from, to, category_id, group_by = 'total' } = query;

    const endDate = to ? new Date(to) : new Date();
    const startDate = from ? new Date(from) : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Tinh ky so sanh (cung do dai, lien truoc)
    const rangeDays = (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000);
    const prevEnd = new Date(startDate.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - rangeDays * 24 * 60 * 60 * 1000);

    const current = await this.calculatePnL(startDate, endDate, category_id, group_by);
    const previous = await this.calculatePnL(prevStart, prevEnd, category_id, group_by);

    const result = {
      pnl: current,
      comparison: previous,
      chart_data: await this.getPnLTrend(category_id),
    };

    await this.cacheService.set(cacheKey, result, 600);
    return result;
  }

  /**
   * Tinh toan chi tiet P&L cho 1 ky
   */
  private async calculatePnL(
    startDate: Date,
    endDate: Date,
    categoryId?: string,
    groupBy: string = 'total',
  ) {
    let joinClause = '';
    let groupClause = '';
    let selectGroup = '';
    const params: unknown[] = [startDate, endDate];

    if (categoryId) {
      joinClause += ` JOIN cat_product_variant v ON v.cat_product_variant_id = oi.cat_product_variant_id
                       JOIN cat_product p ON p.cat_product_id = v.cat_product_id`;
      params.push(categoryId);
    }

    if (groupBy === 'category' || categoryId) {
      if (!joinClause.includes('cat_product_variant')) {
        joinClause += ` JOIN cat_product_variant v ON v.cat_product_variant_id = oi.cat_product_variant_id
                         JOIN cat_product p ON p.cat_product_id = v.cat_product_id`;
      }
      joinClause += ` JOIN cat_category c ON c.cat_category_id = p.cat_category_id`;
    }

    if (groupBy === 'category') {
      selectGroup = ', c.cat_category_name AS group_name, c.cat_category_id AS group_id';
      groupClause = 'GROUP BY c.cat_category_id';
    }

    const sql = `
      SELECT
        COALESCE(SUM(oi.sal_order_item_qty * oi.sal_order_item_price), 0) AS gross_revenue,
        COALESCE(SUM(o.sal_order_discount), 0) AS discount,
        COALESCE(SUM(oi.sal_order_item_qty * oi.sal_order_item_price), 0) - COALESCE(SUM(o.sal_order_discount), 0) AS net_revenue,
        COALESCE(SUM(oi.sal_order_item_qty * oi.sal_order_item_cost), 0) AS cogs,
        COALESCE(SUM(o.sal_order_shipping_fee), 0) AS shipping_cost,
        COUNT(DISTINCT o.sal_order_id) AS order_count
        ${selectGroup}
      FROM sal_order o
      JOIN sal_order_item oi ON oi.sal_order_id = o.sal_order_id
      ${joinClause}
      WHERE o.sal_order_status = 4
        AND o.created_date BETWEEN ? AND ?
        ${categoryId ? 'AND p.cat_category_id = ?' : ''}
      ${groupClause}
    `;

    const rows = await this.dataSource.query(sql, params);

    // Lay phi cong thanh toan tu config
    const feeConfigs = await this.dataSource.query(
      `SELECT log_payment_fee_config_payment_type AS payment_type,
              log_payment_fee_config_rate AS rate,
              log_payment_fee_config_fixed AS fixed_fee
       FROM log_payment_fee_config
       WHERE effective_to IS NULL OR effective_to >= CURDATE()
       ORDER BY effective_from DESC`,
    );

    // Tinh phi cong TT tong
    const paymentFeesSql = `
      SELECT
        o.sal_order_payment_type AS payment_type,
        COALESCE(SUM(o.sal_order_total), 0) AS total_amount
      FROM sal_order o
      WHERE o.sal_order_status = 4
        AND o.created_date BETWEEN ? AND ?
      GROUP BY o.sal_order_payment_type
    `;
    const paymentTotals = await this.dataSource.query(paymentFeesSql, [startDate, endDate]);

    let totalPaymentFees = 0;
    for (const pt of paymentTotals) {
      const config = feeConfigs.find(
        (c: Record<string, number>) => c.payment_type === pt.payment_type,
      );
      if (config) {
        totalPaymentFees += Number(pt.total_amount) * Number(config.rate) + Number(config.fixed_fee);
      }
    }

    // Build P&L structure
    return rows.map((row: Record<string, unknown>) => {
      const grossRevenue = Number(row.gross_revenue);
      const discount = Number(row.discount);
      const netRevenue = Number(row.net_revenue);
      const cogs = Number(row.cogs);
      const grossProfit = netRevenue - cogs;
      const shippingCost = Number(row.shipping_cost);
      const paymentFees = totalPaymentFees;
      const netProfit = grossProfit - shippingCost - paymentFees;

      return {
        group_name: row.group_name || 'Tong hop',
        group_id: row.group_id || null,
        gross_revenue: grossRevenue,
        discount,
        net_revenue: netRevenue,
        cogs,
        gross_profit: grossProfit,
        gross_margin: netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0,
        shipping_cost: shippingCost,
        payment_fees: paymentFees,
        net_profit: netProfit,
        net_margin: netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0,
        order_count: Number(row.order_count),
      };
    });
  }

  /**
   * Trend lai rong 12 thang gan nhat cho chart
   */
  private async getPnLTrend(categoryId?: string) {
    let categoryFilter = '';
    const params: unknown[] = [];

    if (categoryId) {
      categoryFilter = 'AND p.cat_category_id = ?';
      params.push(categoryId);
    }

    const sql = `
      SELECT
        DATE_FORMAT(o.created_date, '%Y-%m') AS month,
        COALESCE(SUM(oi.sal_order_item_qty * oi.sal_order_item_price), 0) - COALESCE(SUM(o.sal_order_discount), 0) AS net_revenue,
        COALESCE(SUM(oi.sal_order_item_qty * oi.sal_order_item_cost), 0) AS cogs,
        COALESCE(SUM(o.sal_order_shipping_fee), 0) AS shipping
      FROM sal_order o
      JOIN sal_order_item oi ON oi.sal_order_id = o.sal_order_id
      ${categoryId ? 'JOIN cat_product_variant v ON v.cat_product_variant_id = oi.cat_product_variant_id JOIN cat_product p ON p.cat_product_id = v.cat_product_id' : ''}
      WHERE o.sal_order_status = 4
        AND o.created_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        ${categoryFilter}
      GROUP BY DATE_FORMAT(o.created_date, '%Y-%m')
      ORDER BY month ASC
    `;

    return this.dataSource.query(sql, params);
  }
}
