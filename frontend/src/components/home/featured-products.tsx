'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ProductGrid } from '@/components/product/product-grid';
import type { ProductListItem } from '@/types/product';

interface Tab {
  label: string;
  products: ProductListItem[];
}

interface FeaturedProductsProps {
  tabs: Tab[];
  className?: string;
}

/**
 * SAN PHAM NOI BAT — Torano style
 * Section title: 37px desktop, centered
 * Tabs: underline animation tu width 0 → 100%
 * 5-column grid, nut "XEM TAT CA" btn-sweep-light
 */
export function FeaturedProducts({ tabs, className }: FeaturedProductsProps) {
  const [activeTab, setActiveTab] = useState(0);

  if (tabs.length === 0) return null;

  return (
    <section className={cn('py-10 md:py-20 px-4 md:px-6 max-w-container mx-auto', className)}>
      {/* Section title — Torano: centered tabs with underline animation */}
      <div className="section-title-torano">
        <div className="flex items-center justify-center gap-5 md:gap-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(i)}
              className={cn(
                'tab-title-torano whitespace-nowrap',
                i === activeTab && 'active',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <ProductGrid products={tabs[activeTab].products} columns={5} />

      {/* CTA */}
      <div className="text-center mt-6 md:mt-10">
        <Link
          href="/san-pham"
          className="btn-sweep btn-sweep-light inline-block md:min-w-[400px]"
        >
          XEM TẤT CẢ SẢN PHẨM NỔI BẬT
        </Link>
      </div>
    </section>
  );
}
