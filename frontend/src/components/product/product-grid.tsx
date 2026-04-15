'use client';

import { cn } from '@/lib/utils';
import type { ProductListItem } from '@/types/product';
import { ProductCard } from './product-card';
import { ProductCardSkeleton } from './product-card-skeleton';

interface ProductGridProps {
  products: ProductListItem[];
  columns?: 2 | 3 | 4 | 5;
  loading?: boolean;
  loadingCount?: number;
  className?: string;
}

const colClasses: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4',
  5: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
};

/** Product grid — responsive columns, mobile 2 col mac dinh */
export function ProductGrid({
  products,
  columns = 5,
  loading = false,
  loadingCount = 8,
  className,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className={cn('grid gap-3 md:gap-6', colClasses[columns], className)}>
        {Array.from({ length: loadingCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid gap-3 md:gap-6', colClasses[columns], className)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
