import { UserRole } from './roles.constant';

/**
 * Permission matrix: role → allowed modules
 * RBAC 6 roles theo spec Muc 10.4
 */
export const PERMISSION_MATRIX: Record<number, string[]> = {
  [UserRole.SUPER_ADMIN]: ['*'], // Tat ca quyen, ke ca xoa va billing
  [UserRole.ADMIN]: [
    'dashboard', 'products', 'categories', 'attributes', 'orders',
    'inventory', 'customers', 'promotions', 'layout', 'reports',
    'settings', 'users', 'media', 'audit',
  ],
  [UserRole.MANAGER]: [
    'dashboard', 'products', 'categories', 'orders', 'inventory',
    'customers', 'reports', 'media',
  ],
  [UserRole.STAFF]: [
    'orders:read', 'orders:update', 'customers:read',
  ],
  [UserRole.CONTENT_EDITOR]: [
    'products:update', 'categories', 'layout', 'media',
  ],
  [UserRole.WAREHOUSE]: [
    'inventory', 'orders:read',
  ],
};
