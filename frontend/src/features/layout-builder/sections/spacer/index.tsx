import { z } from 'zod';
import { type SectionDefinition } from '../../registry/types';
import { createSimpleEditor } from '../_shared/simple-editor';

const configSchema = z.object({ height: z.number().default(40) });

const Editor = createSimpleEditor([{ key: 'height', label: 'Chieu cao (px)', type: 'number' }]);

function Renderer({ config }: { config: Record<string, unknown> }) {
  return <div style={{ height: `${config.height || 40}px` }} />;
}

export const spacerDefinition: SectionDefinition = {
  type: 'spacer',
  label: 'Khoang trong',
  icon: 'Maximize2',
  group: 'utility',
  defaultConfig: { height: 40 },
  configSchema,
  EditorComponent: Editor,
  RendererComponent: Renderer,
};
