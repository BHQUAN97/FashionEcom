'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { FlashSaleData } from '@/types/common';
import { ProductCard } from '@/components/product/product-card';

interface FlashSaleCountdownProps {
  data: FlashSaleData;
  className?: string;
}

/** Flash sale section — countdown do + product scroll */
export function FlashSaleCountdown({ data, className }: FlashSaleCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(data.end_time));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(data.end_time));
    }, 1000);
    return () => clearInterval(timer);
  }, [data.end_time]);

  // An section neu het gio
  if (timeLeft.total <= 0) return null;

  return (
    <section className={cn('py-4 px-4 md:py-8 md:px-6 max-w-7xl mx-auto', className)}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-lg font-bold text-red-600">🔥 {data.title}</span>
        <div className="flex gap-1">
          <TimeBox value={timeLeft.hours} />
          <span className="text-red-600 font-bold">:</span>
          <TimeBox value={timeLeft.minutes} />
          <span className="text-red-600 font-bold">:</span>
          <TimeBox value={timeLeft.seconds} />
        </div>
      </div>

      {/* Product horizontal scroll mobile, grid desktop */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide md:grid md:grid-cols-4 lg:grid-cols-6">
        {data.products.map((product) => (
          <div key={product.id} className="min-w-[160px] md:min-w-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}

function TimeBox({ value }: { value: number }) {
  return (
    <span className="bg-red-600 text-white text-sm font-bold px-1.5 py-0.5 rounded min-w-[28px] text-center">
      {String(value).padStart(2, '0')}
    </span>
  );
}

function getTimeLeft(endTime: string) {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return { total: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    total: diff,
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}
