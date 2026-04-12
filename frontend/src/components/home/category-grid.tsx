'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants/routes';

interface CategoryGridItem {
  id: string;
  name: string;
  slug: string;
  image: string;
}

interface CategoryGridProps {
  categories: CategoryGridItem[];
  className?: string;
}

/**
 * DANH MUC SAN PHAM — Torano style
 * 4-column image grid, moi card co lifestyle photo + ten + arrow icon
 */
export function CategoryGrid({ categories, className }: CategoryGridProps) {
  return (
    <section className={cn('py-8 md:py-12 px-4 md:px-6 max-w-7xl mx-auto', className)}>
      <h2 className="text-xl md:text-2xl font-bold text-center mb-6 md:mb-8 tracking-wide">
        DANH MUC SAN PHAM
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={ROUTES.CATEGORY(cat.slug)}
            className="group relative block overflow-hidden rounded-lg"
          >
            <div className="aspect-[3/4] relative bg-gray-100">
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              {/* Label */}
              <div className="absolute bottom-0 inset-x-0 p-4 flex items-center justify-between">
                <span className="text-white font-semibold text-sm md:text-base tracking-wide">
                  {cat.name}
                </span>
                <ArrowRight className="w-5 h-5 text-white opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
