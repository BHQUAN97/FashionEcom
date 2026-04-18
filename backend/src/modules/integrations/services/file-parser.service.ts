import { Injectable, BadRequestException } from '@nestjs/common';
import * as Papa from 'papaparse';
import { Workbook } from 'exceljs';

/**
 * FileParserService — parse CSV va Excel files thanh JSON rows
 * Ho tro: .csv (UTF-8 BOM), .xlsx, .xls
 * Excel engine: exceljs (thay the xlsx@0.18.5 de fix CVE-2023-30533 + CVE-2024-22363)
 */
@Injectable()
export class FileParserService {
  /** Mime types cho phep — khong bao gom application/octet-stream de tranh bypass */
  private readonly ALLOWED_MIMES = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  /** Extensions cho phep */
  private readonly ALLOWED_EXTENSIONS = ['csv', 'xlsx', 'xls'];

  /** Max file size: 10MB */
  private readonly MAX_SIZE = 10 * 1024 * 1024;

  /**
   * Parse file buffer thanh array of objects
   * Dong dau tien la header, cac dong sau la data
   */
  async parseFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
  ): Promise<{ headers: string[]; rows: Record<string, string>[]; totalRows: number }> {
    // Validate size
    if (buffer.length > this.MAX_SIZE) {
      throw new BadRequestException('File qua lon, toi da 10MB');
    }

    const ext = originalName.toLowerCase().split('.').pop();

    // Validate extension
    if (!ext || !this.ALLOWED_EXTENSIONS.includes(ext)) {
      throw new BadRequestException(`Dinh dang file khong ho tro: .${ext}. Chi chap nhan CSV, XLSX, XLS`);
    }

    // Validate MIME type (cho phep octet-stream chi khi extension hop le — da check o tren)
    if (mimeType !== 'application/octet-stream' && !this.ALLOWED_MIMES.includes(mimeType)) {
      throw new BadRequestException(`MIME type khong hop le: ${mimeType}`);
    }

    if (ext === 'csv' || mimeType === 'text/csv') {
      return this.parseCsv(buffer);
    }

    if (ext === 'xlsx' || ext === 'xls') {
      return this.parseExcel(buffer);
    }

    throw new BadRequestException(`Dinh dang file khong ho tro: .${ext}. Chi chap nhan CSV, XLSX, XLS`);
  }

  /**
   * Parse CSV — dung papaparse, ho tro UTF-8 BOM
   */
  private parseCsv(buffer: Buffer): { headers: string[]; rows: Record<string, string>[]; totalRows: number } {
    // Loai bo BOM neu co
    let content = buffer.toString('utf-8');
    if (content.charCodeAt(0) === 0xfeff) {
      content = content.slice(1);
    }

    const result = Papa.parse<Record<string, string>>(content, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim(),
    });

    if (result.errors.length > 0 && result.data.length === 0) {
      throw new BadRequestException(`Loi parse CSV: ${result.errors[0].message}`);
    }

    return {
      headers: result.meta.fields || [],
      rows: result.data,
      totalRows: result.data.length,
    };
  }

  /**
   * Parse Excel — dung exceljs, doc sheet dau tien
   * Chuyen row 1 thanh header, cac row sau map theo header
   */
  private async parseExcel(buffer: Buffer): Promise<{ headers: string[]; rows: Record<string, string>[]; totalRows: number }> {
    const workbook = new Workbook();
    // exceljs.load accept ArrayBuffer / Buffer
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new BadRequestException('File Excel khong co sheet nao');
    }

    // Lay header row (row dau tien khong rong)
    const headerRow = worksheet.getRow(1);
    if (!headerRow || !headerRow.values || (headerRow.values as unknown[]).length === 0) {
      throw new BadRequestException('Sheet khong co du lieu');
    }

    // exceljs row.values la array 1-indexed (index 0 thuong la null)
    const rawHeaderValues = headerRow.values as unknown[];
    const headers: string[] = [];
    for (let col = 1; col < rawHeaderValues.length; col++) {
      const val = rawHeaderValues[col];
      headers.push(this.cellValueToString(val).trim());
    }

    if (headers.length === 0 || headers.every((h) => h === '')) {
      throw new BadRequestException('Sheet khong co du lieu');
    }

    const rows: Record<string, string>[] = [];
    const lastRow = worksheet.actualRowCount || worksheet.rowCount;

    for (let r = 2; r <= lastRow; r++) {
      const row = worksheet.getRow(r);
      // Bo qua row rong hoan toan
      if (!row || !row.hasValues) continue;

      const rowValues = row.values as unknown[];
      const obj: Record<string, string> = {};
      let hasAnyValue = false;

      for (let c = 0; c < headers.length; c++) {
        const key = headers[c];
        if (!key) continue;
        // exceljs values 1-indexed, header[0] tuong ung row.values[1]
        const cellVal = rowValues[c + 1];
        const strVal = this.cellValueToString(cellVal).trim();
        if (strVal !== '') hasAnyValue = true;
        obj[key] = strVal;
      }

      if (hasAnyValue) rows.push(obj);
    }

    if (rows.length === 0) {
      throw new BadRequestException('Sheet khong co du lieu');
    }

    return {
      headers,
      rows,
      totalRows: rows.length,
    };
  }

  /**
   * Convert exceljs cell value to string
   * Handles: primitive, Date, rich text, formula result, hyperlink
   */
  private cellValueToString(val: unknown): string {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'number' || typeof val === 'boolean') return String(val);
    if (val instanceof Date) return val.toISOString();

    // exceljs object shapes
    if (typeof val === 'object') {
      const obj = val as Record<string, unknown>;
      // Rich text: { richText: [{ text: '...' }] }
      if (Array.isArray(obj.richText)) {
        return (obj.richText as Array<{ text?: string }>).map((t) => t.text ?? '').join('');
      }
      // Formula cell: { formula: '...', result: <value> }
      if ('result' in obj) {
        return this.cellValueToString(obj.result);
      }
      // Hyperlink: { text: '...', hyperlink: '...' }
      if (typeof obj.text === 'string') {
        return obj.text;
      }
      // Shared string / error fallback
      if (typeof obj.toString === 'function') {
        const s = obj.toString();
        if (s !== '[object Object]') return s;
      }
    }

    return String(val);
  }

  /**
   * Tao template Excel mau cho tung loai import
   */
  async generateTemplate(target: string): Promise<Buffer> {
    const headers = this.getTemplateHeaders(target);
    const sampleRows = this.getSampleData(target);

    const wb = new Workbook();
    const ws = wb.addWorksheet('Import Template');

    // Set columns va header row
    ws.columns = headers.map((h) => ({ header: h, key: h, width: 20 }));

    // Them sample data
    for (const row of sampleRows) {
      ws.addRow(row);
    }

    const arrayBuffer = await wb.xlsx.writeBuffer();
    // exceljs tra ArrayBuffer-like — convert sang Buffer
    return Buffer.from(arrayBuffer as ArrayBuffer);
  }

  private getTemplateHeaders(target: string): string[] {
    switch (target) {
      case 'product':
        return ['sku', 'product_name', 'category', 'price', 'compare_price', 'cost_price', 'color', 'size_group', 'sizes', 'quantity', 'description', 'status'];
      case 'inventory':
        return ['sku', 'warehouse', 'quantity', 'note'];
      case 'customer':
        return ['name', 'email', 'phone', 'address', 'city', 'district'];
      case 'price':
        return ['sku', 'price', 'compare_price', 'cost_price'];
      default:
        return ['sku', 'product_name', 'price'];
    }
  }

  private getSampleData(target: string): Record<string, string>[] {
    switch (target) {
      case 'product':
        return [
          { sku: 'POLO-001', product_name: 'Ao polo nam', category: 'ao-polo', price: '450000', compare_price: '550000', cost_price: '200000', color: 'Den,Trang', size_group: 'Size ao nam', sizes: 'S,M,L,XL', quantity: '50', description: 'Mo ta san pham', status: 'active' },
          { sku: 'JEAN-001', product_name: 'Quan jeans slim', category: 'quan-jeans', price: '650000', compare_price: '800000', cost_price: '300000', color: 'Xanh dam', size_group: 'Size quan nam', sizes: '29,30,31,32', quantity: '30', description: 'Mo ta san pham', status: 'active' },
        ];
      case 'inventory':
        return [
          { sku: 'POLO-001-DEN-M', warehouse: 'Kho chinh', quantity: '100', note: 'Nhap tu NCC' },
        ];
      case 'customer':
        return [
          { name: 'Nguyen Van A', email: 'a@example.com', phone: '0901234567', address: '123 Nguyen Hue', city: 'Ho Chi Minh', district: 'Quan 1' },
        ];
      case 'price':
        return [
          { sku: 'POLO-001', price: '450000', compare_price: '550000', cost_price: '200000' },
        ];
      default:
        return [];
    }
  }
}
