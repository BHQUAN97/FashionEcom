import { z } from 'zod';
import { type SectionDefinition, type SectionEditorProps, type SectionRendererProps } from '../../registry/types';

const configSchema = z.object({
  title: z.string().default('Mix & Match'),
  subtitle: z.string().default(''),
  // Che do hien thi
  display_mode: z.enum(['grid', 'masonry', 'carousel']).default('grid'),
  layout: z.enum(['2-column', '3-column', '4-column']).default('3-column'),
  // Items
  items: z.array(z.object({
    image: z.string(),
    label: z.string(),
    link: z.string(),
    hotspots: z.array(z.any()).default([]),
  })),
  // Style
  card_style: z.enum(['overlay', 'below', 'hover']).default('overlay'),
  show_cta: z.boolean().default(true),
  cta_text: z.string().default('MUA FULL SET'),
});

function Editor({ config, onChange }: SectionEditorProps) {
  const items = (config.items as Array<{ image: string; label: string; link: string }>) || [];

  const updateItem = (i: number, key: string, val: string) => {
    const next = [...items];
    next[i] = { ...next[i], [key]: val };
    onChange({ ...config, items: next });
  };

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">Tieu de</label>
        <input value={(config.title as string) || ''} onChange={(e) => onChange({ ...config, title: e.target.value })} className="w-full text-sm border rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-400" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">Phu de</label>
        <input value={(config.subtitle as string) || ''} onChange={(e) => onChange({ ...config, subtitle: e.target.value })} className="w-full text-sm border rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-400" />
      </div>

      {/* Display mode */}
      <div>
        <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wide mb-2">Che do hien thi</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'grid', label: 'Luoi', icon: '▦' },
            { value: 'masonry', label: 'Masonry', icon: '▥' },
            { value: 'carousel', label: 'Carousel', icon: '↔' },
          ].map(m => (
            <button key={m.value} type="button" onClick={() => onChange({ ...config, display_mode: m.value })}
              className={`flex flex-col items-center gap-1 p-2 border-2 rounded-lg transition ${config.display_mode === m.value ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-500'}`}>
              <span className="text-lg">{m.icon}</span>
              <span className="text-[10px] font-medium">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Layout */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">Số cột</label>
        <select value={(config.layout as string) || '3-column'} onChange={(e) => onChange({ ...config, layout: e.target.value })} className="w-full text-sm border rounded-md px-2.5 py-1.5">
          <option value="2-column">2 cột</option>
          <option value="3-column">3 cột</option>
          <option value="4-column">4 cột</option>
        </select>
      </div>

      {/* Card style */}
      <div>
        <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wide mb-2">Kiểu thẻ</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'overlay', label: 'Overlay', icon: '▮' },
            { value: 'below', label: 'Bên dưới', icon: '▯' },
            { value: 'hover', label: 'Hover', icon: '◈' },
          ].map(s => (
            <button key={s.value} type="button" onClick={() => onChange({ ...config, card_style: s.value })}
              className={`flex flex-col items-center gap-1 p-2 border-2 rounded-lg transition ${config.card_style === s.value ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-500'}`}>
              <span className="text-lg">{s.icon}</span>
              <span className="text-[10px] font-medium">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="border-t pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-800 uppercase tracking-wide">Hình ảnh ({items.length})</span>
          <button onClick={() => onChange({ ...config, items: [...items, { image: '', label: '', link: '', hotspots: [] }] })} className="text-xs text-orange-600">+ Thêm</button>
        </div>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="border rounded-lg p-2.5 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[10px] text-gray-400">Hình {i + 1}</span>
                <button onClick={() => onChange({ ...config, items: items.filter((_, j) => j !== i) })} className="text-[10px] text-red-400 hover:text-red-600">Xóa</button>
              </div>
              {item.image && <img src={item.image} alt="" className="w-full h-16 object-cover rounded" />}
              <input value={item.image} onChange={(e) => updateItem(i, 'image', e.target.value)} placeholder="URL ảnh" className="w-full text-xs border rounded-md px-2 py-1.5" />
              <input value={item.label} onChange={(e) => updateItem(i, 'label', e.target.value)} placeholder="Nhãn / tên outfit" className="w-full text-xs border rounded-md px-2 py-1.5" />
              <input value={item.link} onChange={(e) => updateItem(i, 'link', e.target.value)} placeholder="Link sản phẩm" className="w-full text-xs border rounded-md px-2 py-1.5" />
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="border-t pt-3 space-y-2">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs text-gray-700">Hiện nút CTA</span>
          <button type="button" onClick={() => onChange({ ...config, show_cta: !config.show_cta })}
            className={`relative w-9 h-5 rounded-full transition ${config.show_cta ? 'bg-orange-500' : 'bg-gray-300'}`}>
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${config.show_cta ? 'translate-x-4' : ''}`} />
          </button>
        </label>
        {Boolean(config.show_cta) && (
          <input value={(config.cta_text as string) || ''} onChange={(e) => onChange({ ...config, cta_text: e.target.value })} placeholder="Text CTA" className="w-full text-xs border rounded-md px-2 py-1.5" />
        )}
      </div>
    </div>
  );
}

function Renderer({ config }: SectionRendererProps) {
  const title = (config.title as string) || '';
  const subtitle = (config.subtitle as string) || '';
  const layout = (config.layout as string) || '3-column';
  const cardStyle = (config.card_style as string) || 'overlay';
  const showCta = config.show_cta !== false;
  const ctaText = (config.cta_text as string) || 'MUA FULL SET';
  const items = (config.items as Array<{ image: string; label: string }>) || [];

  const cols = layout === '2-column' ? 2 : layout === '4-column' ? 4 : 3;
  const displayItems = items.length > 0 ? items : Array.from({ length: cols }, (_, i) => ({
    image: '', label: `Outfit ${i + 1}`,
  }));

  return (
    <div className="py-8 px-4">
      {title && <h2 className="text-lg font-bold text-center tracking-wide uppercase mb-1">{title}</h2>}
      {subtitle && <p className="text-sm text-gray-500 text-center mb-5">{subtitle}</p>}

      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {displayItems.map((item, i) => (
          <div key={i} className="group cursor-pointer relative rounded-lg overflow-hidden">
            <div className="aspect-[3/4] bg-gray-100 relative">
              {item.image ? (
                <img src={item.image} alt={item.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                  </svg>
                </div>
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              {/* Label */}
              {cardStyle === 'overlay' && (
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-medium text-sm mb-1">{item.label}</p>
                  {showCta && (
                    <span className="text-[10px] text-white/80 font-medium tracking-wide uppercase">{ctaText} →</span>
                  )}
                </div>
              )}
            </div>
            {cardStyle === 'below' && (
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-800">{item.label}</p>
                {showCta && <span className="text-xs text-orange-500">{ctaText}</span>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CTA bottom */}
      <div className="text-center mt-5">
        <button className="px-6 py-2 border border-gray-800 text-gray-800 text-xs font-medium tracking-wide hover:bg-gray-800 hover:text-white transition">
          XEM THÊM
        </button>
      </div>
    </div>
  );
}

export const lookbookDefinition: SectionDefinition = {
  type: 'lookbook',
  label: 'Lookbook / Outfit',
  icon: 'Shirt',
  group: 'media',
  defaultConfig: {
    title: 'Mix & Match',
    subtitle: 'Gợi ý phối đồ từ chuyên gia',
    display_mode: 'grid',
    layout: '3-column',
    items: [],
    card_style: 'overlay',
    show_cta: true,
    cta_text: 'MUA FULL SET',
  },
  configSchema,
  EditorComponent: Editor,
  RendererComponent: Renderer,
};
