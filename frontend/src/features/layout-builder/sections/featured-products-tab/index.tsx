import { z } from 'zod';
import { type SectionDefinition, type SectionEditorProps, type SectionRendererProps } from '../../registry/types';

const configSchema = z.object({
  // Che do tab
  tab_style: z.enum(['underline', 'pill', 'button']).default('underline'),
  tabs: z.array(z.object({
    label: z.string(),
    source_type: z.string(),
    source_value: z.string(),
  })).max(5),
  products_per_tab: z.number().min(4).max(20).default(10),
  columns_desktop: z.number().min(2).max(6).default(5),
  columns_mobile: z.number().min(2).max(3).default(2),
  // Hien thi
  show_cta: z.boolean().default(true),
  cta_text: z.string().default('XEM TAT CA SAN PHAM NOI BAT'),
});

function Editor({ config, onChange }: SectionEditorProps) {
  const tabs = (config.tabs as Array<{ label: string; source_type: string; source_value: string }>) || [];

  const updateTab = (i: number, key: string, val: string) => {
    const next = [...tabs];
    next[i] = { ...next[i], [key]: val };
    onChange({ ...config, tabs: next });
  };

  return (
    <div className="space-y-4">
      {/* Tab style */}
      <div>
        <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wide mb-2">Kieu tab</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'underline', label: 'Gach chan', icon: '▁' },
            { value: 'pill', label: 'Vien tron', icon: '◖' },
            { value: 'button', label: 'Nut bam', icon: '▭' },
          ].map(style => (
            <button
              key={style.value}
              type="button"
              onClick={() => onChange({ ...config, tab_style: style.value })}
              className={`flex flex-col items-center gap-1 p-2 border-2 rounded-lg transition ${
                config.tab_style === style.value
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-500'
              }`}
            >
              <span className="text-lg">{style.icon}</span>
              <span className="text-[10px] font-medium">{style.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab list */}
      <div className="border-t pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-800 uppercase tracking-wide">Tabs ({tabs.length}/5)</span>
          {tabs.length < 5 && (
            <button
              onClick={() => onChange({ ...config, tabs: [...tabs, { label: 'Tab moi', source_type: 'collection', source_value: 'new_arrivals' }] })}
              className="text-xs text-orange-600 hover:text-orange-700"
            >
              + Them tab
            </button>
          )}
        </div>

        <div className="space-y-2">
          {tabs.map((tab, i) => (
            <div key={i} className="border rounded-lg p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400">Tab {i + 1}</span>
                <button onClick={() => onChange({ ...config, tabs: tabs.filter((_, j) => j !== i) })} className="text-[10px] text-red-400 hover:text-red-600">Xoa</button>
              </div>
              <input
                value={tab.label}
                onChange={(e) => updateTab(i, 'label', e.target.value)}
                placeholder="Ten tab"
                className="w-full text-xs border rounded-md px-2 py-1.5 focus:ring-1 focus:ring-orange-400 focus:outline-none"
              />
              <select
                value={tab.source_value}
                onChange={(e) => updateTab(i, 'source_value', e.target.value)}
                className="w-full text-xs border rounded-md px-2 py-1.5"
              >
                <option value="new_arrivals">Hang moi ve</option>
                <option value="best_sellers">Ban chay nhat</option>
                <option value="on_sale">Dang giam gia</option>
                <option value="featured">Noi bat</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Grid settings */}
      <div className="border-t pt-3 space-y-3">
        <p className="text-xs font-semibold text-gray-800 uppercase tracking-wide">Tuy chinh luoi</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-gray-500">SP moi tab</label>
            <input type="number" min={4} max={20} value={(config.products_per_tab as number) || 10} onChange={(e) => onChange({ ...config, products_per_tab: Number(e.target.value) })} className="w-full text-xs border rounded-md px-2 py-1.5" />
          </div>
          <div>
            <label className="text-[10px] text-gray-500">Cot desktop</label>
            <input type="number" min={2} max={6} value={(config.columns_desktop as number) || 5} onChange={(e) => onChange({ ...config, columns_desktop: Number(e.target.value) })} className="w-full text-xs border rounded-md px-2 py-1.5" />
          </div>
        </div>

        {/* CTA toggle */}
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs text-gray-700">Hien nut CTA</span>
          <button
            type="button"
            onClick={() => onChange({ ...config, show_cta: !config.show_cta })}
            className={`relative w-9 h-5 rounded-full transition ${config.show_cta ? 'bg-orange-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${config.show_cta ? 'translate-x-4' : ''}`} />
          </button>
        </label>
        {Boolean(config.show_cta) && (
          <input
            value={(config.cta_text as string) || ''}
            onChange={(e) => onChange({ ...config, cta_text: e.target.value })}
            placeholder="Text CTA"
            className="w-full text-xs border rounded-md px-2 py-1.5"
          />
        )}
      </div>
    </div>
  );
}

function Renderer({ config }: SectionRendererProps) {
  const tabs = (config.tabs as Array<{ label: string }>) || [];
  const tabStyle = (config.tab_style as string) || 'underline';
  const cols = (config.columns_desktop as number) || 5;
  const perTab = (config.products_per_tab as number) || 10;
  const showCta = config.show_cta !== false;
  const ctaText = (config.cta_text as string) || 'XEM TAT CA';

  const displayCount = Math.min(cols * 2, perTab);

  // Tab styles
  const tabClass = (active: boolean) => {
    switch (tabStyle) {
      case 'pill':
        return active
          ? 'bg-black text-white px-4 py-1.5 rounded-full text-xs font-medium'
          : 'text-gray-500 px-4 py-1.5 text-xs hover:text-gray-700';
      case 'button':
        return active
          ? 'bg-black text-white px-4 py-1.5 text-xs font-medium'
          : 'border border-gray-300 text-gray-500 px-4 py-1.5 text-xs hover:border-gray-400';
      default: // underline
        return active
          ? 'pb-2 text-sm font-bold border-b-2 border-black text-black'
          : 'pb-2 text-sm text-gray-400 hover:text-gray-600';
    }
  };

  return (
    <div className="py-8 px-4">
      {/* Tab navigation */}
      <div className={`flex gap-3 mb-6 ${tabStyle === 'underline' ? 'border-b' : ''} ${tabStyle === 'underline' ? 'justify-center' : 'justify-center gap-2'}`}>
        {tabs.map((tab, i) => (
          <button key={i} className={tabClass(i === 0)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: displayCount }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[4/5] bg-gray-100 rounded-lg mb-2 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                </svg>
              </div>
              {i < 2 && <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">-30%</div>}
            </div>
            <p className="text-xs text-gray-700 line-clamp-2 mb-1">Ao thun nam co tron basic</p>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-red-600">{(199000 + i * 50000).toLocaleString('vi-VN')}d</span>
              {i < 2 && <span className="text-[10px] text-gray-400 line-through">{(399000 + i * 50000).toLocaleString('vi-VN')}d</span>}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      {showCta && (
        <div className="text-center mt-6">
          <button className="px-8 py-2.5 border border-gray-800 text-gray-800 text-xs font-medium tracking-wide hover:bg-gray-800 hover:text-white transition">
            {ctaText}
          </button>
        </div>
      )}
    </div>
  );
}

export const featuredProductsTabDefinition: SectionDefinition = {
  type: 'featured_products_tab',
  label: 'SP noi bat (tabs)',
  icon: 'Layers',
  group: 'product',
  defaultConfig: {
    tab_style: 'underline',
    tabs: [
      { label: 'Hang moi', source_type: 'collection', source_value: 'new_arrivals' },
      { label: 'Ban chay', source_type: 'collection', source_value: 'best_sellers' },
    ],
    products_per_tab: 10,
    columns_desktop: 5,
    columns_mobile: 2,
    show_cta: true,
    cta_text: 'XEM TAT CA SAN PHAM NOI BAT',
  },
  configSchema,
  EditorComponent: Editor,
  RendererComponent: Renderer,
};
