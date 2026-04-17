'use client';

import { useCartStore } from '@/lib/stores/cart.store';
import { CartSummary } from '@/components/cart/cart-summary';

/** Order summary panel — desktop sticky panel, tu dong tinh free ship */
export function OrderSummaryPanel() {
  const subtotal = useCartStore((s) => s.getSubtotal());

  // Khong truyen shippingFee → CartSummary tu tinh dua tren FREE_SHIP_THRESHOLD
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="font-semibold text-sm mb-3">Tổng đơn hàng</h3>
      <CartSummary subtotal={subtotal} />
    </div>
  );
}
