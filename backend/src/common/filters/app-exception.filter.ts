import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global exception filter — tra response theo chuan RFC 7807 (Problem Details for HTTP APIs)
 * Status code HTTP van giu dung, chi dinh dang response body
 */
@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let title = 'Internal Server Error';
    let detail: string | string[] = 'Loi he thong, vui long thu lai';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      title = this.statusToTitle(status);
      const exResponse = exception.getResponse();

      if (typeof exResponse === 'string') {
        detail = exResponse;
      } else if (this.isRecord(exResponse)) {
        // Narrow qua Record<string, unknown> thay vi as any
        const maybeMessage = exResponse.message;
        if (typeof maybeMessage === 'string') {
          detail = maybeMessage;
        } else if (Array.isArray(maybeMessage) && maybeMessage.every((m) => typeof m === 'string')) {
          detail = maybeMessage as string[];
        } else {
          detail = exception.message;
        }
      } else {
        detail = exception.message;
      }
    }

    // Log loi server (khong log 4xx) — dung NestJS Logger chuan thay vi console.error
    if (status >= 500) {
      const err = exception instanceof Error ? exception : new Error(String(exception));
      this.logger.error(err.message, err.stack);
    }

    const firstDetail = Array.isArray(detail) ? detail[0] : detail;

    // RFC 7807 Problem Details response format
    response.status(status).json({
      type: 'about:blank',
      title,
      status,
      detail: firstDetail,
      instance: request?.originalUrl || request?.url || '',
    });
  }

  /** Type guard — exResponse la object co the index */
  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  /** Map HTTP status code → title ngan gon theo chuan HTTP */
  private statusToTitle(status: number): string {
    const map: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      422: 'Unprocessable Entity',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
    };
    return map[status] || 'Error';
  }
}
