import { z } from 'zod';
import { type SectionDefinition } from '../../registry/types';
import { createSimpleEditor } from '../_shared/simple-editor';

const configSchema = z.object({
  color: z.string().default('#E5E7EB'),
  thickness: z.number().default(1),
  width: z.string().default('100%'),
});

const Editor = createSimpleEditor([
  { key: 'color', label: 'Mau', type: 'color' },
  { key: 'thickness', label: 'Do day (px)', type: 'number' },
]);

function Renderer({ config }: { config: Record<string, unknown> }) {
  return (
    <div className="px-4 py-2">
      <hr style={{ borderColor: config.color as string, borderWidth: `${config.thickness || 1}px` }} />
    </div>
  );
}

export const dividerDefinition: SectionDefinition = {
  type: 'divider',
  label: 'Duong ke',
  icon: 'Minus',
  group: 'utility',
  defaultConfig: { color: '#E5E7EB', thickness: 1, width: '100%' },
  configSchema,
  EditorComponent: Editor,
  RendererComponent: Renderer,
};
