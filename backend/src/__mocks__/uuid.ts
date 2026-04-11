// Mock uuid module cho Jest (uuid v13 la ESM-only)
let counter = 0;
export const v4 = (): string => `mock-uuid-${++counter}`;
export const v7 = (): string => `mock-uuid7-${++counter}`;
export const validate = (s: string): boolean => /^[0-9a-f-]+$/.test(s) || s.startsWith('mock-uuid');
