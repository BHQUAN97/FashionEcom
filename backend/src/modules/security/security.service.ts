import { randomUUID } from 'crypto';
import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { AccessLogEntity, PasswordHistoryEntity } from './entities/access-log.entity';
import { BaseService } from '@/common/services/base.service';

/**
 * Password policy: min 8 ky tu, 1 hoa, 1 thuong, 1 so, 1 dac biet
 */
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;':",.<>?/`~]).{8,}$/;

@Injectable()
export class SecurityService extends BaseService<AccessLogEntity> {
  constructor(
    @InjectRepository(AccessLogEntity)
    private readonly accessLogRepo: Repository<AccessLogEntity>,
    @InjectRepository(PasswordHistoryEntity)
    private readonly pwHistoryRepo: Repository<PasswordHistoryEntity>,
  ) {
    super(accessLogRepo, 'logAccessId', 'Nhat ky truy cap');
  }

  /**
   * Validate password theo policy
   */
  validatePassword(password: string): { valid: boolean; message?: string } {
    if (!PASSWORD_REGEX.test(password)) {
      return {
        valid: false,
        message: 'Mat khau phai co it nhat 8 ky tu, bao gom: 1 chu hoa, 1 chu thuong, 1 so, 1 ky tu dac biet',
      };
    }
    return { valid: true };
  }

  /**
   * Kiem tra mat khau khong trung 5 mat khau cu
   */
  async checkPasswordHistory(userId: string, newPassword: string): Promise<boolean> {
    const history = await this.pwHistoryRepo.find({
      where: { sysUserId: userId },
      order: { createdDate: 'DESC' },
      take: 5,
    });

    for (const entry of history) {
      const match = await bcrypt.compare(newPassword, entry.sysPasswordHistoryHash);
      if (match) return false; // Trung voi mat khau cu
    }
    return true; // OK
  }

  /**
   * Luu mat khau vao lich su
   */
  async savePasswordHistory(userId: string, passwordHash: string) {
    const entry = this.pwHistoryRepo.create({
      sysPasswordHistoryId: randomUUID(),
      sysUserId: userId,
      sysPasswordHistoryHash: passwordHash,
    });
    await this.pwHistoryRepo.save(entry);
  }

  /**
   * Ghi log dang nhap
   */
  async logAccess(params: {
    userId?: string;
    email: string;
    success: boolean;
    ip: string;
    userAgent?: string;
  }) {
    const log = this.accessLogRepo.create({
      logAccessId: randomUUID(),
      sysUserId: params.userId || null,
      logAccessEmail: params.email,
      logAccessSuccess: params.success ? 1 : 0,
      logAccessIp: params.ip,
      logAccessUserAgent: params.userAgent || null,
    });
    await this.accessLogRepo.save(log);

    // Kiem tra suspicious login — IP/UA khac binh thuong
    if (params.success && params.userId) {
      await this.checkSuspiciousLogin(params.userId, params.ip, params.userAgent || '');
    }
  }

  /**
   * Kiem tra account bi lock — 5 lan sai lien tiep
   */
  async checkAccountLocked(email: string): Promise<boolean> {
    const recentLogs = await this.accessLogRepo.find({
      where: { logAccessEmail: email },
      order: { createdDate: 'DESC' },
      take: 5,
    });

    // Neu 5 lan gan nhat deu that bai va trong 30 phut
    if (recentLogs.length < 5) return false;

    const allFailed = recentLogs.every((l) => l.logAccessSuccess === 0);
    if (!allFailed) return false;

    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
    const oldestInWindow = recentLogs[4];
    return new Date(oldestInWindow.createdDate) > thirtyMinAgo;
  }

  /**
   * Lich su dang nhap — admin
   */
  async getLoginHistory(page = 1, limit = 20, email?: string) {
    const qb = this.accessLogRepo.createQueryBuilder('l');
    if (email) qb.andWhere('l.logAccessEmail LIKE :e', { e: `%${email}%` });
    qb.orderBy('l.createdDate', 'DESC');
    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();
    return this.paginate(data, total, page, limit);
  }

  /**
   * Phat hien dang nhap bat thuong — IP/UA khac voi 5 lan truoc
   */
  private async checkSuspiciousLogin(userId: string, ip: string, userAgent: string) {
    const recentLogs = await this.accessLogRepo.find({
      where: { sysUserId: userId, logAccessSuccess: 1 },
      order: { createdDate: 'DESC' },
      take: 5,
      skip: 1, // Bo qua lan hien tai
    });

    if (recentLogs.length === 0) return; // Lan dau login

    const knownIPs = new Set(recentLogs.map((l) => l.logAccessIp));
    if (!knownIPs.has(ip)) {
      // TODO: Gui email canh bao cho Super Admin
      // Tam thoi chi log — se tich hop voi NotificationsService sau
    }
  }
}
