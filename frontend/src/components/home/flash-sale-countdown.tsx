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

/** Flash sale — countdown + auto-scroll carousel ngang */
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
      // Neu cuon het thi quay lai dau
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: 260, behavior: 'smooth' });
      }
    }, 3000);
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
    // Restart auto scroll sau 5 giay
    setTimeout(startAutoScroll, 5000);
  };

  if (!timeLeft || timeLeft.total <= 0) return null;

  return (
    <section
      className={cn('py-6 md:py-10 px-4 md:px-6 max-w-7xl mx-auto', className)}
      onMouseEnter={stopAutoScroll}
      onMouseLeave={startAutoScroll}
    >
      {/* Header: icon + title + countdown + arrows */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="text-lg">🔥</span>
          <h2 className="text-lg md:text-xl font-bold text-red-600">{data.title}</h2>
          <div className="flex gap-1 ml-2">
            <TimeBox value={timeLeft.hours} />
            <span className="text-red-600 font-bold self-center">:</span>
            <TimeBox value={timeLeft.minutes} />
            <span className="text-red-600 font-bold self-center">:</span>
            <TimeBox value={timeLeft.seconds} />
          </div>
        </div>
        {/* Arrows */}
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-full hover:bg-black hover:text-white hover:border-black transition"
            aria-label="Truot trai"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-full hover:bg-black hover:text-white hover:border-black transition"
            aria-label="Truot phai"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product auto-scroll carousel */}
      <div
        ref={scrollRef}
        className="flex gap-3 md:gap-5 overflow-x-auto scrollbar-hide scroll-smooth"
      >
        {data.products.map((product) => (
          <div
            key={product.id}
            className="flex-shrink-0 w-[160px] sm:w-[200px] md:w-[220px] lg:w-[240px]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center mt-5 md:mt-7">
        <Link
          href="/danh-muc/sale"
          className="inline-block border-2 border-black px-8 py-2.5 text-sm font-semibold hover:bg-black hover:text-white transition tracking-wide"
        >
          XEM TAT CA FLASH SALE
        </Link>
      </div>
    </section>
  );
}

function TimeBox({ value }: { value: number }) {
  return (
    <span className="bg-red-600 text-white text-sm font-bold px-2 py-1 rounded min-w-[30px] text-center inline-block">
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
