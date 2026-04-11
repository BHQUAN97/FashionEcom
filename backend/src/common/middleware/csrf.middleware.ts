import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * CSRF protection — yeu cau X-Requested-With header cho mutating requests.
 * JWT bearer-token khong gui qua cookie nen CSRF risk thap,
 * nhung header check la defense-in-depth chong cross-origin form submission.
 */
@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private readonly SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

  use(req: Request, _res: Response, next: NextFunction) {
    // Safe methods khong can check
    if (this.SAFE_METHODS.includes(req.method)) {
      return next();
    }

    // Kiem tra custom header — browser khong gui header nay tu cross-origin form
    const xRequestedWith = req.headers['x-requested-with'];
    if (!xRequestedWith) {
      throw new ForbiddenException('Missing X-Requested-With header');
    }

    next();
  }
}
