import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface CollectionBannerProps {
  image: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  className?: string;
}

/**
 * BST Banner — Torano style
 * Full-width lifestyle banner giua cac section
 * Anh lon voi text overlay + CTA button
 */
export function CollectionBanner({
  image,
  title,
  subtitle,
  ctaText = 'KHAM PHA',
  ctaLink = '/bo-suu-tap',
  className,
}: CollectionBannerProps) {
  return (
    <section className={cn('relative w-full', className)}>
      <div className="relative aspect-[16/5] md:aspect-[16/4]">
        <Image
          src={image}
          alt={title}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="text-center text-white px-4">
            {subtitle && (
              <p className="text-xs md:text-sm tracking-[0.3em] uppercase mb-2 md:mb-3">
                {subtitle}
              </p>
            )}
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-wider">
              {title}
            </h2>
            <Link
              href={ctaLink}
              className="btn-sweep btn-sweep-light inline-block mt-4 md:mt-6"
            >
              {ctaText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
