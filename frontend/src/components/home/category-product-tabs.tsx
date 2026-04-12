'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ProductGrid } from '@/components/product/product-grid';
import type { ProductListItem } from '@/types/product';

interface CategoryTab {
  label: string;
  slug: string;
  products: ProductListItem[];
}

interface CategoryProductTabsProps {
  tabs: CategoryTab[];
  className?: string;
}

/**
 * Category Tabs — Torano style
 * Tab danh muc: "Ao Polo", "Quan Short", "So mi - Quan dai", "Ao Khoac"
 * 5 san pham moi tab, nut "XEM THEM" link toi danh muc
 */
export function CategoryProductTabs({ tabs, className }: CategoryProductTabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  if (tabs.length === 0) return null;

  return (
    <section className={cn('py-8 md:py-12 px-4 md:px-6 max-w-7xl mx-auto', className)}>
      {/* Tab headers */}
      <div className="flex items-center justify-center gap-4 md:gap-8 mb-6 md:mb-8 overflow-x-auto scrollbar-hide">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(i)}
            className={cn(
              'text-sm md:text-base font-semibold tracking-wide whitespace-nowrap pb-2 border-b-2 transition-colors',
              i === activeTab
                ? 'text-black border-black'
                : 'text-gray-400 border-transparent hover:text-gray-600',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Product grid — 5 san pham */}
      <ProductGrid products={tabs[activeTab].products.slice(0, 5)} columns={5} />

      {/* CTA */}
      <div className="text-center mt-6 md:mt-8">
        <Link
          href={`/danh-muc/${tabs[activeTab].slug}`}
          className="inline-block border-2 border-black px-8 py-2.5 text-sm font-semibold hover:bg-black hover:text-white transition tracking-wide"
        >
          XEM THEM {tabs[activeTab].label.toUpperCase()}
        </Link>
      </div>
    </section>
  );
}
