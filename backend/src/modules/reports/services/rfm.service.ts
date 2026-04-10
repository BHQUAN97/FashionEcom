import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ReportCacheService } from './cache.service';

/**
 * RFM Segmentation — tinh R/F/M scores va phan loai 8 segments
 */
@Injectable()
export class RfmService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly cacheService: ReportCacheService,
  ) {}

  /**
   * Phan loai RFM segment theo spec Section 5.3
   */
  classifyRFM(r: number, f: number, m: number): string {
    if (r >= 4 && f >= 4 && m >= 4) return 'Champions';
    if (r <= 2 && f >= 4 && m >= 4) return 'Cant Lose Them';
    if (r <= 2 && f >= 3 && m >= 3) return 'At Risk';
    if (r >= 4 && f === 1 && m <= 2) return 'New Customers';
    if (r >= 4 && f <= 3 && m <= 3) return 'Potential Loyalists';
    if (f >= 3 && m >= 3) return 'Loyal Customers';
    if (r <= 2 && f <= 2) return 'Hibernating';
    return 'Lost';
  }

  /**
   * Score R (1-5) — so ngay tu don cuoi, nho = tot
   */
  private scoreRecency(days: number): number {
    if (days <= 14) return 5;
    if (days <= 30) return 4;
    if (days <= 60) return 3;
    if (days <= 120) return 2;
    return 1;
  }

  /**
   * Score F (1-5) — so don hoan thanh
   */
  private scoreFrequency(orders: number): number {
    if (orders >= 10) return 5;
    if (orders >= 6) return 4;
    if (orders >= 3) return 3;
    if (orders >= 2) return 2;
    return 1;
  }

  /**
   * Score M (1-5) — tong gia tri don (VND)
   */
  private scoreMonetary(total: number): number {
    if (total >= 5000000) return 5;
    if (total >= 3000000) return 4;
    if (total >= 1500000) return 3;
    if (total >= 500000) return 2;
    return 1;
  }

  /**
   * Recalculate RFM cho tat ca khach hang — chay boi cron job
   * TRUNCATE + INSERT
   */
  async recalculate(): Promise<{ processed: number }> {
    // Lay raw R/F/M tu don hang hoan thanh
    const rawData = await this.dataSource.query(`
      SELECT
        c.sys_customer_id,
        DATEDIFF(CURDATE(), MAX(o.created_date)) AS recency_days,
        COUNT(DISTINCT o.sal_order_id) AS frequency,
        COALESCE(SUM(o.sal_order_total), 0) AS monetary
      FROM sys_customer c
      JOIN sal_order o ON o.sys_customer_id = c.sys_customer_id
      WHERE o.sal_order_status = 4
      GROUP BY c.sys_customer_id
    `);

    if (rawData.length === 0) return { processed: 0 };

    // TRUNCATE bang cu
    await this.dataSource.query('DELETE FROM log_customer_rfm');

    // Tinh scores va insert
    const values: string[] = [];
    const params: unknown[] = [];

    for (const row of rawData) {
      const recencyDays = Number(row.recency_days) || 999;
      const frequency = Number(row.frequency);
      const monetary = Number(row.monetary);

      const rScore = this.scoreRecency(recencyDays);
      const fScore = this.scoreFrequency(frequency);
      const mScore = this.scoreMonetary(monetary);
      const segment = this.classifyRFM(rScore, fScore, mScore);

      values.push('(UUID(), ?, ?, ?, ?, ?, ?, ?, ?, NOW())');
      params.push(
        row.sys_customer_id,
        recencyDays, frequency, monetary,
        rScore, fScore, mScore, segment,
      );
    }

    // Batch insert (chunks de tranh SQL qua dai)
    const chunkSize = 200;
    for (let i = 0; i < values.length; i += chunkSize) {
      const chunkValues = values.slice(i, i + chunkSize);
      const chunkParams = params.slice(i * 9, (i + chunkSize) * 9);

      await this.dataSource.query(
        `INSERT INTO log_customer_rfm
          (log_customer_rfm_id, sys_customer_id,
           log_customer_rfm_recency, log_customer_rfm_frequency, log_customer_rfm_monetary,
           log_customer_rfm_r_score, log_customer_rfm_f_score, log_customer_rfm_m_score,
           log_customer_rfm_segment, log_customer_rfm_calculated_at)
         VALUES ${chunkValues.join(', ')}`,
        chunkParams,
      );
    }

    // Invalidate cache
    await this.cacheService.invalidate('rfm');

    return { processed: rawData.length };
  }

  /**
   * Lay segments summary cho dashboard
   */
  async getSegments() {
    const cacheKey = 'report:rfm:segments';
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;

    const rows = await this.dataSource.query(`
      SELECT
        rfm.log_customer_rfm_segment AS segment,
        COUNT(*) AS customer_count,
        ROUND(AVG(rfm.log_customer_rfm_monetary / NULLIF(rfm.log_customer_rfm_frequency, 0)), 0) AS aov,
        SUM(rfm.log_customer_rfm_monetary) AS total_revenue
      FROM log_customer_rfm rfm
      GROUP BY rfm.log_customer_rfm_segment
      ORDER BY total_revenue DESC
    `);

    const total = rows.reduce((s: number, r: Record<string, number>) => s + Number(r.customer_count), 0);
    const segments = rows.map((r: Record<string, unknown>) => ({
      name: r.segment,
      count: Number(r.customer_count),
      percentage: total > 0 ? Math.round((Number(r.customer_count) / total) * 10000) / 100 : 0,
      aov: Number(r.aov) || 0,
      total_revenue: Number(r.total_revenue),
    }));

    const result = { segments, updated_at: new Date().toISOString() };
    await this.cacheService.set(cacheKey, result, 3600); // 1 gio
    return result;
  }

  /**
   * Lay danh sach khach hang trong 1 segment (drill-down)
   */
  async getSegmentCustomers(segment: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const rows = await this.dataSource.query(
      `SELECT
        rfm.sys_customer_id AS customer_id,
        c.sys_customer_name AS name,
        c.sys_customer_mobile AS phone,
        rfm.log_customer_rfm_r_score AS r_score,
        rfm.log_customer_rfm_f_score AS f_score,
        rfm.log_customer_rfm_m_score AS m_score,
        rfm.log_customer_rfm_recency AS recency_days,
        rfm.log_customer_rfm_frequency AS frequency,
        rfm.log_customer_rfm_monetary AS monetary,
        rfm.log_customer_rfm_segment AS segment
      FROM log_customer_rfm rfm
      JOIN sys_customer c ON c.sys_customer_id = rfm.sys_customer_id
      WHERE rfm.log_customer_rfm_segment = ?
      ORDER BY rfm.log_customer_rfm_monetary DESC
      LIMIT ? OFFSET ?`,
      [segment, limit, offset],
    );

    const [countRow] = await this.dataSource.query(
      'SELECT COUNT(*) AS total FROM log_customer_rfm WHERE log_customer_rfm_segment = ?',
      [segment],
    );

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
}
