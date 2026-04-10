import { z } from 'zod';
import { type SectionDefinition } from '../../registry/types';

const configSchema = z.object({
  items: z.array(z.object({ icon: z.string(), title: z.string(), subtitle: z.string() })),
  bg_color: z.string().default('#F9FAFB'),
  text_color: z.string().default('#333333'),
});

function Editor({ config, onChange }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const items = (config.items as Array<{ icon: string; title: string; subtitle: string }>) || [];
  const updateItem = (i: number, key: string, val: string) => {
    const next = [...items];
    next[i] = { ...next[i], [key]: val };
    onChange({ ...config, items: next });
  };
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="border rounded p-2 space-y-1">
          <input value={item.icon} onChange={(e) => updateItem(i, 'icon', e.target.value)} placeholder="Icon (lucide)" className="w-full text-sm border rounded px-2 py-1" />
          <input value={item.title} onChange={(e) => updateItem(i, 'title', e.target.value)} placeholder="Tieu de" className="w-full text-sm border rounded px-2 py-1" />
          <input value={item.subtitle} onChange={(e) => updateItem(i, 'subtitle', e.target.value)} placeholder="Mo ta" className="w-full text-sm border rounded px-2 py-1" />
        </div>
      ))}
    </div>
  );
}

function Renderer({ config }: { config: Record<string, unknown>; preview?: boolean }) {
  const items = (config.items as Array<{ icon: string; title: string; subtitle: string }>) || [];
  return (
    <div className="py-6 px-4" style={{ backgroundColor: config.bg_color as string }}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
        {items.map((item, i) => (
          <div key={i} className="text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center text-sm">✓</div>
            <p className="font-medium text-sm">{item.title}</p>
            <p className="text-xs text-gray-500">{item.subtitle}</p>
          </div>
        ))}
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
    items: [
      { icon: 'Truck', title: 'Freeship', subtitle: 'Don tu 500K' },
      { icon: 'ShieldCheck', title: 'Chinh hang', subtitle: '100% dam bao' },
      { icon: 'RefreshCw', title: 'Doi tra', subtitle: 'Trong 30 ngay' },
      { icon: 'Phone', title: 'Ho tro', subtitle: '1800 xxxx' },
    ],
    bg_color: '#F9FAFB',
    text_color: '#333333',
  },
  configSchema,
  EditorComponent: Editor,
  RendererComponent: Renderer,
};
