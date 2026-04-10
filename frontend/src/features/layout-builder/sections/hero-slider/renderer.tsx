'use client';

import { type SectionRendererProps } from '../../registry/types';

/**
 * Renderer cho Hero Slider — hien thi carousel trong preview + storefront
 */
export function HeroSliderRenderer({ config, preview }: SectionRendererProps) {
  const slides = (config.slides as Array<Record<string, string>>) || [];

  if (slides.length === 0) {
    return <div className="bg-gray-100 h-[400px] flex items-center justify-center text-gray-400">Chua co slide nao</div>;
  }

  // Simplified: hien slide dau tien (full carousel can Embla/Swiper)
  const slide = slides[0];

  return (
    <div className="relative w-full h-[300px] md:h-[500px] bg-gray-200 overflow-hidden">
      {slide.image_desktop && (
        <img
          src={slide.image_desktop}
          alt={slide.title || 'Hero banner'}
          className="w-full h-full object-cover"
        />
      )}
      {!slide.image_desktop && (
        <div className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-600" />
      )}
      <div className={`absolute inset-0 flex flex-col items-center justify-center text-center p-4`}>
        {slide.title && (
          <h2 className="text-2xl md:text-4xl font-bold mb-2" style={{ color: slide.text_color || '#FFFFFF' }}>
            {slide.title}
          </h2>
        )}
        {slide.subtitle && (
          <p className="text-sm md:text-lg mb-4" style={{ color: slide.text_color || '#FFFFFF' }}>
            {slide.subtitle}
          </p>
        )}
        {slide.cta_text && (
          <a
            href={preview ? '#' : slide.cta_link}
            onClick={preview ? (e) => e.preventDefault() : undefined}
            className="px-6 py-2 bg-white text-black font-medium rounded hover:bg-gray-100 transition"
          >
            {slide.cta_text}
          </a>
        )}
      </div>
      {slides.length > 1 && Boolean(config.show_dots) && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/50'}`} />
          ))}
        </div>
      )}
    </div>
  );
}
