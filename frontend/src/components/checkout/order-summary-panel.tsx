'use client';

import { useCartStore } from '@/lib/stores/cart.store';
import { useCheckoutStore } from '@/lib/stores/checkout.store';
import { CartSummary } from '@/components/cart/cart-summary';

/** Order summary panel — desktop sticky panel */
export function OrderSummaryPanel() {
  const subtotal = useCartStore((s) => s.getSubtotal());
  const shippingFee = useCheckoutStore((s) => s.shippingFee);

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="font-semibold text-sm mb-3">Tong don hang</h3>
      <CartSummary subtotal={subtotal} shippingFee={shippingFee} />
    </div>
  );
}
