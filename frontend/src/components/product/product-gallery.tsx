'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { cn } from '@/lib/utils';
import type { ProductImage } from '@/types/product';

interface ProductGalleryProps {
  images: ProductImage[];
}

/** Product gallery — swipe carousel mobile, thumbnail strip desktop */
export function ProductGallery({ images }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: true }),
  ]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
      setSelectedIndex(index);
    },
    [emblaApi],
  );

  return (
    <div className="md:flex md:gap-4">
      {/* Thumbnail strip — desktop only, ben trai */}
      <div className="hidden md:flex md:flex-col gap-2 w-20 flex-shrink-0">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => scrollTo(i)}
            className={cn(
              'w-20 h-20 rounded-lg overflow-hidden border-2 transition',
              i === selectedIndex ? 'border-black' : 'border-transparent hover:border-gray-300',
            )}
          >
            <Image
              src={img.url}
              alt={img.alt}
              width={80}
              height={80}
              className="object-cover w-full h-full"
            />
          </button>
        ))}
      </div>

      {/* Main carousel */}
      <div className="flex-1">
        <div ref={emblaRef} className="overflow-hidden rounded-lg">
          <div className="flex">
            {images.map((img, idx) => (
              <div key={img.id} className="flex-[0_0_100%] min-w-0">
                <div className="relative aspect-square bg-gray-100">
                  <Image
                    src={img.url}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    priority={idx === 0}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots — mobile only */}
        <div className="flex justify-center gap-1.5 mt-3 md:hidden">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                i === selectedIndex ? 'bg-black w-5' : 'bg-gray-300',
              )}
              aria-label={`Ảnh ${i + 1}`}
            />
          ))}
        </div>

        {/* Thumbnail scroll — mobile only */}
        <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide md:hidden">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => scrollTo(i)}
              className={cn(
                'w-14 h-14 rounded overflow-hidden border-2 flex-shrink-0 transition',
                i === selectedIndex ? 'border-black' : 'border-transparent',
              )}
            >
              <Image
                src={img.url}
                alt={img.alt}
                width={56}
                height={56}
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
