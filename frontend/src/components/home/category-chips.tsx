'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants/routes';
import type { Category } from '@/types/category';

interface CategoryChipsProps {
  categories: Category[];
  className?: string;
}

/** Category chips — horizontal scroll mobile, centered desktop */
export function CategoryChips({ categories, className }: CategoryChipsProps) {
  return (
    <section className={cn('py-4 px-4 md:py-8 md:px-6 max-w-7xl mx-auto', className)}>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide md:flex-wrap md:justify-center">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={ROUTES.CATEGORY(cat.slug)}
            className="flex-shrink-0 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium hover:bg-black hover:text-white transition whitespace-nowrap"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
