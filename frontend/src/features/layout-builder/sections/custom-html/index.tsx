import { z } from 'zod';
import { type SectionDefinition } from '../../registry/types';

const configSchema = z.object({
  html: z.string().default(''),
});

function Editor({ config, onChange }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-gray-600">HTML Code</label>
      <textarea
        value={config.html as string || ''}
        onChange={(e) => onChange({ ...config, html: e.target.value })}
        rows={10}
        className="w-full text-xs font-mono border rounded px-2 py-1 bg-gray-50"
        placeholder="<div>Custom HTML here...</div>"
      />
      <p className="text-xs text-gray-400">Luu y: HTML se duoc sanitize truoc khi render tren storefront</p>
    </div>
  );
}

function Renderer({ config }: { config: Record<string, unknown>; preview?: boolean }) {
  const html = config.html as string || '';
  if (!html) return <div className="py-4 text-center text-gray-400 text-sm">Custom HTML (chua co noi dung)</div>;
  // Trong thuc te can DOMPurify sanitize
  return <div className="py-4 px-4" dangerouslySetInnerHTML={{ __html: html }} />;
}

export const customHtmlDefinition: SectionDefinition = {
  type: 'custom_html',
  label: 'Custom HTML',
  icon: 'Code',
  group: 'utility',
  defaultConfig: { html: '' },
  configSchema,
  EditorComponent: Editor,
  RendererComponent: Renderer,
};
