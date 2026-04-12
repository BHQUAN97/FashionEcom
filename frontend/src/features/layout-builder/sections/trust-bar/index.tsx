import { z } from 'zod';
import { Truck, ShieldCheck, RefreshCw, Phone, Check } from 'lucide-react';
import { type SectionDefinition, type SectionEditorProps, type SectionRendererProps } from '../../registry/types';

const ICON_MAP: Record<string, React.ElementType> = {
  Truck, ShieldCheck, RefreshCw, Phone, Check,
};

const configSchema = z.object({
  // Che do hien thi
  display_mode: z.enum(['row', 'card', 'icon_only']).default('row'),
  // Items
  items: z.array(z.object({
    icon: z.string(),
    title: z.string(),
    subtitle: z.string(),
  })),
  // Style
  bg_color: z.string().default('#F9FAFB'),
  text_color: z.string().default('#333333'),
  icon_color: z.string().default('#333333'),
  // Border
  show_border: z.boolean().default(false),
  show_icon_bg: z.boolean().default(true),
});

function Editor({ config, onChange }: SectionEditorProps) {
  const items = (config.items as Array<{ icon: string; title: string; subtitle: string }>) || [];

  const updateItem = (i: number, key: string, val: string) => {
    const next = [...items];
    next[i] = { ...next[i], [key]: val };
    onChange({ ...config, items: next });
  };

  return (
    <div className="space-y-4">
      {/* Display mode */}
      <div>
        <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wide mb-2">Che do hien thi</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'row', label: 'Hang ngang', icon: '—' },
            { value: 'card', label: 'The card', icon: '□' },
            { value: 'icon_only', label: 'Chi icon', icon: '◉' },
          ].map(m => (
            <button key={m.value} type="button" onClick={() => onChange({ ...config, display_mode: m.value })}
              className={`flex flex-col items-center gap-1 p-2 border-2 rounded-lg transition ${config.display_mode === m.value ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-500'}`}>
              <span className="text-lg">{m.icon}</span>
              <span className="text-[10px] font-medium">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="border-t pt-3 space-y-2">
        <p className="text-xs font-semibold text-gray-800 uppercase tracking-wide">Mau sac</p>
        {[
          { key: 'bg_color', label: 'Nen' },
          { key: 'text_color', label: 'Chu' },
          { key: 'icon_color', label: 'Icon' },
        ].map(c => (
          <div key={c.key} className="flex items-center gap-2">
            <input type="color" value={(config[c.key] as string) || '#000'} onChange={(e) => onChange({ ...config, [c.key]: e.target.value })} className="w-7 h-7 rounded border" />
            <span className="text-xs text-gray-600 flex-1">{c.label}</span>
            <input type="text" value={(config[c.key] as string) || ''} onChange={(e) => onChange({ ...config, [c.key]: e.target.value })} className="w-20 text-xs border rounded px-1.5 py-1 font-mono" />
          </div>
        ))}
      </div>

      {/* Toggles */}
      <div className="border-t pt-3 space-y-2">
        {[
          { key: 'show_border', label: 'Hien vien card' },
          { key: 'show_icon_bg', label: 'Nen icon' },
        ].map(t => (
          <label key={t.key} className="flex items-center justify-between cursor-pointer">
            <span className="text-xs text-gray-700">{t.label}</span>
            <button type="button" onClick={() => onChange({ ...config, [t.key]: !config[t.key] })}
              className={`relative w-9 h-5 rounded-full transition ${config[t.key] ? 'bg-orange-500' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${config[t.key] ? 'translate-x-4' : ''}`} />
            </button>
          </label>
        ))}
      </div>

      {/* Items */}
      <div className="border-t pt-3">
        <p className="text-xs font-semibold text-gray-800 uppercase tracking-wide mb-2">Muc tin cay ({items.length})</p>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="border rounded-lg p-2.5 space-y-1.5">
              <div>
                <label className="text-[10px] text-gray-400">Icon (Truck, ShieldCheck, RefreshCw, Phone)</label>
                <input value={item.icon} onChange={(e) => updateItem(i, 'icon', e.target.value)} placeholder="Icon name" className="w-full text-xs border rounded-md px-2 py-1.5" />
              </div>
              <input value={item.title} onChange={(e) => updateItem(i, 'title', e.target.value)} placeholder="Tieu de" className="w-full text-xs border rounded-md px-2 py-1.5" />
              <input value={item.subtitle} onChange={(e) => updateItem(i, 'subtitle', e.target.value)} placeholder="Mo ta" className="w-full text-xs border rounded-md px-2 py-1.5" />
            </div>
          ))}
        </div>
        <button onClick={() => onChange({ ...config, items: [...items, { icon: 'Check', title: 'Tieu de', subtitle: 'Mo ta' }] })} className="text-xs text-orange-600 mt-2">+ Them muc</button>
      </div>
    </div>
  );
}

