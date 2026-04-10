'use client';

import { type SectionEditorProps } from '../../registry/types';

/**
 * Editor cho Hero Slider — quan ly danh sach slides
 */
export function HeroSliderEditor({ config, onChange }: SectionEditorProps) {
  const slides = (config.slides as Array<Record<string, string>>) || [];

  const updateSlide = (index: number, key: string, value: string) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [key]: value };
    onChange({ ...config, slides: newSlides });
  };

  const addSlide = () => {
    if (slides.length >= 5) return;
    onChange({
      ...config,
      slides: [...slides, { image_desktop: '', image_mobile: '', title: '', subtitle: '', cta_text: 'Mua ngay', cta_link: '', text_position: 'center', text_color: '#FFFFFF' }],
    });
  };

  const removeSlide = (index: number) => {
    onChange({ ...config, slides: slides.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">Slides ({slides.length}/5)</h4>
        <button onClick={addSlide} disabled={slides.length >= 5} className="text-xs px-2 py-1 bg-black text-white rounded disabled:opacity-50">
          + Them slide
        </button>
      </div>

      {slides.map((slide, i) => (
        <div key={i} className="border rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-500">Slide {i + 1}</span>
            <button onClick={() => removeSlide(i)} className="text-xs text-red-500 hover:text-red-700">Xoa</button>
          </div>
          <input placeholder="Tieu de" value={slide.title || ''} onChange={(e) => updateSlide(i, 'title', e.target.value)} className="w-full text-sm border rounded px-2 py-1" />
          <input placeholder="Phu de" value={slide.subtitle || ''} onChange={(e) => updateSlide(i, 'subtitle', e.target.value)} className="w-full text-sm border rounded px-2 py-1" />
          <input placeholder="URL anh desktop" value={slide.image_desktop || ''} onChange={(e) => updateSlide(i, 'image_desktop', e.target.value)} className="w-full text-sm border rounded px-2 py-1" />
          <input placeholder="URL anh mobile" value={slide.image_mobile || ''} onChange={(e) => updateSlide(i, 'image_mobile', e.target.value)} className="w-full text-sm border rounded px-2 py-1" />
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Text CTA" value={slide.cta_text || ''} onChange={(e) => updateSlide(i, 'cta_text', e.target.value)} className="text-sm border rounded px-2 py-1" />
            <input placeholder="Link CTA" value={slide.cta_link || ''} onChange={(e) => updateSlide(i, 'cta_link', e.target.value)} className="text-sm border rounded px-2 py-1" />
          </div>
        </div>
      ))}

      <div className="space-y-2 pt-2 border-t">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!config.autoplay} onChange={(e) => onChange({ ...config, autoplay: e.target.checked })} />
          Tu dong chuyen slide
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!config.show_dots} onChange={(e) => onChange({ ...config, show_dots: e.target.checked })} />
          Hien dots
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!config.show_arrows} onChange={(e) => onChange({ ...config, show_arrows: e.target.checked })} />
          Hien arrows
        </label>
      </div>
    </div>
  );
}
