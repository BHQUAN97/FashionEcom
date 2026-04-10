import { z } from 'zod';
import { type SectionDefinition } from '../../registry/types';
import { createSimpleEditor } from '../_shared/simple-editor';

const configSchema = z.object({
  title: z.string().default(''),
  content: z.string().default(''),
  image: z.string().default(''),
  image_position: z.string().default('right'),
});

const Editor = createSimpleEditor([
  { key: 'title', label: 'Tieu de', type: 'text' },
  { key: 'content', label: 'Noi dung', type: 'textarea' },
  { key: 'image', label: 'URL anh', type: 'text' },
  { key: 'image_position', label: 'Vi tri anh', type: 'select', options: [{ label: 'Trai', value: 'left' }, { label: 'Phai', value: 'right' }] },
]);

function Renderer({ config }: { config: Record<string, unknown>; preview?: boolean }) {
  const imgPos = config.image_position as string;
  return (
    <div className={`py-8 px-4 flex flex-col md:flex-row gap-6 items-center ${imgPos === 'left' ? 'md:flex-row-reverse' : ''}`}>
      <div className="flex-1 space-y-3">
        {String(config.title || '') && <h2 className="text-xl font-bold">{String(config.title)}</h2>}
        {String(config.content || '') && <p className="text-gray-600 text-sm leading-relaxed">{String(config.content)}</p>}
      </div>
      <div className="flex-1">
        {(config.image as string) ? <img src={config.image as string} alt="" className="w-full rounded-lg" /> : <div className="w-full aspect-[4/3] bg-gray-100 rounded-lg" />}
      </div>
    </div>
  );
}

export const textImageDefinition: SectionDefinition = {
  type: 'text_image',
  label: 'Text + Anh',
  icon: 'FileText',
  group: 'content',
  defaultConfig: { title: '', content: '', image: '', image_position: 'right' },
  configSchema,
  EditorComponent: Editor,
  RendererComponent: Renderer,
};
