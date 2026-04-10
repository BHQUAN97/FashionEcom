import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, map } from 'rxjs';

/**
 * Wrap moi response thanh format chuan: { success, data, message, pagination? }
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((responseData) => {
        // Neu response da co format chuan thi giu nguyen
        if (responseData?.success !== undefined) return responseData;

        // Tach pagination neu co
        const { data, pagination, message, ...rest } = responseData || {};

        return {
          success: true,
          data: data ?? responseData,
          message: message || 'OK',
          ...(pagination && { pagination }),
          ...rest,
        };
      }),
    );
  }
}
