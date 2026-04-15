'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatVND } from '@/lib/utils/format';

interface StickyBottomCTAProps {
  /** Product thumbnail */
  image: string;
  productName: string;
  price: number;
  compareAtPrice?: number;
  /** Danh sach mau sac */
  colors: { id: string; name: string; hex: string }[];
  selectedColorId: string | null;
  onColorChange: (id: string) => void;
  /** Danh sach size — chi hien thi available */
  sizes: { id: string; name: string; available?: boolean }[];
  selectedSizeId: string | null;
  onSizeChange: (id: string) => void;
  /** So luong */
  qty: number;
  maxQty: number;
  onQtyChange: (qty: number) => void;
  /** Actions */
  onBuyNow: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Sticky bottom bar — Torano style
 * Hien thi khi user scroll qua phan product info chinh
 * Desktop: anh + gia + mau sac buttons + size dropdown + qty + MUA NGAY
 * Mobile: gia + MUA NGAY (compact)
 */
export function StickyBottomCTA({
  image,
  productName,
  price,
  compareAtPrice,
  colors,
  selectedColorId,
  onColorChange,
  sizes,
  selectedSizeId,
  onSizeChange,
  qty,
  maxQty,
  onQtyChange,
  onBuyNow,
  disabled = false,
  className,
}: StickyBottomCTAProps) {
  const [visible, setVisible] = useState(false);
  const hasSale = typeof compareAtPrice === 'number' && compareAtPrice > 0 && compareAtPrice > price;

  // Hien bar ngay khi scroll qua phan dau trang (~200px)
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 200);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Loc sizes available
  const availableSizes = sizes.filter((s) => s.available !== false);

  return (
    <div
      className={cn(
        'fixed bottom-0 inset-x-0 z-50 bg-white border-t shadow-[0_-2px_10px_rgba(0,0,0,0.1)] transition-transform duration-300',
        visible ? 'translate-y-0' : 'translate-y-full',
        className,
      )}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
        {/* Desktop layout */}
        <div className="hidden md:flex items-center gap-6">
          {/* Thumbnail */}
          <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0 relative">
            <Image src={image} alt={productName} fill sizes="64px" className="object-cover" />
          </div>

          {/* Gia */}
          <div className="flex-shrink-0">
            <span className={cn('text-xl font-bold', hasSale ? 'text-red-600' : 'text-gray-900')}>
              {formatVND(price)}
            </span>
            {hasSale && (
              <span className="text-sm text-gray-400 line-through ml-2">{formatVND(compareAtPrice)}</span>
            )}
          </div>

          {/* Separator */}
          <div className="w-px h-10 bg-gray-200" />

          {/* Mau sac — buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm text-gray-500 font-medium">Màu sắc:</span>
            <div className="flex gap-1.5">
              {colors.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onColorChange(c.id)}
                  className={cn(
                    'px-3 py-1.5 text-sm border rounded transition',
                    selectedColorId === c.id
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 hover:border-black',
                  )}
                  title={c.name}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Size — dropdown */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm text-gray-500 font-medium">Kích thước:</span>
            <select
              value={selectedSizeId || ''}
              onChange={(e) => onSizeChange(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-black"
            >
              <option value="" disabled>Chọn</option>
              {availableSizes.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Separator */}
          <div className="w-px h-10 bg-gray-200" />

          {/* Qty stepper */}
          <div className="flex items-center border border-gray-300 rounded h-10 flex-shrink-0">
            <button
              onClick={() => onQtyChange(Math.max(1, qty - 1))}
              disabled={qty <= 1}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center text-base font-medium select-none">{qty}</span>
            <button
              onClick={() => onQtyChange(Math.min(maxQty, qty + 1))}
              disabled={qty >= maxQty}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* MUA NGAY */}
          <button
            onClick={onBuyNow}
            disabled={disabled}
            className="ml-auto px-10 py-3 bg-red-600 text-white text-base font-bold rounded hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            MUA NGAY
          </button>
        </div>

        {/* Mobile layout */}
        <div className="flex md:hidden items-center gap-3">
          <div className="flex-1 min-w-0">
            <span className={cn('text-xl font-bold', hasSale ? 'text-red-600' : 'text-gray-900')}>
              {formatVND(price)}
            </span>
            {hasSale && (
              <span className="text-sm text-gray-400 line-through ml-2">{formatVND(compareAtPrice)}</span>
            )}
          </div>
          <button
            onClick={onBuyNow}
            disabled={disabled}
            className="px-8 py-3 bg-red-600 text-white text-base font-bold rounded hover:bg-red-700 transition disabled:opacity-50"
          >
            MUA NGAY
          </button>
        </div>
      </div>
    </div>
  );
}
