import {
  Injectable, NestInterceptor, ExecutionContext, CallHandler,
} from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { Request, Response } from 'express';
import { SystemLogService } from '@/modules/system-log/system-log.service';

/**
 * AuthRequest — mo rong Express Request voi payload user da duoc gan tu JwtStrategy
 * JwtStrategy co the gan `userId` (chuan noi bo) hoac `sub` (chuan JWT claim)
 */
interface AuthRequest extends Request {
  user?: {
    userId?: string;
    sub?: string;
    role?: string;
  };
}

/**
 * HTTP Log Interceptor — ghi tat ca API request vao log_system
 * - 4xx/5xx: luon ghi (ERROR/WARN)
 * - 2xx POST/PUT/DELETE: ghi (INFO)
 * - 2xx GET: bo qua de giam noise
 * Chay async — khong block response
 */
@Injectable()
export class HttpLogInterceptor implements NestInterceptor {
  constructor(private readonly logService: SystemLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<AuthRequest>();
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse<Response>();
        const duration = Date.now() - start;
        // Async — khong await
        this.logService.write({
          method: req.method,
          url: req.originalUrl || req.url,
          status: res.statusCode,
          duration,
          requestBody: req.body,
          userId: req.user?.userId || req.user?.sub,
          ip: req.ip || req.socket?.remoteAddress,
          userAgent: req.headers['user-agent'],
        });
      }),
      catchError((err) => {
        const duration = Date.now() - start;
        const status = err?.status || err?.getStatus?.() || 500;
        // Async — khong await
        this.logService.write({
          method: req.method,
          url: req.originalUrl || req.url,
          status,
          duration,
          requestBody: req.body,
          error: err?.message || String(err),
          stack: status >= 500 ? err?.stack : undefined,
          userId: req.user?.userId || req.user?.sub,
          ip: req.ip || req.socket?.remoteAddress,
          userAgent: req.headers['user-agent'],
        });
        return throwError(() => err);
      }),
    );
  }
}
