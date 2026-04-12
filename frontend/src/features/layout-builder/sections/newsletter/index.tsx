import { z } from 'zod';
import { type SectionDefinition, type SectionEditorProps, type SectionRendererProps } from '../../registry/types';
import { createSimpleEditor } from '../_shared/simple-editor';

const configSchema = z.object({
  // Mode
  display_mode: z.enum(['full', 'inline', 'minimal']).default('full'),
  // Content
  title: z.string().default('Đăng ký nhận tin khuyến mãi'),
  subtitle: z.string().default('Nhan ngay ma giam 10% cho don hang dau tien'),
  button_text: z.string().default('Đăng ký'),
  placeholder: z.string().default('Nhap email cua ban'),
  // Style
  bg_color: z.string().default('#1a1a1a'),
  text_color: z.string().default('#FFFFFF'),
  btn_color: z.string().default('#D0021B'),
  // Layout
  input_style: z.enum(['rounded', 'square', 'pill']).default('rounded'),
});

const Editor = createSimpleEditor([
  { key: 'display_mode', label: 'Che do hien thi', type: 'radio_cards', options: [
    { value: 'full', label: 'Day du', icon: '▭', description: 'Nen + text + form' },
    { value: 'inline', label: 'Ngang', icon: '—', description: 'Text va form 1 dong' },
    { value: 'minimal', label: 'Toi gian', icon: '▫', description: 'Chi form' },
  ]},
  { key: 'section_content', label: 'Noi dung', type: 'section_header' },
  { key: 'title', label: 'Tieu de', type: 'text' },
  { key: 'subtitle', label: 'Mo ta', type: 'text' },
  { key: 'button_text', label: 'Text nut', type: 'text' },
  { key: 'placeholder', label: 'Placeholder email', type: 'text' },
  { key: 'section_style', label: 'Giao dien', type: 'section_header' },
  { key: 'input_style', label: 'Kieu input', type: 'radio_cards', options: [
    { value: 'rounded', label: 'Bo tron', icon: '◻' },
    { value: 'square', label: 'Vuong', icon: '▭' },
    { value: 'pill', label: 'Tron lon', icon: '◖' },
  ]},
  { key: 'bg_color', label: 'Mau nen', type: 'color' },
  { key: 'text_color', label: 'Mau chu', type: 'color' },
  { key: 'btn_color', label: 'Mau nut', type: 'color' },
]);

function Renderer({ config, preview }: SectionRendererProps) {
  const mode = (config.display_mode as string) || 'full';
  const bgColor = (config.bg_color as string) || '#1a1a1a';
  const textColor = (config.text_color as string) || '#FFFFFF';
  const btnColor = (config.btn_color as string) || '#D0021B';
  const inputStyle = (config.input_style as string) || 'rounded';

  const inputRadius = inputStyle === 'pill' ? 'rounded-full' : inputStyle === 'square' ? 'rounded-none' : 'rounded-md';
  const btnRadius = inputStyle === 'pill' ? 'rounded-full' : inputStyle === 'square' ? 'rounded-none' : 'rounded-md';

  // Minimal mode — chi form
  if (mode === 'minimal') {
    return (
      <div className="py-6 px-4">
        <form onSubmit={(e) => e.preventDefault()} className="flex max-w-md mx-auto gap-2">
          <input
            type="email"
            placeholder={(config.placeholder as string) || 'Email'}
            className={`flex-1 px-4 py-2.5 text-sm border border-gray-300 ${inputRadius} focus:outline-none focus:ring-1 focus:ring-orange-400`}
            disabled={preview}
          />
          <button type="submit" className={`px-6 py-2.5 text-white text-sm font-medium ${btnRadius}`} style={{ backgroundColor: btnColor }} disabled={preview}>
            {(config.button_text as string) || 'Đăng ký'}
          </button>
        </form>
      </div>
    );
  }

  // Inline mode — 1 dong ngang
  if (mode === 'inline') {
    return (
      <div className="py-6 px-4" style={{ backgroundColor: bgColor }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
          <div>
            <h3 className="font-bold text-sm" style={{ color: textColor }}>{config.title as string}</h3>
            {String(config.subtitle || '') && <p className="text-xs opacity-70 mt-0.5" style={{ color: textColor }}>{config.subtitle as string}</p>}
          </div>
          <form onSubmit={(e) => e.preventDefault()} className="flex gap-2 shrink-0">
            <input
              type="email"
              placeholder={(config.placeholder as string) || 'Email'}
              className={`px-4 py-2 text-sm w-56 ${inputRadius}`}
              disabled={preview}
            />
            <button type="submit" className={`px-5 py-2 text-white text-sm font-medium ${btnRadius}`} style={{ backgroundColor: btnColor }} disabled={preview}>
              {(config.button_text as string) || 'Đăng ký'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Full mode (default) — giong storefront NewsletterSignup
  return (
    <div className="py-12 px-4 text-center" style={{ backgroundColor: bgColor, color: textColor }}>
      <h2 className="text-xl font-bold mb-2">{config.title as string}</h2>
      <p className="text-sm mb-5 opacity-80 max-w-md mx-auto">{config.subtitle as string}</p>
      <form onSubmit={(e) => e.preventDefault()} className="flex max-w-md mx-auto gap-2">
        <input
          type="email"
          placeholder={(config.placeholder as string) || 'Email'}
          className={`flex-1 px-4 py-3 text-black text-sm ${inputRadius}`}
          disabled={preview}
        />
        <button type="submit" className={`px-6 py-3 text-white text-sm font-medium tracking-wide ${btnRadius}`} style={{ backgroundColor: btnColor }} disabled={preview}>
          {(config.button_text as string) || 'Đăng ký'}
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
  defaultConfig: {
    display_mode: 'full',
    title: 'Đăng ký nhận tin khuyến mãi',
    subtitle: 'Nhan ngay ma giam 10% cho don hang dau tien',
    button_text: 'Đăng ký',
    placeholder: 'Nhap email cua ban',
    bg_color: '#1a1a1a',
    text_color: '#FFFFFF',
    btn_color: '#D0021B',
    input_style: 'rounded',
  },
  configSchema,
  EditorComponent: Editor as React.FC<SectionEditorProps>,
  RendererComponent: Renderer,
};
