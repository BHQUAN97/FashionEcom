'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FlashSaleData } from '@/types/common';
import { ProductCard } from '@/components/product/product-card';

interface FlashSaleCountdownProps {
  data: FlashSaleData;
  className?: string;
}

/**
 * Flash sale — Torano style
 * Background: #faefec, countdown box: #d60000 rounded-[5px]
 * Auto-scroll carousel ngang, arrows tron
 */
export function FlashSaleCountdown({ data, className }: FlashSaleCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeLeft> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTimeLeft(getTimeLeft(data.end_time));
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(data.end_time));
    }, 1000);
    return () => clearInterval(timer);
  }, [data.end_time]);

  // Auto scroll ngang moi 3 giay
  const startAutoScroll = useCallback(() => {
    autoScrollRef.current = setInterval(() => {
      if (!scrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // Cuon cham — 1 item moi lan
        const itemWidth = scrollRef.current.querySelector('div > div')?.clientWidth ?? 300;
        scrollRef.current.scrollBy({ left: itemWidth + 20, behavior: 'smooth' });
      }
    }, 5000);
  }, []);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoScroll();
    return stopAutoScroll;
  }, [startAutoScroll, stopAutoScroll]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    stopAutoScroll();
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
    setTimeout(startAutoScroll, 5000);
  };

  // Khong render khi het thoi gian (timeLeft null = chua hydrate, van hien thi)
  if (timeLeft && timeLeft.total <= 0) return null;

  return (
    <section
      className={cn('flashsale-bg py-6 md:py-10', className)}
      onMouseEnter={stopAutoScroll}
      onMouseLeave={startAutoScroll}
    >
      <div className="max-w-container mx-auto px-4 md:px-6 xl:px-[50px]">
        {/* Header: title + countdown + arrows */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-lg md:text-xl font-bold text-fashion-red">{data.title}</h2>
            {/* Countdown — Torano: box do, rounded-[5px], gap 8px */}
            <div className="flex items-center gap-2 ml-2">
              <CountdownBox value={timeLeft?.hours ?? 0} />
              <span className="text-fashion-red font-bold hidden">:</span>
              <CountdownBox value={timeLeft?.minutes ?? 0} />
              <span className="text-fashion-red font-bold hidden">:</span>
              <CountdownBox value={timeLeft?.seconds ?? 0} />
            </div>
          </div>
          {/* Navigation arrows */}
          <div className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => scroll('left')}
              className="w-[30px] h-[30px] flex items-center justify-center hover:text-black transition"
              aria-label="Trượt trái"
            >
              <ChevronLeft className="w-[18px] h-[18px]" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-[30px] h-[30px] flex items-center justify-center hover:text-black transition"
              aria-label="Trượt phải"
            >
              <ChevronRight className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>

        {/* Product carousel */}
        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-5 overflow-x-auto scrollbar-hide scroll-smooth"
        >
          {data.products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-[170px] sm:w-[200px] md:w-[240px] lg:w-[260px] xl:w-[280px]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-5 md:mt-8">
          <Link
            href="/danh-muc/sale"
            className="btn-sweep btn-sweep-light inline-block"
          >
            XEM TẤT CẢ FLASH SALE
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Countdown box — Torano: bg do, text trang, min-w 36px, rounded 5px */
function CountdownBox({ value }: { value: number }) {
  return (
    <span className="flashsale-countdown-box text-sm font-medium inline-block min-w-[36px]">
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
