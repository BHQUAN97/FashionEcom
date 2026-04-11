import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AuditLogEntity } from './entities/audit-log.entity';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditRepo: Repository<AuditLogEntity>,
  ) {}

  /**
   * Danh sach audit logs + filter + pagination
   */
  async findAll(query: PaginationDto & {
    entityType?: string;
    userId?: string;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);

    const qb = this.auditRepo.createQueryBuilder('a');

    if (query.entityType) {
      qb.andWhere('a.logAuditEntityType = :type', { type: query.entityType });
    }
    if (query.userId) {
      qb.andWhere('a.sysUserId = :uid', { uid: query.userId });
    }
    if (query.action) {
      qb.andWhere('a.logAuditAction = :act', { act: query.action });
    }
    if (query.dateFrom) {
      qb.andWhere('a.createdDate >= :df', { df: query.dateFrom });
    }
    if (query.dateTo) {
      qb.andWhere('a.createdDate <= :dt', { dt: query.dateTo });
    }
    if (query.search) {
      qb.andWhere('(a.logAuditEntityId LIKE :s OR a.logAuditEntityName LIKE :s)', { s: `%${query.search}%` });
    }

    qb.orderBy('a.createdDate', 'DESC');

    const total = await qb.getCount();
    const data = await qb.skip((page - 1) * limit).take(limit).getMany();

    return {
      data,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    };
  }

  /**
   * Chi tiet 1 audit log entry
   */
  async findOne(id: string) {
    return this.auditRepo.findOne({ where: { logAuditId: id } });
  }

  /**
   * Ghi audit log — duoc goi tu interceptor hoac service
   */
  async log(params: {
    action: string;
    entityType: string;
    entityId: string;
    changes?: string;
    ip?: string;
    userId: string;
  }) {
    const entry = this.auditRepo.create({
      logAuditId: uuidv4(),
      logAuditAction: params.action,
      logAuditEntityType: params.entityType,
      logAuditEntityId: params.entityId,
      logAuditChanges: params.changes || null,
      logAuditIp: params.ip || null,
      sysUserId: params.userId,
    });
    return this.auditRepo.save(entry);
  }
}
