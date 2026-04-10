import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Global exception filter — tra response format chuan khi co loi
 */
@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Loi he thong, vui long thu lai';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();
      message = typeof exResponse === 'string'
        ? exResponse
        : (exResponse as any).message || exception.message;
    }

    // Log loi server (khong log 4xx)
    if (status >= 500) {
      console.error('[ERROR]', exception);
    }

    response.status(status).json({
      success: false,
      data: null,
      message: Array.isArray(message) ? message[0] : message,
    });
  }
}
