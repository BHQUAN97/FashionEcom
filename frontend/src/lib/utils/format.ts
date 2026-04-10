/**
 * Format tien VND — 1500000 → "1.500.000₫"
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Format % giam gia — 0.2 → "-20%"
 */
export function formatDiscount(original: number, sale: number): string {
  if (original <= 0) return '';
  const pct = Math.round(((original - sale) / original) * 100);
  return `-${pct}%`;
}

/**
 * Format ngay tieng Viet — "10/04/2026"
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('vi-VN').format(new Date(date));
}
