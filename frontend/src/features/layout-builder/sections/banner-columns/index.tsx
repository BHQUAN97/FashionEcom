import { z } from 'zod';
import { type SectionDefinition, type SectionEditorProps, type SectionRendererProps } from '../../registry/types';

const configSchema = z.object({
  // Mode
  display_mode: z.enum(['equal', 'featured', 'stacked']).default('equal'),
  // Columns
  columns: z.array(z.object({
    image: z.string(),
    title: z.string(),
    subtitle: z.string().default(''),
    link: z.string(),
  })).max(4),
  // Style
  gap: z.number().default(12),
  aspect_ratio: z.enum(['4:3', '3:4', '1:1', '16:9']).default('4:3'),
  show_text_overlay: z.boolean().default(true),
  rounded: z.boolean().default(true),
});

function Editor({ config, onChange }: SectionEditorProps) {
  const columns = (config.columns as Array<{ image: string; title: string; subtitle: string; link: string }>) || [];

  const updateCol = (i: number, key: string, val: string) => {
    const next = [...columns];
    next[i] = { ...next[i], [key]: val };
    onChange({ ...config, columns: next });
  };

  return (
    <div className="space-y-4">
      {/* Display mode */}
      <div>
        <label className="block text-xs font-semibold text-gray-800 uppercase tracking-wide mb-2">Che do hien thi</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'equal', label: 'Deu nhau', icon: '▪▪▪' },
            { value: 'featured', label: 'Noi bat', icon: '▮▪▪' },
            { value: 'stacked', label: 'Xep chong', icon: '▬▬' },
          ].map(m => (
            <button key={m.value} type="button" onClick={() => onChange({ ...config, display_mode: m.value })}
              className={`flex flex-col items-center gap-1 p-2 border-2 rounded-lg transition ${config.display_mode === m.value ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-500'}`}>
              <span className="text-sm">{m.icon}</span>
              <span className="text-[10px] font-medium">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Aspect ratio */}
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1 block">Ti le anh</label>
        <select value={(config.aspect_ratio as string) || '4:3'} onChange={(e) => onChange({ ...config, aspect_ratio: e.target.value })} className="w-full text-sm border rounded-md px-2.5 py-1.5">
          <option value="4:3">4:3 (Ngang)</option>
          <option value="3:4">3:4 (Doc)</option>
          <option value="1:1">1:1 (Vuong)</option>
          <option value="16:9">16:9 (Phim)</option>
        </select>
      </div>

      {/* Toggles */}
      <div className="space-y-2">
        {[
          { key: 'show_text_overlay', label: 'Hien text tren anh' },
          { key: 'rounded', label: 'Bo tron goc' },
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

      {/* Columns */}
      <div className="border-t pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-800 uppercase tracking-wide">Cot ({columns.length}/4)</span>
          {columns.length < 4 && (
            <button onClick={() => onChange({ ...config, columns: [...columns, { image: '', title: '', subtitle: '', link: '' }] })} className="text-xs text-orange-600">+ Them cot</button>
          )}
        </div>
        <div className="space-y-2">
          {columns.map((col, i) => (
            <div key={i} className="border rounded-lg p-2.5 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[10px] text-gray-400">Cot {i + 1}</span>
                <button onClick={() => onChange({ ...config, columns: columns.filter((_, j) => j !== i) })} className="text-[10px] text-red-400 hover:text-red-600">Xoa</button>
              </div>
              {col.image && <img src={col.image} alt="" className="w-full h-14 object-cover rounded" />}
              <input value={col.image} onChange={(e) => updateCol(i, 'image', e.target.value)} placeholder="URL anh" className="w-full text-xs border rounded-md px-2 py-1.5" />
              <input value={col.title} onChange={(e) => updateCol(i, 'title', e.target.value)} placeholder="Tieu de" className="w-full text-xs border rounded-md px-2 py-1.5" />
              <input value={col.subtitle || ''} onChange={(e) => updateCol(i, 'subtitle', e.target.value)} placeholder="Phu de" className="w-full text-xs border rounded-md px-2 py-1.5" />
              <input value={col.link} onChange={(e) => updateCol(i, 'link', e.target.value)} placeholder="Link" className="w-full text-xs border rounded-md px-2 py-1.5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Renderer({ config }: SectionRendererProps) {
  const columns = (config.columns as Array<{ image: string; title: string; subtitle: string }>) || [];
  const mode = (config.display_mode as string) || 'equal';
  const aspectRatio = (config.aspect_ratio as string) || '4:3';
  const showOverlay = config.show_text_overlay !== false;
  const rounded = config.rounded !== false;

  const aspectClass = aspectRatio === '3:4' ? 'aspect-[3/4]' : aspectRatio === '1:1' ? 'aspect-square' : aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[4/3]';
  const roundedClass = rounded ? 'rounded-lg' : '';

  if (columns.length === 0) {
    return (
      <div className="py-8 px-4">
        <div className="grid grid-cols-2 gap-3">
          {[1, 2].map(i => (
            <div key={i} className={`${aspectClass} bg-gray-100 ${roundedClass} flex items-center justify-center text-gray-400 text-sm`}>
              Cot {i}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Featured mode — cot dau lon gap doi
  if (mode === 'featured' && columns.length >= 2) {
    return (
      <div className="py-6 px-4">
        <div className="grid grid-cols-2 gap-3" style={{ gridTemplateRows: 'auto auto' }}>
          {/* Cot dau - span 2 rows */}
          <div className={`row-span-2 relative overflow-hidden ${roundedClass} group`}>
            {columns[0].image ? (
              <img src={columns[0].image} alt={columns[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full bg-gray-100 min-h-[300px]" />
            )}
            {showOverlay && columns[0].title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 p-4">
                <p className="text-white font-bold">{columns[0].title}</p>
                {columns[0].subtitle && <p className="text-white/70 text-xs">{columns[0].subtitle}</p>}
              </div>
            )}
          </div>
          {/* Cac cot con lai */}
          {columns.slice(1).map((col, i) => (
            <div key={i} className={`relative overflow-hidden ${roundedClass} group`}>
              {col.image ? (
                <img src={col.image} alt={col.title} className={`w-full ${aspectClass} object-cover group-hover:scale-105 transition-transform duration-500`} />
              ) : (
                <div className={`w-full ${aspectClass} bg-gray-100`} />
              )}
              {showOverlay && col.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 p-3">
                  <p className="text-white font-medium text-sm">{col.title}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Stacked mode — xep doc
  if (mode === 'stacked') {
    return (
      <div className="py-6 px-4 space-y-3">
        {columns.map((col, i) => (
          <div key={i} className={`relative overflow-hidden ${roundedClass} group`}>
            {col.image ? (
              <img src={col.image} alt={col.title} className="w-full aspect-[21/9] object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full aspect-[21/9] bg-gray-100" />
            )}
            {showOverlay && col.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 p-4">
                <p className="text-white font-bold">{col.title}</p>
                {col.subtitle && <p className="text-white/70 text-xs">{col.subtitle}</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Equal mode (default)
  return (
    <div className="py-6 px-4">
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
        {columns.map((col, i) => (
          <div key={i} className={`relative overflow-hidden ${roundedClass} group`}>
            {col.image ? (
              <img src={col.image} alt={col.title} className={`w-full ${aspectClass} object-cover group-hover:scale-105 transition-transform duration-500`} />
            ) : (
              <div className={`w-full ${aspectClass} bg-gray-100`} />
            )}
            {showOverlay && col.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 p-3">
                <p className="text-white font-medium text-sm">{col.title}</p>
                {col.subtitle && <p className="text-white/70 text-[10px]">{col.subtitle}</p>}
              </div>
            )}
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
  defaultConfig: {
    display_mode: 'equal',
    columns: [
      { image: '', title: 'Cot 1', subtitle: '', link: '' },
      { image: '', title: 'Cot 2', subtitle: '', link: '' },
    ],
    gap: 12,
    aspect_ratio: '4:3',
    show_text_overlay: true,
    rounded: true,
  },
  configSchema,
  EditorComponent: Editor,
  RendererComponent: Renderer,
};
