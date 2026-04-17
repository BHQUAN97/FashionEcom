import { Injectable, BadRequestException } from '@nestjs/common';

/**
 * Ket qua validate 1 dong
 */
interface RowValidation {
  valid: boolean;
  errors: Array<{ field: string; message: string }>;
  mapped: Record<string, unknown>;
}

/**
 * Ket qua diff — so sanh data import voi data hien co trong DB
 */
export interface DiffResult {
  toCreate: Record<string, unknown>[];
  toUpdate: Array<{ existing: Record<string, unknown>; incoming: Record<string, unknown>; changes: string[] }>;
  toSkip: Array<{ row: number; reason: string }>;
  errors: Array<{ row: number; field: string; message: string }>;
}

/**
 * DataMapperService — map columns tu file/sheet sang entity fields
 * Validate data, tinh diff (tao moi vs cap nhat)
 */
@Injectable()
export class DataMapperService {
  /**
   * Column mapping mac dinh cho tung target type
   * Key = ten cot trong file/sheet, Value = ten field trong DB
   */
  private readonly DEFAULT_MAPPINGS: Record<string, Record<string, string>> = {
    product: {
      sku: 'sku',
      product_name: 'catProductName',
      category: 'category',
      price: 'catProductPrice',
      compare_price: 'catProductComparePrice',
      cost_price: 'catProductCostPrice',
      color: 'colors',
      size_group: 'sizeGroup',
      sizes: 'sizes',
      quantity: 'quantity',
      description: 'catProductDescription',
      status: 'catProductStatus',
    },
    inventory: {
      sku: 'sku',
      warehouse: 'warehouse',
      quantity: 'quantity',
      note: 'note',
    },
    customer: {
      name: 'saleCustomerName',
      email: 'saleCustomerEmail',
      phone: 'saleCustomerPhone',
      address: 'saleCustomerAddress',
      city: 'saleCustomerCity',
      district: 'saleCustomerDistrict',
    },
    price: {
      sku: 'sku',
      price: 'catProductPrice',
      compare_price: 'catProductComparePrice',
      cost_price: 'catProductCostPrice',
    },
  };

  /**
   * Resolve column mapping — dung custom mapping neu co, fallback default
   */
  resolveMapping(target: string, customMapping?: Record<string, string> | null): Record<string, string> {
    const defaultMap = this.DEFAULT_MAPPINGS[target];
    if (!defaultMap) {
      throw new BadRequestException(`Target khong ho tro: ${target}`);
    }

    if (customMapping && Object.keys(customMapping).length > 0) {
      return customMapping;
    }

    return defaultMap;
  }

  /**
   * Auto-detect mapping tu headers file/sheet
   * Tim ten cot tuong tu (case-insensitive, bo dau)
   */
  autoDetectMapping(headers: string[], target: string): Record<string, string> {
    const defaultMap = this.DEFAULT_MAPPINGS[target] || {};
    const detected: Record<string, string> = {};

    for (const header of headers) {
      const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, '_');

      // Tim exact match truoc
      if (defaultMap[normalized]) {
        detected[header] = defaultMap[normalized];
        continue;
      }

      // Tim partial match
      for (const [key, value] of Object.entries(defaultMap)) {
        if (normalized.includes(key) || key.includes(normalized)) {
          detected[header] = value;
          break;
        }
      }
    }

    return detected;
  }

  /**
   * Map va validate tung dong du lieu
   */
  mapAndValidateRow(
    row: Record<string, string>,
    mapping: Record<string, string>,
    target: string,
    rowIndex: number,
  ): RowValidation {
    const mapped: Record<string, unknown> = {};
    const errors: Array<{ field: string; message: string }> = [];

    // Map cac columns
    for (const [sourceCol, targetField] of Object.entries(mapping)) {
      const value = row[sourceCol];
      if (value !== undefined && value !== '') {
        mapped[targetField] = value;
      }
    }

    // Validate theo target type
    if (target === 'product' || target === 'price') {
      if (!mapped.sku) {
        errors.push({ field: 'sku', message: `Dong ${rowIndex + 1}: SKU khong duoc de trong` });
      }
      // Validate gia — phai la so duong
      for (const priceField of ['catProductPrice', 'catProductComparePrice', 'catProductCostPrice']) {
        const val = mapped[priceField];
        if (val !== undefined) {
          const num = Number(String(val).replace(/[,.]/g, ''));
          if (isNaN(num) || num < 0) {
            errors.push({ field: priceField, message: `Dong ${rowIndex + 1}: Gia "${val}" khong hop le` });
          } else {
            mapped[priceField] = num;
          }
        }
      }
    }

    if (target === 'product') {
      if (!mapped.catProductName) {
        errors.push({ field: 'product_name', message: `Dong ${rowIndex + 1}: Ten san pham khong duoc de trong` });
      }
    }

    if (target === 'inventory') {
      if (!mapped.sku) {
        errors.push({ field: 'sku', message: `Dong ${rowIndex + 1}: SKU khong duoc de trong` });
      }
      const qty = Number(mapped.quantity);
      if (isNaN(qty) || qty < 0) {
        errors.push({ field: 'quantity', message: `Dong ${rowIndex + 1}: So luong "${mapped.quantity}" khong hop le` });
      } else {
        mapped.quantity = qty;
      }
    }

    if (target === 'customer') {
      if (!mapped.saleCustomerName && !mapped.saleCustomerEmail && !mapped.saleCustomerPhone) {
        errors.push({ field: 'name', message: `Dong ${rowIndex + 1}: Can it nhat ten, email hoac SDT` });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      mapped,
    };
  }

  /**
   * Map toan bo dataset va tra ve ket qua validate
   */
  mapAndValidateAll(
    rows: Record<string, string>[],
    mapping: Record<string, string>,
    target: string,
  ): {
    validRows: Record<string, unknown>[];
    errors: Array<{ row: number; field: string; message: string }>;
  } {
    const validRows: Record<string, unknown>[] = [];
    const allErrors: Array<{ row: number; field: string; message: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      const result = this.mapAndValidateRow(rows[i], mapping, target, i);
      if (result.valid) {
        validRows.push(result.mapped);
      } else {
        allErrors.push(...result.errors.map((e) => ({ row: i + 1, ...e })));
      }
    }

    return { validRows, errors: allErrors };
  }
}
