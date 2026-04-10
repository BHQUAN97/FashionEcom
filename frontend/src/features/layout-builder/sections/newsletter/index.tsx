import { z } from 'zod';
import { type SectionDefinition } from '../../registry/types';
import { createSimpleEditor } from '../_shared/simple-editor';

const configSchema = z.object({
  title: z.string().default('Dang ky nhan tin khuyen mai'),
  subtitle: z.string().default('Nhan ngay ma giam 10% cho don hang dau tien'),
  button_text: z.string().default('Dang ky'),
  bg_color: z.string().default('#1a1a1a'),
  text_color: z.string().default('#FFFFFF'),
});

const Editor = createSimpleEditor([
  { key: 'title', label: 'Tieu de', type: 'text' },
  { key: 'subtitle', label: 'Mo ta', type: 'text' },
  { key: 'button_text', label: 'Text nut', type: 'text' },
  { key: 'bg_color', label: 'Mau nen', type: 'color' },
  { key: 'text_color', label: 'Mau chu', type: 'color' },
]);

function Renderer({ config, preview }: { config: Record<string, unknown>; preview?: boolean }) {
  return (
    <div className="py-12 px-4 text-center" style={{ backgroundColor: config.bg_color as string, color: config.text_color as string }}>
      <h2 className="text-xl font-bold mb-2">{config.title as string}</h2>
      <p className="text-sm mb-4 opacity-80">{config.subtitle as string}</p>
      <form onSubmit={(e) => e.preventDefault()} className="flex max-w-md mx-auto gap-2">
        <input type="email" placeholder="Email cua ban" className="flex-1 px-4 py-2 rounded text-black text-sm" disabled={preview} />
        <button type="submit" className="px-6 py-2 bg-red-600 text-white rounded text-sm font-medium" disabled={preview}>
          {config.button_text as string}
        </button>
      </form>
    </div>
  );
}

export const newsletterDefinition: SectionDefinition = {
  type: 'newsletter',
  label: 'Newsletter',
  icon: 'Mail',
  group: 'content',
  defaultConfig: { title: 'Dang ky nhan tin khuyen mai', subtitle: 'Nhan ngay ma giam 10% cho don hang dau tien', button_text: 'Dang ky', bg_color: '#1a1a1a', text_color: '#FFFFFF' },
  configSchema,
  EditorComponent: Editor,
  RendererComponent: Renderer,
};
