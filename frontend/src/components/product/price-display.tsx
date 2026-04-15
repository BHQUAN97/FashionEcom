'use client';

import { cn } from '@/lib/utils';
import { formatVND } from '@/lib/utils/format';

interface PriceDisplayProps {
  price: number;
  compareAtPrice?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/** Hien thi gia — gia sale do + gia goc gach ngang */
export function PriceDisplay({ price, compareAtPrice, size = 'md', className }: PriceDisplayProps) {
  // Chỉ hiện giá gốc khi > 0 VÀ > giá bán
  const hasSale = typeof compareAtPrice === 'number' && compareAtPrice > 0 && compareAtPrice > price;

  const sizeClasses = {
    sm: { sale: 'text-sm font-bold', original: 'text-xs' },
    md: { sale: 'text-base font-bold', original: 'text-sm' },
    lg: { sale: 'text-xl font-bold', original: 'text-base' },
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className={cn(sizeClasses[size].sale, hasSale ? 'text-red-600' : 'text-gray-900')}>
        {formatVND(price)}
      </span>
      {hasSale && (
        <span className={cn(sizeClasses[size].original, 'text-gray-400 line-through')}>
          {formatVND(compareAtPrice!)}
        </span>
      )}
    </div>
  );
}
