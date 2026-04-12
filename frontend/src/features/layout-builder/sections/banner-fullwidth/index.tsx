import { z } from 'zod';
import { type SectionDefinition, type SectionEditorProps, type SectionRendererProps } from '../../registry/types';
import { createSimpleEditor } from '../_shared/simple-editor';

const configSchema = z.object({
  // Mode
  display_mode: z.enum(['hero', 'slim', 'split']).default('hero'),
  // Images
  image_desktop: z.string().default(''),
  image_mobile: z.string().default(''),
  alt_text: z.string().default(''),
  // Text content
  title: z.string().default(''),
  subtitle: z.string().default(''),
  cta_text: z.string().default(''),
  cta_link: z.string().default(''),
  // Style
  text_position: z.enum(['center', 'left', 'right']).default('center'),
  text_color: z.string().default('#FFFFFF'),
  overlay_opacity: z.number().min(0).max(100).default(30),
  // Button style
  btn_style: z.enum(['filled', 'outline', 'text']).default('outline'),
  btn_color: z.string().default('#FFFFFF'),
  // Parallax
  parallax: z.boolean().default(false),
});

const Editor = createSimpleEditor([
  { key: 'display_mode', label: 'Che do hien thi', type: 'radio_cards', options: [
    { value: 'hero', label: 'Lon', icon: '▬', description: '400px cao' },
    { value: 'slim', label: 'Mong', icon: '—', description: '200px cao' },
    { value: 'split', label: 'Chia doi', icon: '◫', description: 'Text + Anh' },
  ]},
  { key: 'section_images', label: 'Hinh anh', type: 'section_header' },
  { key: 'image_desktop', label: 'Anh desktop', type: 'image', placeholder: 'URL anh desktop (1920xN)' },
  { key: 'image_mobile', label: 'Anh mobile', type: 'image', placeholder: 'URL anh mobile' },
  { key: 'section_text', label: 'Noi dung', type: 'section_header' },
  { key: 'title', label: 'Tieu de', type: 'text' },
  { key: 'subtitle', label: 'Phu de', type: 'text' },
  { key: 'text_position', label: 'Vi tri text', type: 'select', options: [
    { label: 'Giua', value: 'center' },
    { label: 'Ben trai', value: 'left' },
    { label: 'Ben phai', value: 'right' },
  ]},
  { key: 'text_color', label: 'Mau chu', type: 'color' },
  { key: 'overlay_opacity', label: 'Do toi overlay', type: 'range', min: 0, max: 100, step: 5 },
  { key: 'section_cta', label: 'Nut hanh dong', type: 'section_header' },
  { key: 'cta_text', label: 'Text CTA', type: 'text' },
  { key: 'cta_link', label: 'Link CTA', type: 'text' },
  { key: 'btn_style', label: 'Kieu nut', type: 'radio_cards', options: [
    { value: 'filled', label: 'Day', icon: '■' },
    { value: 'outline', label: 'Vien', icon: '□' },
    { value: 'text', label: 'Text', icon: 'A' },
  ]},
  { key: 'section_extra', label: 'Hieu ung', type: 'section_header' },
  { key: 'parallax', label: 'Hieu ung Parallax', type: 'toggle' },
]);

function Renderer({ config, preview }: SectionRendererProps) {
  const mode = (config.display_mode as string) || 'hero';
  const textPos = (config.text_position as string) || 'center';
  const textColor = (config.text_color as string) || '#FFFFFF';
  const overlayOpacity = ((config.overlay_opacity as number) ?? 30) / 100;
  const btnStyle = (config.btn_style as string) || 'outline';

  const textAlign = textPos === 'left' ? 'items-start text-left' :
    textPos === 'right' ? 'items-end text-right' : 'items-center text-center';

  const height = mode === 'slim' ? 'h-[150px] md:h-[200px]' : 'h-[250px] md:h-[400px]';

  const btnClass = btnStyle === 'filled'
    ? 'bg-white text-black hover:bg-gray-100'
    : btnStyle === 'text'
      ? 'underline underline-offset-4'
      : 'border-2 hover:bg-white/20';

  // Split mode
  if (mode === 'split') {
    return (
      <div className="flex flex-col md:flex-row">
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-gray-50">
          {String(config.title || '') && <h2 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900">{String(config.title)}</h2>}
          {String(config.subtitle || '') && <p className="text-sm text-gray-600 mb-4">{String(config.subtitle)}</p>}
          {String(config.cta_text || '') && (
            <a href={preview ? '#' : config.cta_link as string} onClick={preview ? (e) => e.preventDefault() : undefined}
              className="inline-block px-6 py-2.5 bg-black text-white text-sm font-medium tracking-wide hover:bg-gray-800 transition w-fit">
              {String(config.cta_text).toUpperCase()}
            </a>
          )}
        </div>
        <div className="flex-1">
          {(config.image_desktop as string) ? (
            <img src={config.image_desktop as string} alt={config.alt_text as string} className="w-full h-full object-cover min-h-[250px]" />
          ) : (
            <div className="w-full min-h-[250px] bg-gradient-to-br from-gray-200 to-gray-300" />
          )}
        </div>
      </div>
    );
  }

  // Hero / Slim mode
  return (
    <div className={`relative w-full ${height} overflow-hidden`}>
      {(config.image_desktop as string) ? (
        <img src={config.image_desktop as string} alt={config.alt_text as string} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-gray-700 to-gray-500" />
      )}
      <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }} />
      <div className={`absolute inset-0 flex flex-col justify-center ${textAlign} px-6 md:px-16`}>
        {String(config.title || '') && <h2 className="text-xl md:text-3xl font-bold mb-2 drop-shadow-lg" style={{ color: textColor }}>{String(config.title)}</h2>}
        {String(config.subtitle || '') && <p className="text-sm md:text-base mb-4 drop-shadow" style={{ color: textColor, opacity: 0.9 }}>{String(config.subtitle)}</p>}
        {String(config.cta_text || '') && (
          <a
            href={preview ? '#' : config.cta_link as string}
            onClick={preview ? (e) => e.preventDefault() : undefined}
            className={`inline-block px-6 py-2.5 text-sm font-medium tracking-wide transition w-fit ${btnClass}`}
            style={{ color: textColor, borderColor: textColor }}
          >
            {String(config.cta_text).toUpperCase()}
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
  defaultConfig: {
    display_mode: 'hero',
    image_desktop: '', image_mobile: '', alt_text: '',
    title: '', subtitle: '',
    cta_text: '', cta_link: '',
    text_position: 'center', text_color: '#FFFFFF',
    overlay_opacity: 30,
    btn_style: 'outline', btn_color: '#FFFFFF',
    parallax: false,
  },
  configSchema,
  EditorComponent: Editor as React.FC<SectionEditorProps>,
  RendererComponent: Renderer,
};
