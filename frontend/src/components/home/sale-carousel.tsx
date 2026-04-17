'use client';

import { useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductCard } from '@/components/product/product-card';
import type { ProductListItem } from '@/types/product';

interface SaleCarouselProps {
  products: ProductListItem[];
  className?: string;
}

/**
 * SAN PHAM KHUYEN MAI — Torano style
 * Horizontal scroll carousel voi left/right arrows + auto-scroll
 * Title voi red dot bullet, nut "XEM TAT CA" ben duoi
 */
export function SaleCarousel({ products, className }: SaleCarouselProps) {
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
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(startAutoScroll, 5000);
  };

  if (products.length === 0) return null;

  return (
    <section
      className={cn('py-8 md:py-12 px-4 md:px-6 max-w-7xl mx-auto', className)}
      onMouseEnter={stopAutoScroll}
      onMouseLeave={startAutoScroll}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold tracking-wide flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
          SẢN PHẨM KHUYẾN MÃI
        </h2>
        {/* Desktop arrows */}
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-full hover:bg-black hover:text-white hover:border-black transition"
            aria-label="Trượt trái"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-full hover:bg-black hover:text-white hover:border-black transition"
            aria-label="Trượt phải"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Product carousel */}
      <div
        ref={scrollRef}
        className="flex gap-3 md:gap-5 overflow-x-auto scrollbar-hide scroll-smooth"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="flex-shrink-0 w-[170px] sm:w-[200px] md:w-[240px] lg:w-[260px] xl:w-[280px]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* CTA button */}
      <div className="text-center mt-6 md:mt-8">
        <Link
          href="/danh-muc/sale"
          className="btn-sweep btn-sweep-light inline-block"
        >
          XEM TẤT CẢ SẢN PHẨM KHUYẾN MÃI
        </Link>
      </div>
    </section>
  );
}
