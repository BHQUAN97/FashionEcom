import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { AUDITABLE_KEY } from '../decorators/auditable.decorator';
import { AuditService } from '../../modules/audit/audit.service';

/**
 * AuditLogInterceptor — tu dong ghi audit log cho routes co @Auditable decorator
 * Ghi sau khi handler thanh cong (khong block response)
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const entityType = this.reflector.get<string>(AUDITABLE_KEY, context.getHandler());
    if (!entityType) return next.handle(); // Khong co decorator — bo qua

    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const user = request.user;

    // Map HTTP method -> audit action
    let action = 'VIEW';
    if (method === 'POST') action = 'CREATE';
    else if (method === 'PUT' || method === 'PATCH') action = 'UPDATE';
    else if (method === 'DELETE') action = 'DELETE';

    return next.handle().pipe(
      tap((responseData) => {
        // Async ghi log — khong block response
        const entityId = request.params?.id || responseData?.data?.id || '';
        const ip = (request.headers['x-forwarded-for'] as string) || request.ip || '';

        this.auditService
          .log({
            action,
            entityType,
            entityId: String(entityId),
            changes: method !== 'GET' ? JSON.stringify(request.body) : undefined,
            ip,
            userId: user?.sub || user?.userId || 'unknown',
          })
          .catch(() => {}); // Khong throw loi neu audit fail
      }),
    );
  }
}
