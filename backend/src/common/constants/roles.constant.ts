/**
 * 6 roles RBAC — tuong ung sys_user.sys_user_role
 * 0: Customer (storefront), 1-5: Admin panel
 */
export enum UserRole {
  CUSTOMER = 0,
  SUPER_ADMIN = 1,
  ADMIN = 2,
  MANAGER = 3,
  STAFF = 4,
  CONTENT_EDITOR = 5,
  WAREHOUSE = 6,
}

// Role names cho hien thi
export const ROLE_NAMES: Record<UserRole, string> = {
  [UserRole.CUSTOMER]: 'Khach hang',
  [UserRole.SUPER_ADMIN]: 'Super Admin',
  [UserRole.ADMIN]: 'Admin',
  [UserRole.MANAGER]: 'Quan ly',
  [UserRole.STAFF]: 'Nhan vien CSKH',
  [UserRole.CONTENT_EDITOR]: 'Bien tap vien',
  [UserRole.WAREHOUSE]: 'Thu kho',
};
