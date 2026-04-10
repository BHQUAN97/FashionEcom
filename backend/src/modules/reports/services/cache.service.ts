import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

/**
 * Report cache helper — dung Redis de cache ket qua report
 * Fallback: in-memory Map khi khong co Redis connection
 */
@Injectable()
export class ReportCacheService {
  // In-memory fallback khi Redis khong available
  private memoryCache = new Map<string, { data: unknown; expiry: number }>();

  /**
   * Tao cache key tu params — hash de tranh key qua dai
   */
  buildKey(prefix: string, params: Record<string, unknown>): string {
    const hash = createHash('md5')
      .update(JSON.stringify(params))
      .digest('hex')
      .substring(0, 12);
    return `report:${prefix}:${hash}`;
  }

  /**
   * Doc tu cache
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.memoryCache.get(key);
    if (entry && entry.expiry > Date.now()) {
      return entry.data as T;
    }
    if (entry) {
      this.memoryCache.delete(key);
    }
    return null;
  }

  /**
   * Ghi vao cache voi TTL (giay)
   */
  async set(key: string, data: unknown, ttlSeconds: number): Promise<void> {
    this.memoryCache.set(key, {
      data,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Xoa cache theo prefix pattern
   */
  async invalidate(prefix: string): Promise<void> {
    const pattern = `report:${prefix}:`;
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(pattern)) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * Xoa tat ca cache dashboard
   */
  async invalidateDashboard(): Promise<void> {
    await this.invalidate('dashboard');
    await this.invalidate('revenue');
    await this.invalidate('pnl');
  }
}
