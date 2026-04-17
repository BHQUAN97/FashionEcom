'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type SectionRendererProps } from '../../registry/types';

interface Slide {
  image_desktop: string;
  image_mobile: string;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
  text_position: string;
  text_color: string;
}

/**
 * Renderer cho Hero Slider — matching storefront HeroBanner
 * Ho tro 3 display modes: fullwidth, contained, split
 */
export function HeroSliderRenderer({ config, preview }: SectionRendererProps) {
  const slides = (config.slides as Slide[]) || [];
  const mode = (config.display_mode as string) || 'fullwidth';
  const heightMobile = (config.height_mobile as number) || 300;
  const overlayColor = (config.overlay_color as string) || '#000000';
  const overlayOpacity = ((config.overlay_opacity as number) ?? 30) / 100;

  if (slides.length === 0) {
    return (
      <div className="bg-gray-100 flex items-center justify-center text-gray-400 text-sm" style={{ height: `${heightMobile}px` }}>
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-2 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <span className="text-2xl text-gray-300">+</span>
          </div>
          Chua co slide nao
        </div>
      </div>
    );
  }

  const slide = slides[0];
  const textAlign = slide.text_position === 'left' ? 'items-start text-left' :
    slide.text_position === 'right' ? 'items-end text-right' : 'items-center text-center';

  // Parse overlay color to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  const containerClass = mode === 'contained' ? 'mx-4 rounded-xl overflow-hidden' : mode === 'split' ? 'mx-4' : '';

  // Split mode: text ben trai, anh ben phai
  if (mode === 'split') {
    return (
      <div className="flex flex-col md:flex-row gap-4" style={{ minHeight: `${heightMobile}px` }}>
        {/* Text */}
        <div className="flex-1 flex flex-col justify-center p-6 md:p-10 bg-gray-50 rounded-xl">
          {slide.title && (
            <h2 className="text-2xl md:text-4xl font-bold mb-3 text-gray-900 tracking-tight">{slide.title}</h2>
          )}
          {slide.subtitle && (
            <p className="text-sm md:text-base text-gray-600 mb-5 leading-relaxed">{slide.subtitle}</p>
          )}
          {slide.cta_text && (
            <a
              href={preview ? '#' : slide.cta_link}
              onClick={preview ? (e) => e.preventDefault() : undefined}
              className="inline-block px-8 py-3 bg-black text-white font-medium text-sm tracking-wide hover:bg-gray-800 transition w-fit"
            >
              {slide.cta_text.toUpperCase()}
            </a>
          )}
        </div>
        {/* Image */}
        <div className="flex-1 rounded-xl overflow-hidden">
          {slide.image_desktop ? (
            <img src={slide.image_desktop} alt={slide.title || ''} className="w-full h-full object-cover" style={{ minHeight: `${heightMobile}px` }} />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" style={{ minHeight: `${heightMobile}px` }} />
          )}
        </div>
      </div>
    );
  }

  // Fullwidth / Contained mode
  return (
    <div className={containerClass}>
      <div className="relative w-full overflow-hidden" style={{ height: `${heightMobile}px` }}>
        {/* Background image */}
        {slide.image_desktop ? (
          <img src={slide.image_desktop} alt={slide.title || 'Hero banner'} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-600" />
        )}

        {/* Overlay */}
        <div className="absolute inset-0" style={{ backgroundColor: hexToRgba(overlayColor, overlayOpacity) }} />

        {/* Text content */}
        <div className={`absolute inset-0 flex flex-col justify-center ${textAlign} px-6 md:px-16`}>
          {slide.title && (
            <h2
              className="text-2xl md:text-5xl font-bold mb-2 md:mb-3 tracking-tight drop-shadow-lg"
              style={{ color: slide.text_color || '#FFFFFF' }}
            >
              {slide.title}
            </h2>
          )}
          {slide.subtitle && (
            <p
              className="text-sm md:text-lg mb-4 md:mb-6 max-w-lg drop-shadow"
              style={{ color: slide.text_color || '#FFFFFF', opacity: 0.9 }}
            >
              {slide.subtitle}
            </p>
          )}
          {slide.cta_text && (
            <a
              href={preview ? '#' : slide.cta_link}
              onClick={preview ? (e) => e.preventDefault() : undefined}
              className="inline-block px-8 py-3 bg-white text-black font-medium text-sm tracking-wide hover:bg-gray-100 transition w-fit"
            >
              {slide.cta_text.toUpperCase()}
            </a>
          )}
        </div>

        {/* Navigation arrows */}
        {slides.length > 1 && Boolean(config.show_arrows) && (
          <>
            <button className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition">
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition">
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}

        {/* Dots indicator */}
        {slides.length > 1 && Boolean(config.show_dots) && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full transition ${i === 0 ? 'bg-white scale-110' : 'bg-white/50'}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
