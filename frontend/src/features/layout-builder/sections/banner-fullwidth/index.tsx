import { z } from 'zod';
import { type SectionDefinition } from '../../registry/types';
import { createSimpleEditor } from '../_shared/simple-editor';

const configSchema = z.object({
  image_desktop: z.string().default(''),
  image_mobile: z.string().default(''),
  alt_text: z.string().default(''),
  title: z.string().default(''),
  subtitle: z.string().default(''),
  cta_text: z.string().default(''),
  cta_link: z.string().default(''),
  text_position: z.string().default('center'),
  text_color: z.string().default('#FFFFFF'),
  overlay_opacity: z.number().default(0.3),
  parallax: z.boolean().default(false),
});

const Editor = createSimpleEditor([
  { key: 'image_desktop', label: 'Anh desktop', type: 'text', placeholder: 'URL anh desktop' },
  { key: 'image_mobile', label: 'Anh mobile', type: 'text', placeholder: 'URL anh mobile' },
  { key: 'title', label: 'Tieu de', type: 'text' },
  { key: 'subtitle', label: 'Phu de', type: 'text' },
  { key: 'cta_text', label: 'Text CTA', type: 'text' },
  { key: 'cta_link', label: 'Link CTA', type: 'text' },
  { key: 'text_color', label: 'Mau chu', type: 'color' },
  { key: 'parallax', label: 'Parallax', type: 'checkbox' },
]);

function Renderer({ config, preview }: { config: Record<string, unknown>; preview?: boolean }) {
  return (
    <div className="relative w-full h-[250px] md:h-[400px] bg-gray-200 overflow-hidden">
      {(config.image_desktop as string) ? (
        <img src={config.image_desktop as string} alt={config.alt_text as string} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-gray-700 to-gray-500" />
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4" style={{ backgroundColor: `rgba(0,0,0,${config.overlay_opacity || 0.3})` }}>
        {String(config.title || '') && <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: config.text_color as string }}>{String(config.title)}</h2>}
        {String(config.subtitle || '') && <p className="text-sm md:text-lg mb-3" style={{ color: config.text_color as string }}>{String(config.subtitle)}</p>}
        {String(config.cta_text || '') && (
          <a href={preview ? '#' : config.cta_link as string} onClick={preview ? (e) => e.preventDefault() : undefined} className="px-6 py-2 border border-white text-white rounded hover:bg-white hover:text-black transition">
            {config.cta_text as string}
          </a>
        )}
      </div>
    </div>
  );
}

export const bannerFullwidthDefinition: SectionDefinition = {
  type: 'banner_fullwidth',
  label: 'Banner toan trang',
  icon: 'Image',
  group: 'media',
  defaultConfig: { image_desktop: '', image_mobile: '', alt_text: '', title: '', subtitle: '', cta_text: '', cta_link: '', text_position: 'center', text_color: '#FFFFFF', overlay_opacity: 0.3, parallax: false },
  configSchema,
  EditorComponent: Editor,
  RendererComponent: Renderer,
};
