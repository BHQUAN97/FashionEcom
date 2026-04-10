import { z } from 'zod';
import { type SectionDefinition } from '../../registry/types';
import { createSimpleEditor } from '../_shared/simple-editor';

const configSchema = z.object({
  url: z.string().default(''),
  thumbnail: z.string().default(''),
  autoplay: z.boolean().default(false),
  title: z.string().default(''),
});

const Editor = createSimpleEditor([
  { key: 'title', label: 'Tieu de', type: 'text' },
  { key: 'url', label: 'URL video (YouTube/Vimeo)', type: 'text' },
  { key: 'thumbnail', label: 'Anh thumbnail', type: 'text' },
  { key: 'autoplay', label: 'Tu dong phat', type: 'checkbox' },
]);

function Renderer({ config }: { config: Record<string, unknown>; preview?: boolean }) {
  return (
    <div className="py-8 px-4 max-w-4xl mx-auto">
      {String(config.title || '') && <h2 className="text-xl font-bold mb-4 text-center">{String(config.title)}</h2>}
      <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
        {config.url ? (
          <iframe src={config.url as string} className="w-full h-full" allowFullScreen />
        ) : (
          <span className="text-gray-400">Chua co video</span>
        )}
      </div>
    </div>
  );
}

export const videoDefinition: SectionDefinition = {
  type: 'video',
  label: 'Video',
  icon: 'Play',
  group: 'media',
  defaultConfig: { url: '', thumbnail: '', autoplay: false, title: '' },
  configSchema,
  EditorComponent: Editor,
  RendererComponent: Renderer,
};
