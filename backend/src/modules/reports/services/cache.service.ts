import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { createHash } from 'crypto';

/**
 * Report cache helper — dung Redis (qua global CacheModule) de cache ket qua report
 * API giu nguyen de khong phai sua cac service dang dung (funnel, pnl, revenue, ...)
 */
@Injectable()
export class ReportCacheService {
  private readonly logger = new Logger(ReportCacheService.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

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
    try {
      const value = await this.cache.get<T>(key);
      return (value ?? null) as T | null;
    } catch (err) {
      this.logger.warn(`Cache get failed for key=${key}: ${(err as Error).message}`);
      return null;
    }
  }

  /**
   * Ghi vao cache voi TTL (giay) — cache-manager v7 dung milliseconds
   */
  async set(key: string, data: unknown, ttlSeconds: number): Promise<void> {
    try {
      await this.cache.set(key, data, ttlSeconds * 1000);
    } catch (err) {
      this.logger.warn(`Cache set failed for key=${key}: ${(err as Error).message}`);
    }
  }

  /**
   * Xoa cache theo prefix pattern — duyet tat ca key khop pattern "report:<prefix>:*"
   * Uu tien dung SCAN truc tiep tren Redis client de khong block event loop
   */
  async invalidate(prefix: string): Promise<void> {
    const pattern = `report:${prefix}:*`;
    try {
      const keys = await this.findKeys(pattern);
      if (keys.length === 0) return;
      await Promise.all(keys.map((k) => this.cache.del(k)));
    } catch (err) {
      this.logger.warn(
        `Cache invalidate failed for pattern=${pattern}: ${(err as Error).message}`,
      );
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

  /**
   * Tim key theo pattern — Redis (SCAN) neu co, fallback Keyv iterator
   * Tra ve [] neu store khong ho tro enumerate (safe no-op)
   */
  private async findKeys(pattern: string): Promise<string[]> {
    try {
      // cache-manager v7 expose stores: Keyv[]
      const stores = (this.cache as unknown as { stores?: unknown[] }).stores;
      if (!Array.isArray(stores) || stores.length === 0) return [];

      const results: string[] = [];
      for (const store of stores) {
        const keyv = store as {
          opts?: { store?: { client?: unknown; namespace?: string } };
          iterator?: (ns?: string) => AsyncIterable<[string, unknown]>;
        };

        // Truong hop Redis: dung SCAN tren native client
        const redisClient = keyv.opts?.store?.client as
          | { scanIterator?: (opts: { MATCH: string; COUNT: number }) => AsyncIterable<string> }
          | undefined;
        if (redisClient?.scanIterator) {
          for await (const key of redisClient.scanIterator({ MATCH: pattern, COUNT: 200 })) {
            // Strip namespace prefix neu co ("namespace::key" -> "key")
            const ns = keyv.opts?.store?.namespace;
            const stripped = ns && key.startsWith(`${ns}::`) ? key.slice(ns.length + 2) : key;
            results.push(stripped);
          }
          continue;
        }

        // Fallback Keyv iterator (in-memory / khac) — ho tro pattern "prefix*"
        if (typeof keyv.iterator === 'function') {
          const re = patternToRegex(pattern);
          for await (const [key] of keyv.iterator()) {
            if (re.test(key)) results.push(key);
          }
        }
      }
      return results;
    } catch {
      return [];
    }
  }
}

/**
 * Convert Redis glob pattern sang RegExp ("report:dashboard:*" -> /^report:dashboard:.*$/)
 */
function patternToRegex(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`);
}
