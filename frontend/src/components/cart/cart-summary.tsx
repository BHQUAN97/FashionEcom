'use client';

import { formatVND } from '@/lib/utils/format';
import { CONFIG } from '@/lib/constants/config';

interface CartSummaryProps {
  subtotal: number;
  discount?: number;
  shippingFee?: number;
}

/** Cart summary — subtotal, discount, shipping, total */
export function CartSummary({ subtotal, discount = 0, shippingFee }: CartSummaryProps) {
  const isFreeShip = subtotal >= CONFIG.FREE_SHIP_THRESHOLD;
  const actualShipping = shippingFee ?? (isFreeShip ? 0 : CONFIG.DEFAULT_SHIPPING_FEE);
  const total = subtotal - discount + actualShipping;

  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-500">Tam tinh</span>
        <span>{formatVND(subtotal)}</span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-green-600">
          <span>Giam gia</span>
          <span>-{formatVND(discount)}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span className="text-gray-500">Phi van chuyen</span>
        <span>{actualShipping === 0 ? <span className="text-green-600">Mien phi</span> : formatVND(actualShipping)}</span>
      </div>
      <div className="flex justify-between font-bold text-base pt-2 border-t">
        <span>Tong cong</span>
        <span className="text-red-600">{formatVND(total)}</span>
      </div>
    </div>
  );
}
