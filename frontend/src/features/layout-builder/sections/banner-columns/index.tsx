import { z } from 'zod';
import { type SectionDefinition } from '../../registry/types';

const configSchema = z.object({
  columns: z.array(z.object({ image: z.string(), title: z.string(), link: z.string() })).max(3),
  gap: z.number().default(16),
  aspect_ratio: z.string().default('4:3'),
});

function Editor({ config, onChange }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const columns = (config.columns as Array<{ image: string; title: string; link: string }>) || [];
  const updateCol = (i: number, key: string, val: string) => {
    const next = [...columns];
    next[i] = { ...next[i], [key]: val };
    onChange({ ...config, columns: next });
  };
  return (
    <div className="space-y-3">
      {columns.map((col, i) => (
        <div key={i} className="border rounded p-2 space-y-1">
          <span className="text-xs font-medium">Cot {i + 1}</span>
          <input value={col.image} onChange={(e) => updateCol(i, 'image', e.target.value)} placeholder="URL anh" className="w-full text-sm border rounded px-2 py-1" />
          <input value={col.title} onChange={(e) => updateCol(i, 'title', e.target.value)} placeholder="Tieu de" className="w-full text-sm border rounded px-2 py-1" />
          <input value={col.link} onChange={(e) => updateCol(i, 'link', e.target.value)} placeholder="Link" className="w-full text-sm border rounded px-2 py-1" />
        </div>
      ))}
      {columns.length < 3 && (
        <button onClick={() => onChange({ ...config, columns: [...columns, { image: '', title: '', link: '' }] })} className="text-xs px-2 py-1 border rounded">+ Them cot</button>
      )}
    </div>
  );
}

function Renderer({ config }: { config: Record<string, unknown>; preview?: boolean }) {
  const columns = (config.columns as Array<{ image: string; title: string }>) || [];
  return (
    <div className="py-6 px-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns.length || 2}, 1fr)` }}>
        {columns.map((col, i) => (
          <div key={i} className="relative overflow-hidden rounded-lg">
            {col.image ? <img src={col.image} alt={col.title} className="w-full aspect-[4/3] object-cover" /> : <div className="w-full aspect-[4/3] bg-gray-100" />}
            {col.title && <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 p-3"><p className="text-white font-medium text-sm">{col.title}</p></div>}
          </div>
        ))}
      </div>
    </div>
  );
}

export const bannerColumnsDefinition: SectionDefinition = {
  type: 'banner_columns',
  label: 'Banner nhieu cot',
  icon: 'Columns',
  group: 'media',
  defaultConfig: { columns: [{ image: '', title: 'Cot 1', link: '' }, { image: '', title: 'Cot 2', link: '' }], gap: 16, aspect_ratio: '4:3' },
  configSchema,
  EditorComponent: Editor,
  RendererComponent: Renderer,
};
