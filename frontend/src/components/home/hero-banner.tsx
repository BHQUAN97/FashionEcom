'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { cn } from '@/lib/utils';
import type { HeroBannerSlide } from '@/types/common';

interface HeroBannerProps {
  slides: HeroBannerSlide[];
}

/** Hero banner — swipe carousel, dots indicator, autoplay */
export function HeroBanner({ slides }: HeroBannerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Subscribe to select event
  if (emblaApi) {
    emblaApi.on('select', onSelect);
  }

  return (
    <section className="relative">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((slide, idx) => (
            <div key={slide.id} className="flex-[0_0_100%] min-w-0 relative">
              {/* Mobile: 4:3, Desktop: ~16:7 */}
              <div className="relative aspect-[4/3] md:aspect-[16/7]">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  sizes="100vw"
                  className="object-cover hidden md:block"
                  priority={idx === 0}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
                <Image
                  src={slide.image_mobile}
                  alt={slide.title}
                  fill
                  sizes="100vw"
                  className="object-cover md:hidden"
                  priority={idx === 0}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />
                {/* Overlay content */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="text-center text-white px-4">
                    <h2 className="text-2xl md:text-5xl font-bold tracking-wider drop-shadow-lg">
                      {slide.title}
                    </h2>
                    <p className="mt-2 text-sm md:text-lg drop-shadow-md">{slide.subtitle}</p>
                    <Link
                      href={slide.cta_link}
                      className="btn-sweep btn-sweep-red mt-4 inline-block"
                    >
                      {slide.cta_text}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={cn(
              'w-2 h-2 rounded-full transition-all',
              i === selectedIndex ? 'bg-white w-6' : 'bg-white/50',
            )}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
