'use client';

import { Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatVND } from '@/lib/utils/format';
import { CONFIG } from '@/lib/constants/config';

interface FreeShipBarProps {
  currentTotal: number;
  className?: string;
}

/** Free shipping progress bar */
export function FreeShipBar({ currentTotal, className }: FreeShipBarProps) {
  const threshold = CONFIG.FREE_SHIP_THRESHOLD;
  const remaining = threshold - currentTotal;
  const percent = Math.min(100, (currentTotal / threshold) * 100);
  const isFree = remaining <= 0;

  return (
    <div className={cn('bg-gray-50 rounded-lg p-3', className)}>
      <div className="flex items-center gap-2 text-sm">
        <Truck className="w-4 h-4 text-gray-500 flex-shrink-0" />
        {isFree ? (
          <span className="text-green-600 font-medium">Bạn được miễn phí vận chuyển!</span>
        ) : (
          <span className="text-gray-600">
            Mua them <span className="font-bold text-red-600">{formatVND(remaining)}</span> de{' '}
            <span className="font-medium">MIỄN PHÍ vận chuyển</span>
          </span>
        )}
      </div>
      <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', isFree ? 'bg-green-500' : 'bg-red-600')}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
