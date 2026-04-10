import { Injectable } from '@nestjs/common';

/**
 * Export CSV/Excel — generate files tu report data
 * CSV: UTF-8 BOM cho tieng Viet
 * Excel: header bold, auto-width (dung exceljs khi install)
 */
@Injectable()
export class ExportService {
  /**
   * Generate CSV string tu data rows
   */
  generateCsv(columns: { key: string; label: string }[], rows: Record<string, unknown>[]): Buffer {
    // UTF-8 BOM de ho tro tieng Viet tren Excel
    const BOM = '\uFEFF';
    const header = columns.map((c) => `"${c.label}"`).join(',');
    const body = rows.map((row) =>
      columns.map((c) => {
        const val = row[c.key];
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      }).join(','),
    ).join('\n');

    return Buffer.from(BOM + header + '\n' + body, 'utf-8');
  }

  /**
   * Generate simple XLSX (CSV-based) — full exceljs khi can format phuc tap
   * Tam thoi tra CSV voi extension xlsx de don gian
   */
  async generateXlsx(columns: { key: string; label: string }[], rows: Record<string, unknown>[]): Promise<Buffer> {
    // Fallback: tra CSV format (install exceljs cho production)
    return this.generateCsv(columns, rows);
  }

  /**
   * Column definitions cho tung loai report
   */
  getRevenueColumns() {
    return [
      { key: 'period_label', label: 'Ky' },
      { key: 'order_count', label: 'So don' },
      { key: 'gross_revenue', label: 'Doanh thu' },
      { key: 'total_discount', label: 'Giam gia' },
      { key: 'net_revenue', label: 'Doanh thu thuan' },
    ];
  }

  getPnLColumns() {
    return [
      { key: 'group_name', label: 'Nhom' },
      { key: 'gross_revenue', label: 'Doanh thu' },
      { key: 'discount', label: 'Giam gia' },
      { key: 'net_revenue', label: 'DT thuan' },
      { key: 'cogs', label: 'Gia von (COGS)' },
      { key: 'gross_profit', label: 'Lai gop' },
      { key: 'shipping_cost', label: 'Chi phi ship' },
      { key: 'payment_fees', label: 'Phi cong TT' },
      { key: 'net_profit', label: 'Lai rong' },
      { key: 'net_margin', label: 'Ty le lai rong (%)' },
    ];
  }

  getInventoryColumns() {
    return [
      { key: 'product_name', label: 'San pham' },
      { key: 'sku', label: 'SKU' },
      { key: 'color', label: 'Mau' },
      { key: 'size', label: 'Size' },
      { key: 'available', label: 'Ton kha dung' },
      { key: 'locked', label: 'Dang khoa' },
      { key: 'cost', label: 'Gia von' },
      { key: 'stock_value', label: 'Gia tri ton' },
      { key: 'sold_30d', label: 'Da ban (30 ngay)' },
    ];
  }

  getRfmColumns() {
    return [
      { key: 'name', label: 'Segment' },
      { key: 'count', label: 'So khach' },
      { key: 'percentage', label: '% Tong' },
      { key: 'aov', label: 'AOV' },
      { key: 'total_revenue', label: 'Tong doanh thu' },
    ];
  }
}
