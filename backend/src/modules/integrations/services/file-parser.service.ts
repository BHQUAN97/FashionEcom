import { Injectable, BadRequestException } from '@nestjs/common';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';

/**
 * FileParserService — parse CSV va Excel files thanh JSON rows
 * Ho tro: .csv (UTF-8 BOM), .xlsx, .xls
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
  parseFile(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
  ): { headers: string[]; rows: Record<string, string>[]; totalRows: number } {
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
   * Parse Excel — dung xlsx, doc sheet dau tien
   */
  private parseExcel(buffer: Buffer): { headers: string[]; rows: Record<string, string>[]; totalRows: number } {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      throw new BadRequestException('File Excel khong co sheet nao');
    }

    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' });

    if (jsonData.length === 0) {
      throw new BadRequestException('Sheet khong co du lieu');
    }

    const headers = Object.keys(jsonData[0]);

    return {
      headers,
      rows: jsonData.map((row) => {
        // Dam bao tat ca values la string
        const cleaned: Record<string, string> = {};
        for (const key of headers) {
          cleaned[key] = String(row[key] ?? '').trim();
        }
        return cleaned;
      }),
      totalRows: jsonData.length,
    };
  }

  /**
   * Tao template Excel mau cho tung loai import
   */
  generateTemplate(target: string): Buffer {
    const headers = this.getTemplateHeaders(target);
    const sampleRows = this.getSampleData(target);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleRows, { header: headers });

    // Set column widths
    ws['!cols'] = headers.map(() => ({ wch: 20 }));

    XLSX.utils.book_append_sheet(wb, ws, 'Import Template');

    return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
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
