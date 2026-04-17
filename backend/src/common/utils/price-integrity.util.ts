/**
 * Price integrity utilities — dam bao gia khong bi can thiep
 * Dung khi tao order, thanh toan, hoan tien
 */

/**
 * Tinh gia hieu luc (effective price) cho variant
 * Uu tien: sale_price (fixed) > discount % > original price
 */
export function calcEffectivePrice(
  originalPrice: number,
  salePrice?: number | null,
  discountType?: number | null,
  discountValue?: number | null,
): number {
  // Sale price co dinh — override tat ca
  if (salePrice != null && salePrice > 0) return Number(salePrice);

  // Tinh tu %
  if (discountType === 1 && discountValue && discountValue > 0) {
    return Math.round(originalPrice * (1 - Number(discountValue) / 100));
  }

  // Tinh tu so tien giam
  if (discountType === 2 && discountValue && discountValue > 0) {
    return Math.max(0, originalPrice - Number(discountValue));
  }

  return originalPrice;
}

/**
 * Validate order total khop voi tong gia items tu DB
 * Tra ve true neu khop, false neu bi can thiep
 */
export function validateOrderTotal(
  items: { price: number; qty: number }[],
  shippingFee: number,
  discountAmount: number,
  expectedTotal: number,
  tolerance = 1, // Cho sai so 1 dong do lam tron
): { valid: boolean; calculatedTotal: number } {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const calculatedTotal = Math.max(0, subtotal + shippingFee - discountAmount);
  const valid = Math.abs(calculatedTotal - expectedTotal) <= tolerance;
  return { valid, calculatedTotal };
}

/**
 * Kiem tra gia tu client co khop DB — chong replay/tampering
 * Dung khi checkout: so sanh gia client gui voi gia variant hien tai
 */
export function validateItemPrices(
  clientItems: { variantId: string; price: number }[],
  dbPrices: Map<string, number>, // variantId → effective price tu DB
  tolerance = 1,
): { valid: boolean; mismatches: { variantId: string; clientPrice: number; dbPrice: number }[] } {
  const mismatches: { variantId: string; clientPrice: number; dbPrice: number }[] = [];

  for (const item of clientItems) {
    const dbPrice = dbPrices.get(item.variantId);
    if (dbPrice === undefined) {
      mismatches.push({ variantId: item.variantId, clientPrice: item.price, dbPrice: -1 });
      continue;
    }
    if (Math.abs(item.price - dbPrice) > tolerance) {
      mismatches.push({ variantId: item.variantId, clientPrice: item.price, dbPrice });
    }
  }

  return { valid: mismatches.length === 0, mismatches };
}
