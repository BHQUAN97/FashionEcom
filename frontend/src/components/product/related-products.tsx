'use client';

import { cn } from '@/lib/utils';
import type { ProductListItem } from '@/types/product';
import { ProductCard } from './product-card';

interface RelatedProductsProps {
  products: ProductListItem[];
  className?: string;
}

/** San pham lien quan — horizontal scroll mobile, grid desktop */
export function RelatedProducts({ products, className }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className={cn('mt-8', className)}>
      <h3 className="text-lg font-bold mb-4">SAN PHAM LIEN QUAN</h3>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide md:grid md:grid-cols-4 lg:grid-cols-5">
        {products.map((product) => (
          <div key={product.id} className="min-w-[160px] md:min-w-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
