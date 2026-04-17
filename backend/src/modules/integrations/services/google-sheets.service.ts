import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, sheets_v4 } from 'googleapis';

/**
 * GoogleSheetsService — doc du lieu tu Google Sheets API
 * Su dung API Key (read-only, sheet phai public) hoac Service Account
 *
 * Cau hinh env:
 *   GOOGLE_API_KEY — API key cho read-only access (sheet phai share "Anyone with the link")
 *   GOOGLE_SERVICE_ACCOUNT_JSON — JSON key file path cho service account (optional, full access)
 */
@Injectable()
export class GoogleSheetsService {
  private readonly logger = new Logger(GoogleSheetsService.name);
  private sheetsApi: sheets_v4.Sheets | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initClient();
  }

  /**
   * Khoi tao Google Sheets client
   * Uu tien Service Account, fallback API Key
   */
  private initClient() {
    const serviceAccountJson = this.configService.get<string>('GOOGLE_SERVICE_ACCOUNT_JSON');
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');

    if (serviceAccountJson) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const credentials = JSON.parse(serviceAccountJson);
        const auth = new google.auth.GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });
        this.sheetsApi = google.sheets({ version: 'v4', auth });
        this.logger.log('Google Sheets: khoi tao voi Service Account');
      } catch (err) {
        this.logger.warn('Google Sheets: loi parse service account JSON, fallback API Key');
      }
    }

    if (!this.sheetsApi && apiKey) {
      this.sheetsApi = google.sheets({ version: 'v4', auth: apiKey });
      this.logger.log('Google Sheets: khoi tao voi API Key (read-only, sheet phai public)');
    }

    if (!this.sheetsApi) {
      this.logger.warn('Google Sheets: CHUA cau hinh — set GOOGLE_API_KEY hoac GOOGLE_SERVICE_ACCOUNT_JSON trong .env');
    }
  }

  /**
   * Trich sheet ID tu URL Google Sheet
   * VD: https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/edit
   * → "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
   */
  extractSheetId(url: string): string {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    if (!match) {
      throw new BadRequestException('URL Google Sheet khong hop le. VD: https://docs.google.com/spreadsheets/d/...');
    }
    return match[1];
  }

  /**
   * Doc du lieu tu Google Sheet — tra ve headers + rows
   */
  async readSheet(
    sheetId: string,
    sheetName: string = 'Sheet1',
  ): Promise<{ headers: string[]; rows: Record<string, string>[]; totalRows: number }> {
    if (!this.sheetsApi) {
      throw new BadRequestException(
        'Google Sheets chua duoc cau hinh. Them GOOGLE_API_KEY vao file .env va dam bao sheet duoc chia se "Anyone with the link"',
      );
    }

    try {
      const response = await this.sheetsApi.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: sheetName,
      });

      const values = response.data.values;
      if (!values || values.length < 2) {
        throw new BadRequestException('Sheet khong co du lieu hoac chi co header');
      }

      // Dong dau la header, cac dong sau la data
      const rawHeaders = values[0].map((h: string) => String(h).trim());
      const dataRows = values.slice(1);

      const rows = dataRows
        .filter((row) => row.some((cell: string) => String(cell).trim() !== ''))
        .map((row) => {
          const obj: Record<string, string> = {};
          rawHeaders.forEach((header: string, i: number) => {
            obj[header] = String(row[i] ?? '').trim();
          });
          return obj;
        });

      return {
        headers: rawHeaders,
        rows,
        totalRows: rows.length,
      };
    } catch (err: unknown) {
      if (err instanceof BadRequestException) throw err;

      const message = err instanceof Error ? err.message : 'Unknown error';

      // Loi pho bien
      if (message.includes('404') || message.includes('not found')) {
        throw new BadRequestException('Khong tim thay Google Sheet. Kiem tra URL va quyen truy cap');
      }
      if (message.includes('403') || message.includes('permission')) {
        throw new BadRequestException('Khong co quyen doc Sheet. Dam bao sheet duoc chia se "Anyone with the link"');
      }
      if (message.includes('Unable to parse range')) {
        throw new BadRequestException(`Khong tim thay tab "${sheetName}" trong Sheet`);
      }

      this.logger.error(`Google Sheets error: ${message}`);
      throw new BadRequestException('Loi doc Google Sheet. Kiem tra URL va quyen truy cap');
    }
  }

  /**
   * Lay danh sach tab (sheet names) trong 1 spreadsheet
   */
  async getSheetNames(sheetId: string): Promise<string[]> {
    if (!this.sheetsApi) {
      throw new BadRequestException('Google Sheets chua duoc cau hinh');
    }

    const response = await this.sheetsApi.spreadsheets.get({
      spreadsheetId: sheetId,
      fields: 'sheets.properties.title',
    });

    return response.data.sheets?.map((s) => s.properties?.title || '') || [];
  }

  /**
   * Kiem tra co khoi tao duoc Google Sheets API khong
   */
  isConfigured(): boolean {
    return this.sheetsApi !== null;
  }
}
