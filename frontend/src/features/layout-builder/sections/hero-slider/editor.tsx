'use client';

import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { type SectionEditorProps } from '../../registry/types';

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
 * Editor cho Hero Slider
 * - Mode selection (fullwidth/contained/split)
 * - Slide manager voi collapsible cards + image preview
 * - Tuy chinh overlay, autoplay, height
 */
export function HeroSliderEditor({ config, onChange }: SectionEditorProps) {
  const slides = (config.slides as Slide[]) || [];
  const [expandedSlide, setExpandedSlide] = useState<number>(0);

  const updateSlide = (index: number, key: string, value: string) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [key]: value };
    onChange({ ...config, slides: newSlides });
  };

  const addSlide = () => {
    if (slides.length >= 5) return;
    onChange({
      ...config,
      slides: [...slides, {
        image_desktop: '', image_mobile: '',
        title: '', subtitle: '',
        cta_text: 'Mua ngay', cta_link: '',
        text_position: 'center', text_color: '#FFFFFF',
      }],
    });
    setExpandedSlide(slides.length);
  };

  const removeSlide = (index: number) => {
    onChange({ ...config, slides: slides.filter((_, i) => i !== index) });
    if (expandedSlide >= slides.length - 1) setExpandedSlide(Math.max(0, slides.length - 2));
  };

  return (
    <div className="space-y-4">
      {/* Mode selection */}
      <div>
        <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wide mb-2">Che do hien thi</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'fullwidth', label: 'Toan trang', icon: '▬' },
            { value: 'contained', label: 'Co vien', icon: '◻' },
            { value: 'split', label: 'Chia doi', icon: '◫' },
          ].map(mode => (
            <button
              key={mode.value}
              type="button"
              onClick={() => onChange({ ...config, display_mode: mode.value })}
              className={`flex flex-col items-center gap-1 p-2 border-2 rounded-lg transition text-center ${
                config.display_mode === mode.value
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-500'
              }`}
            >
              <span className="text-lg">{mode.icon}</span>
              <span className="text-[10px] font-medium">{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Slides */}
      <div className="border-t pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-800 uppercase tracking-wide">Slides ({slides.length}/5)</span>
          <button onClick={addSlide} disabled={slides.length >= 5} className="flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 disabled:opacity-40">
            <Plus className="w-3 h-3" /> Them
          </button>
        </div>

        <div className="space-y-2">
          {slides.map((slide, i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              {/* Collapsible header */}
              <button
                type="button"
                onClick={() => setExpandedSlide(expandedSlide === i ? -1 : i)}
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-2">
                  {/* Mini thumbnail */}
                  {slide.image_desktop ? (
                    <img src={slide.image_desktop} alt="" className="w-8 h-5 object-cover rounded" />
                  ) : (
                    <div className="w-8 h-5 bg-gray-200 rounded" />
                  )}
                  <span className="text-xs font-medium text-gray-700">
                    {slide.title || `Slide ${i + 1}`}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeSlide(i); }}
                    className="p-0.5 hover:text-red-500 text-gray-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {expandedSlide === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </button>

              {/* Expanded content */}
              {expandedSlide === i && (
                <div className="p-3 space-y-2">
                  {/* Image preview */}
                  {slide.image_desktop && (
                    <img src={slide.image_desktop} alt="" className="w-full h-20 object-cover rounded-md border" />
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500">Ảnh desktop</label>
                    <input value={slide.image_desktop || ''} onChange={(e) => updateSlide(i, 'image_desktop', e.target.value)} placeholder="URL ảnh desktop (1920x600)" className="w-full text-xs border rounded-md px-2 py-1.5" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-500">Ảnh mobile</label>
                    <input value={slide.image_mobile || ''} onChange={(e) => updateSlide(i, 'image_mobile', e.target.value)} placeholder="URL ảnh mobile (750x750)" className="w-full text-xs border rounded-md px-2 py-1.5" />
                  </div>
                  <input value={slide.title || ''} onChange={(e) => updateSlide(i, 'title', e.target.value)} placeholder="Tiêu đề" className="w-full text-xs border rounded-md px-2 py-1.5" />
                  <input value={slide.subtitle || ''} onChange={(e) => updateSlide(i, 'subtitle', e.target.value)} placeholder="Phụ đề" className="w-full text-xs border rounded-md px-2 py-1.5" />
                  <div className="grid grid-cols-2 gap-2">
                    <input value={slide.cta_text || ''} onChange={(e) => updateSlide(i, 'cta_text', e.target.value)} placeholder="Nút CTA" className="text-xs border rounded-md px-2 py-1.5" />
                    <input value={slide.cta_link || ''} onChange={(e) => updateSlide(i, 'cta_link', e.target.value)} placeholder="Link CTA" className="text-xs border rounded-md px-2 py-1.5" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-500">Vị trí text</label>
                      <select value={slide.text_position || 'center'} onChange={(e) => updateSlide(i, 'text_position', e.target.value)} className="w-full text-xs border rounded-md px-2 py-1.5">
                        <option value="left">Trai</option>
                        <option value="center">Giua</option>
                        <option value="right">Phai</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500">Mau chu</label>
                      <div className="flex gap-1">
                        <input type="color" value={slide.text_color || '#FFFFFF'} onChange={(e) => updateSlide(i, 'text_color', e.target.value)} className="w-7 h-7 rounded border" />
                        <input type="text" value={slide.text_color || '#FFFFFF'} onChange={(e) => updateSlide(i, 'text_color', e.target.value)} className="flex-1 text-xs border rounded-md px-2 py-1 font-mono" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Hieu ung & Tuy chinh */}
      <div className="border-t pt-3 space-y-3">
        <p className="text-xs font-semibold text-gray-800 uppercase tracking-wide">Tuy chinh</p>

        {/* Overlay */}
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Overlay</label>
          <div className="flex items-center gap-2">
            <input type="color" value={(config.overlay_color as string) || '#000000'} onChange={(e) => onChange({ ...config, overlay_color: e.target.value })} className="w-7 h-7 rounded border" />
            <input type="range" min={0} max={100} value={(config.overlay_opacity as number) ?? 30} onChange={(e) => onChange({ ...config, overlay_opacity: Number(e.target.value) })} className="flex-1 accent-orange-500" />
            <span className="text-xs text-gray-500 w-8">{config.overlay_opacity as number}%</span>
          </div>
        </div>

        {/* Chieu cao */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-500">Cao desktop (px)</label>
            <input type="number" value={(config.height_desktop as number) || 500} onChange={(e) => onChange({ ...config, height_desktop: Number(e.target.value) })} className="w-full text-xs border rounded-md px-2 py-1.5" />
          </div>
          <div>
            <label className="text-[10px] text-gray-500">Cao mobile (px)</label>
            <input type="number" value={(config.height_mobile as number) || 300} onChange={(e) => onChange({ ...config, height_mobile: Number(e.target.value) })} className="w-full text-xs border rounded-md px-2 py-1.5" />
          </div>
        </div>

        {/* Autoplay speed */}
        {Boolean(config.autoplay) && (
          <div>
            <label className="text-xs text-gray-600 mb-1 block">Toc do chuyen ({((config.autoplay_speed as number) || 5000) / 1000}s)</label>
            <input type="range" min={2000} max={10000} step={500} value={(config.autoplay_speed as number) || 5000} onChange={(e) => onChange({ ...config, autoplay_speed: Number(e.target.value) })} className="w-full accent-orange-500" />
          </div>
        )}

        {/* Toggles */}
        <div className="space-y-2">
          {[
            { key: 'autoplay', label: 'Tu dong chuyen slide' },
            { key: 'show_dots', label: 'Hien dots chi muc' },
            { key: 'show_arrows', label: 'Hien nut trai/phai' },
          ].map(toggle => (
            <label key={toggle.key} className="flex items-center justify-between cursor-pointer">
              <span className="text-xs text-gray-700">{toggle.label}</span>
              <button
                type="button"
                onClick={() => onChange({ ...config, [toggle.key]: !config[toggle.key] })}
                className={`relative w-9 h-5 rounded-full transition ${config[toggle.key] ? 'bg-orange-500' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${config[toggle.key] ? 'translate-x-4' : ''}`} />
              </button>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
