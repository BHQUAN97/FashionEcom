'use client';

import { ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatVND } from '@/lib/utils/format';

interface StickyBottomCTAProps {
  price: number;
  compareAtPrice?: number;
  onAddToCart: () => void;
  onBuyNow: () => void;
  disabled?: boolean;
  className?: string;
}

/** Sticky bottom CTA bar — mobile/tablet only, gia + 2 nut: Them gio + Mua ngay */
export function StickyBottomCTA({
  price,
  compareAtPrice,
  onAddToCart,
  onBuyNow,
  disabled = false,
  className,
}: StickyBottomCTAProps) {
  const hasSale = compareAtPrice && compareAtPrice > price;

  return (
    <div
      className={cn(
        'fixed bottom-14 inset-x-0 z-40 bg-white border-t px-4 py-3 md:bottom-0 lg:hidden',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {/* Gia */}
        <div className="flex-1 min-w-0">
          <span className={cn('text-lg font-bold', hasSale ? 'text-red-600' : 'text-gray-900')}>
            {formatVND(price)}
          </span>
          {hasSale && (
            <span className="text-sm text-gray-400 line-through ml-2">{formatVND(compareAtPrice)}</span>
          )}
        </div>

        {/* Buttons */}
        <button
          onClick={onAddToCart}
          disabled={disabled}
          className="flex items-center gap-1.5 px-4 py-2.5 border-2 border-red-600 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 transition disabled:opacity-50"
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="hidden sm:inline">THEM GIO</span>
        </button>
        <button
          onClick={onBuyNow}
          disabled={disabled}
          className="px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50"
        >
          MUA NGAY
        </button>
      </div>
    </div>
  );
}
