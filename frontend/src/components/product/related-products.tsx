'use client';

import { useRef, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProductListItem } from '@/types/product';
import { ProductCard } from './product-card';

interface RelatedProductsProps {
  products: ProductListItem[];
  className?: string;
}

/** San pham lien quan — auto-scroll carousel voi arrows, pause khi hover */
export function RelatedProducts({ products, className }: RelatedProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);

  // Auto scroll cham — 1 item moi 5 giay
  const startAutoScroll = useCallback(() => {
    autoScrollRef.current = setInterval(() => {
      if (!scrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        const itemWidth = scrollRef.current.querySelector('div > div')?.clientWidth ?? 280;
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

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    stopAutoScroll();
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
    setTimeout(startAutoScroll, 5000);
  }, [stopAutoScroll, startAutoScroll]);

  if (products.length === 0) return null;

  return (
    <section
      className={cn('mt-8', className)}
      onMouseEnter={stopAutoScroll}
      onMouseLeave={startAutoScroll}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">SẢN PHẨM LIÊN QUAN</h3>
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-full hover:bg-black hover:text-white hover:border-black transition"
            aria-label="Trượt trái"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-full hover:bg-black hover:text-white hover:border-black transition"
            aria-label="Trượt phải"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-3 md:gap-5 overflow-x-auto scrollbar-hide scroll-smooth"
      >
        {products.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-[170px] sm:w-[200px] md:w-[240px] lg:w-[260px] xl:w-[280px]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
