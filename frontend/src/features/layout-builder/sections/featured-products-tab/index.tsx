import { z } from 'zod';
import { type SectionDefinition } from '../../registry/types';

const configSchema = z.object({
  tabs: z.array(z.object({ label: z.string(), source_type: z.string(), source_value: z.string() })).max(5),
  products_per_tab: z.number().default(8),
  columns_desktop: z.number().default(4),
  columns_mobile: z.number().default(2),
});

function Editor({ config, onChange }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const tabs = (config.tabs as Array<{ label: string; source_type: string; source_value: string }>) || [];
  const updateTab = (i: number, key: string, val: string) => {
    const next = [...tabs];
    next[i] = { ...next[i], [key]: val };
    onChange({ ...config, tabs: next });
  };
  return (
    <div className="space-y-3">
      <h4 className="font-medium text-sm">Tabs ({tabs.length}/5)</h4>
      {tabs.map((tab, i) => (
        <div key={i} className="border rounded p-2 space-y-1">
          <input value={tab.label} onChange={(e) => updateTab(i, 'label', e.target.value)} placeholder="Ten tab" className="w-full text-sm border rounded px-2 py-1" />
          <select value={tab.source_value} onChange={(e) => updateTab(i, 'source_value', e.target.value)} className="w-full text-sm border rounded px-2 py-1">
            <option value="new_arrivals">Hang moi</option>
            <option value="best_sellers">Ban chay</option>
            <option value="on_sale">Giam gia</option>
          </select>
          <button onClick={() => onChange({ ...config, tabs: tabs.filter((_, j) => j !== i) })} className="text-xs text-red-500">Xoa</button>
        </div>
      ))}
      {tabs.length < 5 && (
        <button onClick={() => onChange({ ...config, tabs: [...tabs, { label: 'Tab moi', source_type: 'collection', source_value: 'new_arrivals' }] })} className="text-xs px-2 py-1 border rounded">+ Them tab</button>
      )}
    </div>
  );
}

function Renderer({ config }: { config: Record<string, unknown>; preview?: boolean }) {
  const tabs = (config.tabs as Array<{ label: string }>) || [];
  return (
    <div className="py-8 px-4">
      <div className="flex gap-4 border-b mb-4">
        {tabs.map((tab, i) => (
          <button key={i} className={`pb-2 text-sm font-medium ${i === 0 ? 'border-b-2 border-black' : 'text-gray-400'}`}>{tab.label}</button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}><div className="bg-gray-100 aspect-square rounded-lg mb-2" /><div className="h-3 bg-gray-100 rounded w-3/4" /></div>
        ))}
      </div>
    </div>
  );
}

export const featuredProductsTabDefinition: SectionDefinition = {
  type: 'featured_products_tab',
  label: 'SP noi bat (tabs)',
  icon: 'Layers',
  group: 'product',
  defaultConfig: {
    tabs: [
      { label: 'Hang moi', source_type: 'collection', source_value: 'new_arrivals' },
      { label: 'Ban chay', source_type: 'collection', source_value: 'best_sellers' },
    ],
    products_per_tab: 8,
    columns_desktop: 4,
    columns_mobile: 2,
  },
  configSchema,
  EditorComponent: Editor,
  RendererComponent: Renderer,
};