function Renderer({ config }: SectionRendererProps) {
  const items = (config.items as Array<{ icon: string; title: string; subtitle: string }>) || [];
  const mode = (config.display_mode as string) || 'row';
  const bgColor = (config.bg_color as string) || '#F9FAFB';
  const textColor = (config.text_color as string) || '#333333';
  const iconColor = (config.icon_color as string) || '#333333';
  const showBorder = !!config.show_border;
  const showIconBg = config.show_icon_bg !== false;

  if (items.length === 0) return null;

  // Icon only mode
  if (mode === 'icon_only') {
    return (
      <div className="py-5 px-4" style={{ backgroundColor: bgColor }}>
        <div className="flex justify-center gap-8">
          {items.map((item, i) => {
            const Icon = ICON_MAP[item.icon] || Check;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <Icon className="w-6 h-6" style={{ color: iconColor }} />
                <span className="text-[10px] font-medium" style={{ color: textColor }}>{item.title}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Card mode
  if (mode === 'card') {
    return (
      <div className="py-6 px-4" style={{ backgroundColor: bgColor }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
          {items.map((item, i) => {
            const Icon = ICON_MAP[item.icon] || Check;
            return (
              <div key={i} className={`text-center p-4 rounded-lg ${showBorder ? 'border border-gray-200' : ''} bg-white`}>
                <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${showIconBg ? 'bg-gray-100' : ''}`}>
                  <Icon className="w-5 h-5" style={{ color: iconColor }} />
                </div>
                <p className="font-medium text-sm" style={{ color: textColor }}>{item.title}</p>
                <p className="text-xs mt-0.5 opacity-60" style={{ color: textColor }}>{item.subtitle}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Row mode (default) — giong storefront TrustBar
  return (
    <div className="py-6 px-4" style={{ backgroundColor: bgColor }}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
        {items.map((item, i) => {
          const Icon = ICON_MAP[item.icon] || Check;
          return (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${showIconBg ? 'bg-gray-100' : ''}`}>
                <Icon className="w-5 h-5" style={{ color: iconColor }} />
              </div>
              <div>
                <p className="font-medium text-sm" style={{ color: textColor }}>{item.title}</p>
                <p className="text-xs opacity-60" style={{ color: textColor }}>{item.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const trustBarDefinition: SectionDefinition = {
  type: 'trust_bar',
  label: 'Thanh tin cay',
  icon: 'Shield',
  group: 'utility',
  defaultConfig: {
    display_mode: 'row',
    items: [
      { icon: 'Truck', title: 'Freeship', subtitle: 'Don tu 500K' },
      { icon: 'ShieldCheck', title: 'Chinh hang', subtitle: '100% dam bao' },
      { icon: 'RefreshCw', title: 'Doi tra', subtitle: 'Trong 30 ngay' },
      { icon: 'Phone', title: 'Ho tro', subtitle: '1800 xxxx' },
    ],
    bg_color: '#F9FAFB',
    text_color: '#333333',
    icon_color: '#333333',
    show_border: false,
    show_icon_bg: true,
  },
  configSchema,
  EditorComponent: Editor,
  RendererComponent: Renderer,
};
