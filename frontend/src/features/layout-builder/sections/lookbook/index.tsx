import { z } from 'zod';
import { type SectionDefinition } from '../../registry/types';
import { createSimpleEditor } from '../_shared/simple-editor';

const configSchema = z.object({
  title: z.string().default('Mix & Match'),
  items: z.array(z.object({ image: z.string(), label: z.string(), link: z.string(), hotspots: z.array(z.any()).default([]) })),
  layout: z.string().default('3-column'),
});

const Editor = createSimpleEditor([
  { key: 'title', label: 'Tieu de', type: 'text' },
  { key: 'layout', label: 'Layout', type: 'select', options: [
    { label: '2 cot', value: '2-column' },
    { label: '3 cot', value: '3-column' },
  ]},
]);

function Renderer({ config }: { config: Record<string, unknown>; preview?: boolean }) {
  return (
    <div className="py-8 px-4">
      <h2 className="text-xl font-bold mb-4 text-center">{config.title as string}</h2>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-gray-100 aspect-[3/4] rounded-lg flex items-center justify-center text-gray-400">Lookbook {i + 1}</div>
        ))}
      </div>
    </div>
  );
}

export const lookbookDefinition: SectionDefinition = {
  type: 'lookbook',
  label: 'Lookbook / Outfit',
  icon: 'Shirt',
  group: 'media',
  defaultConfig: { title: 'Mix & Match', items: [], layout: '3-column' },
  configSchema,
  EditorComponent: Editor,
  RendererComponent: Renderer,
};
