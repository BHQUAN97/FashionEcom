import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { SystemLogEntity } from './entities/system-log.entity';
import { SystemLogQueryDto } from './dto/system-log-query.dto';

/** Muc log — map tu HTTP status code */
export function statusToLevel(status: number): string {
  if (status >= 500) return 'ERROR';
  if (status >= 400) return 'WARN';
  return 'INFO';
}

/** Loai bo cac truong nhay cam khoi request body */
function sanitizeBody(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const SENSITIVE = ['password', 'token', 'secret', 'accessToken', 'refreshToken', 'currentPassword', 'newPassword'];
  const cleaned = { ...body as Record<string, unknown> };
  for (const key of SENSITIVE) {
    if (key in cleaned) cleaned[key] = '***';
  }
  const str = JSON.stringify(cleaned);
  // Gioi han 2KB de khong lam phình DB
  return str.length > 2048 ? str.slice(0, 2048) + '...' : str;
}

@Injectable()
export class SystemLogService {
  constructor(
    @InjectRepository(SystemLogEntity)
    private readonly repo: Repository<SystemLogEntity>,
  ) {}

  /**
   * Ghi 1 log entry — chay async, khong block request
   * Ghi tat ca 4xx/5xx, sample 2xx (chi ghi POST/PUT/DELETE 2xx, bo GET 2xx de giam noise)
   */
  async write(data: {
    method: string;
    url: string;
    status: number;
    duration: number;
    requestBody?: unknown;
    error?: string;
    stack?: string;
    userId?: string;
    ip?: string;
    userAgent?: string;
  }): Promise<void> {
    // Bo qua GET 2xx va health check de giam noise
    if (data.status < 400 && data.method === 'GET') return;
    if (data.url === '/health' || data.url === '/api/health') return;

    const entry = new SystemLogEntity();
    entry.logSystemId = crypto.randomUUID();
    entry.logSystemLevel = statusToLevel(data.status);
    entry.logSystemMethod = data.method;
    entry.logSystemUrl = data.url.length > 500 ? data.url.slice(0, 500) : data.url;
    entry.logSystemStatus = data.status;
    entry.logSystemDuration = data.duration;
    entry.logSystemRequestBody = data.method !== 'GET' ? sanitizeBody(data.requestBody) : null;
    entry.logSystemError = data.error || null;
    entry.logSystemStack = data.status >= 500 ? (data.stack || null) : null;
    entry.sysUserId = data.userId || null;
    entry.logSystemIp = data.ip || null;
    entry.logSystemUserAgent = data.userAgent ? data.userAgent.slice(0, 500) : null;

    try {
      await this.repo.save(entry);
    } catch {
      // Fail-safe: khong de log lam sap app
      console.error('[SystemLog] Failed to write log entry');
    }
  }

  /** Truy van log co filter + pagination */
  async findAll(query: SystemLogQueryDto) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 50, 100);

    const qb = this.repo.createQueryBuilder('log')
      .orderBy('log.createdDate', 'DESC');

    if (query.level) {
      qb.andWhere('log.logSystemLevel = :level', { level: query.level });
    }
    if (query.method) {
      qb.andWhere('log.logSystemMethod = :method', { method: query.method });
    }
    if (query.url) {
      qb.andWhere('log.logSystemUrl LIKE :url', { url: `%${query.url}%` });
    }
    if (query.statusMin && query.statusMax) {
      qb.andWhere('log.logSystemStatus BETWEEN :min AND :max', { min: query.statusMin, max: query.statusMax });
    } else if (query.statusMin) {
      qb.andWhere('log.logSystemStatus >= :min', { min: query.statusMin });
    } else if (query.statusMax) {
      qb.andWhere('log.logSystemStatus <= :max', { max: query.statusMax });
    }
    if (query.dateFrom) {
      qb.andWhere('log.createdDate >= :dateFrom', { dateFrom: `${query.dateFrom} 00:00:00` });
    }
    if (query.dateTo) {
      qb.andWhere('log.createdDate <= :dateTo', { dateTo: `${query.dateTo} 23:59:59` });
    }

    const [items, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /** Thong ke nhanh — dem theo level */
  async getStats() {
    const result = await this.repo.createQueryBuilder('log')
      .select('log.logSystemLevel', 'level')
      .addSelect('COUNT(*)', 'count')
      .groupBy('log.logSystemLevel')
      .getRawMany();

    return result.reduce((acc, r) => {
      acc[r.level] = Number(r.count);
      return acc;
    }, {} as Record<string, number>);
  }

  /** Xoa log cu hon N ngay — chay cron hoac manual */
  async cleanup(olderThanDays: number = 30): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - olderThanDays);
    const result = await this.repo.createQueryBuilder()
      .delete()
      .where('createdDate < :cutoff', { cutoff })
      .execute();
    return result.affected || 0;
  }
}
