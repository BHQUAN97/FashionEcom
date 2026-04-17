'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface OutfitItem {
  id: string;
  image: string;
  label: string;
  link: string;
}

interface OutfitOfDayProps {
  outfits: OutfitItem[];
  className?: string;
}

/**
 * OUTFIT OF THE DAY — Torano style
 * 3-column lifestyle images voi labels + "MUA FULL SET" button
 * Ben duoi co nut "XEM THEM"
 */
export function OutfitOfDay({ outfits, className }: OutfitOfDayProps) {
  return (
    <section className={cn('py-8 md:py-12 px-4 md:px-6 max-w-7xl mx-auto', className)}>
      <h2 className="text-xl md:text-2xl font-bold text-center mb-6 md:mb-8 tracking-wide">
        OUTFIT OF THE DAY
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {outfits.map((outfit) => (
          <div key={outfit.id} className="group relative overflow-hidden rounded-lg">
            <div className="aspect-[3/4] relative bg-gray-100">
              <Image
                src={outfit.image}
                alt={outfit.label}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              {/* Content */}
              <div className="absolute bottom-0 inset-x-0 p-5 md:p-6 text-center">
                <h3 className="text-white font-bold text-base md:text-lg tracking-wide mb-3">
                  {outfit.label}
                </h3>
                <Link
                  href={outfit.link}
                  className="btn-sweep btn-sweep-light inline-block text-xs md:text-sm"
                >
                  MUA FULL SET
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center mt-6 md:mt-8">
        <Link
          href="/bo-suu-tap"
          className="btn-sweep btn-sweep-light inline-block"
        >
          XEM THÊM
        </Link>
      </div>
    </section>
  );
}
