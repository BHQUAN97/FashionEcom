import { z } from 'zod';
import { type SectionDefinition } from '../../registry/types';
import { createSimpleEditor } from '../_shared/simple-editor';

const configSchema = z.object({
  title: z.string().default('Flash Sale'),
  flash_sale_id: z.string().nullable().default(null),
  max_products: z.number().default(8),
  bg_color: z.string().default('#D0021B'),
  text_color: z.string().default('#FFFFFF'),
});

const Editor = createSimpleEditor([
  { key: 'title', label: 'Tieu de', type: 'text' },
  { key: 'flash_sale_id', label: 'Flash Sale ID', type: 'text', placeholder: 'UUID cua flash sale' },
  { key: 'max_products', label: 'So SP toi da', type: 'number' },
  { key: 'bg_color', label: 'Mau nen', type: 'color' },
  { key: 'text_color', label: 'Mau chu', type: 'color' },
]);

function Renderer({ config }: { config: Record<string, unknown>; preview?: boolean }) {
  return (
    <div className="py-8 px-4" style={{ backgroundColor: config.bg_color as string, color: config.text_color as string }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{config.title as string}</h2>
        <div className="flex gap-2 text-sm font-mono">
          {['00', '12', '34', '56'].map((v, i) => (
            <span key={i} className="bg-black/30 px-2 py-1 rounded">{v}</span>
          ))}
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="shrink-0 w-40 bg-white rounded-lg p-2">
            <div className="aspect-square bg-gray-100 rounded mb-2" />
            <div className="h-2 bg-gray-200 rounded w-3/4 mb-1" />
            <div className="flex gap-1">
              <span className="text-xs text-red-600 font-bold">199K</span>
              <span className="text-xs text-gray-400 line-through">399K</span>
            </div>
            <div className="mt-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full" style={{ width: '60%' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const flashSaleCountdownDefinition: SectionDefinition = {
  type: 'flash_sale_countdown',
  label: 'Flash Sale Countdown',
  icon: 'Zap',
  group: 'product',
  maxInstances: 1,
  defaultConfig: { title: 'Flash Sale', flash_sale_id: null, max_products: 8, bg_color: '#D0021B', text_color: '#FFFFFF' },
  configSchema,
  EditorComponent: Editor,
  RendererComponent: Renderer,
};
