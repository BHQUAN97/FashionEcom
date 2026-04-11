import { ForbiddenException } from '@nestjs/common';
import { CsrfMiddleware } from './csrf.middleware';

describe('CsrfMiddleware', () => {
  let middleware: CsrfMiddleware;
  let mockNext: jest.Mock;

  beforeEach(() => {
    middleware = new CsrfMiddleware();
    mockNext = jest.fn();
  });

  it('nen cho phep GET request khong can header', () => {
    const req = { method: 'GET', headers: {} } as any;
    middleware.use(req, {} as any, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('nen cho phep HEAD request khong can header', () => {
    const req = { method: 'HEAD', headers: {} } as any;
    middleware.use(req, {} as any, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('nen cho phep OPTIONS request khong can header', () => {
    const req = { method: 'OPTIONS', headers: {} } as any;
    middleware.use(req, {} as any, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('nen throw ForbiddenException khi POST khong co X-Requested-With', () => {
    const req = { method: 'POST', headers: {} } as any;
    expect(() => middleware.use(req, {} as any, mockNext)).toThrow(ForbiddenException);
  });

  it('nen throw ForbiddenException khi PUT khong co X-Requested-With', () => {
    const req = { method: 'PUT', headers: {} } as any;
    expect(() => middleware.use(req, {} as any, mockNext)).toThrow(ForbiddenException);
  });

  it('nen throw ForbiddenException khi DELETE khong co X-Requested-With', () => {
    const req = { method: 'DELETE', headers: {} } as any;
    expect(() => middleware.use(req, {} as any, mockNext)).toThrow(ForbiddenException);
  });

  it('nen cho phep POST khi co X-Requested-With header', () => {
    const req = { method: 'POST', headers: { 'x-requested-with': 'XMLHttpRequest' } } as any;
    middleware.use(req, {} as any, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
});
