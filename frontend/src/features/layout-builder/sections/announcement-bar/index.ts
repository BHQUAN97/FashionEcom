import { z } from 'zod';
import { type SectionDefinition } from '../../registry/types';
import { AnnouncementBarEditor } from './editor';
import { AnnouncementBarRenderer } from './renderer';

const configSchema = z.object({
  messages: z.array(z.object({ text: z.string(), link: z.string() })),
  bg_color: z.string().default('#D0021B'),
  text_color: z.string().default('#FFFFFF'),
  auto_scroll: z.boolean().default(true),
  scroll_speed: z.number().default(3000),
  dismissible: z.boolean().default(true),
});

export const announcementBarDefinition: SectionDefinition = {
  type: 'announcement_bar',
  label: 'Thanh thong bao',
  icon: 'Bell',
  group: 'utility',
  maxInstances: 1,
  defaultConfig: {
    messages: [{ text: 'FREESHIP don tu 500K', link: '' }],
    bg_color: '#D0021B',
    text_color: '#FFFFFF',
    auto_scroll: true,
    scroll_speed: 3000,
    dismissible: true,
  },
  configSchema,
  EditorComponent: AnnouncementBarEditor,
  RendererComponent: AnnouncementBarRenderer,
};
