import { z } from 'zod';
import { type SectionDefinition } from '../../registry/types';
import { createSimpleEditor } from '../_shared/simple-editor';

const configSchema = z.object({
  title: z.string().default('Danh muc noi bat'),
  categories: z.array(z.string()).default([]),
  layout: z.string().default('grid'),
  columns_desktop: z.number().default(4),
  columns_mobile: z.number().default(2),
  show_image: z.boolean().default(true),
  show_count: z.boolean().default(true),
});

const Editor = createSimpleEditor([
  { key: 'title', label: 'Tieu de', type: 'text' },
  { key: 'layout', label: 'Layout', type: 'select', options: [{ label: 'Grid', value: 'grid' }, { label: 'Horizontal scroll', value: 'scroll' }] },
  { key: 'columns_desktop', label: 'So cot desktop', type: 'number' },
  { key: 'columns_mobile', label: 'So cot mobile', type: 'number' },
  { key: 'show_image', label: 'Hien anh', type: 'checkbox' },
  { key: 'show_count', label: 'Hien so SP', type: 'checkbox' },
]);

function Renderer({ config }: { config: Record<string, unknown>; preview?: boolean }) {
  const title = config.title as string;
  const cols = config.columns_desktop as number || 4;

  return (
    <div className="py-8 px-4">
      {title && <h2 className="text-xl font-bold mb-4 text-center">{title}</h2>}
      <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center text-gray-400 text-sm">
            Danh muc {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

export const categoryGridDefinition: SectionDefinition = {
  type: 'category_grid',
  label: 'Luoi danh muc',
  icon: 'LayoutGrid',
  group: 'product',
  defaultConfig: { title: 'Danh muc noi bat', categories: [], layout: 'grid', columns_desktop: 4, columns_mobile: 2, show_image: true, show_count: true },
  configSchema,
  EditorComponent: Editor,
  RendererComponent: Renderer,
};
