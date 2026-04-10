'use client';

import { useState } from 'react';
import { HeroBanner } from '@/components/home/hero-banner';
import { CategoryChips } from '@/components/home/category-chips';
import { FlashSaleCountdown } from '@/components/home/flash-sale-countdown';
import { ProductGrid } from '@/components/product/product-grid';
import { TrustBar } from '@/components/home/trust-bar';
import { NewsletterSignup } from '@/components/home/newsletter-signup';
import { LoadMoreButton } from '@/components/home/load-more-button';
import {
  MOCK_HERO_SLIDES,
  MOCK_CATEGORIES,
  MOCK_FLASH_SALE,
  MOCK_PRODUCTS,
  MOCK_TRUST_BAR,
} from '@/lib/mock/data';

/**
 * Homepage — render layout builder sections
 * Mobile-first: hero 4:3, category chips scroll, product grid 2 col
 */
export default function HomePage() {
  const [visibleCount, setVisibleCount] = useState(8);
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + 8, MOCK_PRODUCTS.length));
      setLoadingMore(false);
    }, 500);
  };

  return (
    <div>
      {/* Hero Banner — swipe carousel */}
      <HeroBanner slides={MOCK_HERO_SLIDES} />

      {/* Category Chips — horizontal scroll mobile */}
      <CategoryChips categories={MOCK_CATEGORIES} />

      {/* Flash Sale */}
      <FlashSaleCountdown data={MOCK_FLASH_SALE} />

      {/* Product Grid — san pham noi bat */}
      <section className="px-4 md:px-6 max-w-7xl mx-auto pb-8">
        <h2 className="text-lg md:text-2xl font-bold mb-4">SAN PHAM NOI BAT</h2>
        <ProductGrid
          products={MOCK_PRODUCTS.slice(0, visibleCount)}
          columns={5}
        />
        <LoadMoreButton
          onClick={handleLoadMore}
          loading={loadingMore}
          hasMore={visibleCount < MOCK_PRODUCTS.length}
        />
      </section>

      {/* Trust Bar */}
      <TrustBar items={MOCK_TRUST_BAR} />

      {/* Newsletter */}
      <NewsletterSignup />
    </div>
  );
}
