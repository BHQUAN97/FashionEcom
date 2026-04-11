import { SetMetadata } from '@nestjs/common';

export const AUDITABLE_KEY = 'auditable_entity_type';

/**
 * Decorator @Auditable(entityType) — danh dau route can ghi audit log
 * Su dung: @Auditable('cat_product') tren controller method
 */
export const Auditable = (entityType: string) => SetMetadata(AUDITABLE_KEY, entityType);
