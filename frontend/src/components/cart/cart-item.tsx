'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { formatVND } from '@/lib/utils/format';
import { ROUTES } from '@/lib/constants/routes';
import { QuantityStepper } from '@/components/product/quantity-stepper';
import type { CartItem as CartItemType } from '@/lib/stores/cart.store';

interface CartItemProps {
  item: CartItemType;
  onUpdateQty: (value: number) => void;
  onRemove: () => void;
}

/** Cart item row — anh + info + variant + gia + qty stepper + delete */
export function CartItemRow({ item, onUpdateQty, onRemove }: CartItemProps) {
  return (
    <div className="flex gap-3 py-4 border-b">
      {/* Anh */}
      <Link href={ROUTES.PRODUCT_DETAIL(item.slug)} className="flex-shrink-0">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-gray-100 relative">
          <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link href={ROUTES.PRODUCT_DETAIL(item.slug)}>
          <h3 className="text-sm font-medium line-clamp-2">{item.name}</h3>
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="w-3 h-3 rounded-full border border-gray-300 inline-block"
            style={{ backgroundColor: item.color_hex }}
          />
          <span className="text-xs text-gray-500">
            {item.color} / {item.size}
          </span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <QuantityStepper
            value={item.qty}
            min={1}
            max={item.max_qty}
            onChange={onUpdateQty}
            size="sm"
          />
          <div className="text-right">
            <span className="text-sm font-bold text-red-600">{formatVND(item.price * item.qty)}</span>
            {item.compare_at_price > item.price && (
              <span className="text-xs text-gray-400 line-through block">
                {formatVND(item.compare_at_price * item.qty)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={onRemove}
        className="self-start p-1.5 text-gray-400 hover:text-red-600 transition"
        aria-label="Xóa sản phẩm"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
