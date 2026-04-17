import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Cho phep ca dang c0000000-0000-... (seeded data)
const PREFIXED_UUID = /^[a-z0-9]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validate UUID param — chan SQL injection qua route params
 * Dung voi @Param('id', ParseUUIDPipe): tuy nhien NestJS built-in ParseUUIDPipe
 * khong chap nhan format cu cua seeded data, nen dung pipe custom
 */
@Injectable()
export class ValidateUUIDPipe implements PipeTransform<string> {
  transform(value: string): string {
    if (!UUID_REGEX.test(value) && !PREFIXED_UUID.test(value)) {
      throw new BadRequestException('ID khong hop le');
    }
    return value;
  }
}
