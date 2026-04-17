import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InventoryQueryDto } from '../dto/revenue-query.dto';
import { ReportCacheService } from './cache.service';

/**
 * Bao cao ton kho — summary, detail, dead stock, turnover
 */
@Injectable()
export class InventoryReportService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly cacheService: ReportCacheService,
  ) {}

  /**
   * Tong quan ton kho: tong gia tri, SKU co hang, het hang, sap het
   */
  async getSummary(query: InventoryQueryDto) {
    const cacheKey = this.cacheService.buildKey('inv-summary', query as Record<string, unknown>);
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    let warehouseFilter = '';
    const params: unknown[] = [];
    if (query.warehouse_id) {
      warehouseFilter = 'AND il.inv_warehouse_id = ?';
      params.push(query.warehouse_id);
    }

    const sql = `
      SELECT
        COALESCE(SUM(il.inv_inventory_level_available * v.cat_product_variant_cost), 0) AS total_value,
        COUNT(DISTINCT CASE WHEN il.inv_inventory_level_available > 0 THEN v.cat_product_variant_id END) AS in_stock_sku,
        COUNT(DISTINCT CASE WHEN il.inv_inventory_level_available = 0 THEN v.cat_product_variant_id END) AS out_of_stock_sku,
        COUNT(DISTINCT CASE WHEN il.inv_inventory_level_available > 0 AND il.inv_inventory_level_available <= 10 THEN v.cat_product_variant_id END) AS low_stock_sku
      FROM inv_inventory_level il
      JOIN cat_product_variant v ON v.cat_product_variant_id = il.cat_product_variant_id
      WHERE 1=1 ${warehouseFilter}
    `;

    const [summary] = await this.dataSource.query(sql, params);

    const result = {
      total_value: Number(summary.total_value),
      in_stock_sku: Number(summary.in_stock_sku),
      out_of_stock_sku: Number(summary.out_of_stock_sku),
      low_stock_sku: Number(summary.low_stock_sku),
    };

    await this.cacheService.set(cacheKey, result, 900); // 15 phut
    return result;
  }

  /**
   * Danh sach chi tiet ton kho voi pagination
   */
  async getDetail(query: InventoryQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    let conditions = 'WHERE 1=1';
    const params: unknown[] = [];

    if (query.warehouse_id) {
      conditions += ' AND il.inv_warehouse_id = ?';
      params.push(query.warehouse_id);
    }
    if (query.category_id) {
      conditions += ' AND p.cat_category_id = ?';
      params.push(query.category_id);
    }

    // Filter theo stock status
    if (query.stock_status === 'low') {
      conditions += ' AND il.inv_inventory_level_available > 0 AND il.inv_inventory_level_available <= 10';
    } else if (query.stock_status === 'out') {
      conditions += ' AND il.inv_inventory_level_available = 0';
    }

    // Filter theo mau sac / kich thuoc
    if (query.color_id) {
      conditions += ' AND v.cat_color_id = ?';
      params.push(query.color_id);
    }
    if (query.size_id) {
      conditions += ' AND v.cat_size_id = ?';
      params.push(query.size_id);
    }

    const sql = `
      SELECT
        p.cat_product_name AS product_name,
        v.cat_product_variant_sku AS sku,
        COALESCE(clr.cat_color_name, v.cat_product_variant_color) AS color,
        COALESCE(clr.cat_color_hex, NULL) AS color_hex,
        COALESCE(sz.cat_size_value, v.cat_product_variant_size) AS size,
        il.inv_inventory_level_available AS available,
        il.inv_inventory_level_locked AS locked,
        v.cat_product_variant_cost AS cost,
        (il.inv_inventory_level_available * v.cat_product_variant_cost) AS stock_value,
        COALESCE(sold.qty_sold, 0) AS sold_30d
      FROM inv_inventory_level il
      JOIN cat_product_variant v ON v.cat_product_variant_id = il.cat_product_variant_id
      JOIN cat_product p ON p.cat_product_id = v.cat_product_id
      LEFT JOIN cat_color clr ON clr.cat_color_id = v.cat_color_id
      LEFT JOIN cat_size sz ON sz.cat_size_id = v.cat_size_id
      LEFT JOIN (
        SELECT oi.cat_product_variant_id,
               COALESCE(SUM(oi.sal_order_item_qty), 0) AS qty_sold
        FROM sal_order_item oi
        JOIN sal_order o ON o.sal_order_id = oi.sal_order_id
        WHERE o.sal_order_status = 4
          AND o.created_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY oi.cat_product_variant_id
      ) sold ON sold.cat_product_variant_id = v.cat_product_variant_id
      ${conditions}
      ORDER BY stock_value DESC
      LIMIT ? OFFSET ?
    `;

    const countSql = `
      SELECT COUNT(*) AS total
      FROM inv_inventory_level il
      JOIN cat_product_variant v ON v.cat_product_variant_id = il.cat_product_variant_id
      JOIN cat_product p ON p.cat_product_id = v.cat_product_id
      LEFT JOIN cat_color clr ON clr.cat_color_id = v.cat_color_id
      LEFT JOIN cat_size sz ON sz.cat_size_id = v.cat_size_id
      ${conditions}
    `;

    const [rows, [countRow]] = await Promise.all([
      this.dataSource.query(sql, [...params, limit, offset]),
      this.dataSource.query(countSql, params),
    ]);

    return {
      rows,
      pagination: {
        page,
        limit,
        total: Number(countRow.total),
        total_pages: Math.ceil(Number(countRow.total) / limit),
      },
    };
  }

  /**
   * Dead stock — SP co ton nhung khong ban trong 90 ngay
   */
  async getDeadStock(query: InventoryQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const offset = (page - 1) * limit;

    const sql = `
      SELECT
        v.cat_product_variant_id,
        v.cat_product_variant_sku AS sku,
        p.cat_product_name AS product_name,
        COALESCE(clr.cat_color_name, v.cat_product_variant_color) AS color,
        COALESCE(clr.cat_color_hex, NULL) AS color_hex,
        COALESCE(sz.cat_size_value, v.cat_product_variant_size) AS size,
        il.inv_inventory_level_available AS available,
        v.cat_product_variant_cost AS cost,
        (il.inv_inventory_level_available * v.cat_product_variant_cost) AS dead_value,
        MAX(o.created_date) AS last_sold_date
      FROM cat_product_variant v
      JOIN inv_inventory_level il ON il.cat_product_variant_id = v.cat_product_variant_id
      JOIN cat_product p ON p.cat_product_id = v.cat_product_id
      LEFT JOIN cat_color clr ON clr.cat_color_id = v.cat_color_id
      LEFT JOIN cat_size sz ON sz.cat_size_id = v.cat_size_id
      LEFT JOIN sal_order_item oi ON oi.cat_product_variant_id = v.cat_product_variant_id
      LEFT JOIN sal_order o ON o.sal_order_id = oi.sal_order_id AND o.sal_order_status = 4
      WHERE il.inv_inventory_level_available > 0
      GROUP BY v.cat_product_variant_id
      HAVING last_sold_date IS NULL OR last_sold_date < DATE_SUB(NOW(), INTERVAL 90 DAY)
      ORDER BY dead_value DESC
      LIMIT ? OFFSET ?
    `;

    const rows = await this.dataSource.query(sql, [limit, offset]);
    return { rows };
  }

  /**
   * Inventory turnover = COGS / avg inventory value
   */
  async getTurnover(from?: string, to?: string, categoryId?: string) {
    const endDate = to || new Date().toISOString().split('T')[0];
    const startDate = from || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    let categoryFilter = '';
    const params: unknown[] = [startDate, endDate];
    if (categoryId) {
      categoryFilter = 'AND p.cat_category_id = ?';
      params.push(categoryId);
    }

    // COGS trong ky
    const cogsSql = `
      SELECT
        c.cat_category_name AS category_name,
        c.cat_category_id AS category_id,
        COALESCE(SUM(oi.sal_order_item_qty * oi.sal_order_item_cost), 0) AS cogs
      FROM sal_order o
      JOIN sal_order_item oi ON oi.sal_order_id = o.sal_order_id
      JOIN cat_product_variant v ON v.cat_product_variant_id = oi.cat_product_variant_id
      JOIN cat_product p ON p.cat_product_id = v.cat_product_id
      JOIN cat_category c ON c.cat_category_id = p.cat_category_id
      WHERE o.sal_order_status = 4
        AND o.created_date BETWEEN ? AND ?
        ${categoryFilter}
      GROUP BY c.cat_category_id
    `;

    // Ton kho hien tai
    const invSql = `
      SELECT
        c.cat_category_name AS category_name,
        c.cat_category_id AS category_id,
        COALESCE(SUM(il.inv_inventory_level_available * v.cat_product_variant_cost), 0) AS inventory_value
      FROM inv_inventory_level il
      JOIN cat_product_variant v ON v.cat_product_variant_id = il.cat_product_variant_id
      JOIN cat_product p ON p.cat_product_id = v.cat_product_id
      JOIN cat_category c ON c.cat_category_id = p.cat_category_id
      WHERE 1=1 ${categoryFilter ? categoryFilter.replace('p.cat_category_id', 'p.cat_category_id') : ''}
      GROUP BY c.cat_category_id
    `;

    const invParams = categoryId ? [categoryId] : [];

    const [cogsRows, invRows] = await Promise.all([
      this.dataSource.query(cogsSql, params),
      this.dataSource.query(invSql, invParams),
    ]);

    // Map inventory values
    const invMap = new Map<string, number>();
    for (const row of invRows) {
      invMap.set(row.category_id, Number(row.inventory_value));
    }

    // Tinh turnover
    const byCategory = cogsRows.map((row: Record<string, unknown>) => {
      const cogs = Number(row.cogs);
      const invValue = invMap.get(row.category_id as string) || 0;
      // Dung gia tri hien tai lam proxy cho TB (chua co snapshot du)
      const turnover = invValue > 0 ? cogs / invValue : 0;
      return {
        category_name: row.category_name,
        category_id: row.category_id,
        cogs,
        inventory_value: invValue,
        turnover_rate: Math.round(turnover * 100) / 100,
      };
    });

    // Tong hop
    const totalCogs = byCategory.reduce((s: number, r: { cogs: number }) => s + r.cogs, 0);
    const totalInv = byCategory.reduce((s: number, r: { inventory_value: number }) => s + r.inventory_value, 0);

    return {
      turnover_rate: totalInv > 0 ? Math.round((totalCogs / totalInv) * 100) / 100 : 0,
      total_cogs: totalCogs,
      total_inventory_value: totalInv,
      by_category: byCategory,
    };
  }
}
