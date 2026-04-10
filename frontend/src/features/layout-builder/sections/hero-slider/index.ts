import { z } from 'zod';
import { type SectionDefinition } from '../../registry/types';
import { HeroSliderEditor } from './editor';
import { HeroSliderRenderer } from './renderer';

const configSchema = z.object({
  slides: z.array(z.object({
    image_desktop: z.string(),
    image_mobile: z.string(),
    title: z.string(),
    subtitle: z.string(),
    cta_text: z.string(),
    cta_link: z.string(),
    text_position: z.string().default('center'),
    text_color: z.string().default('#FFFFFF'),
  })).max(5),
  autoplay: z.boolean().default(true),
  autoplay_speed: z.number().default(5000),
  show_dots: z.boolean().default(true),
  show_arrows: z.boolean().default(true),
});

export const heroSliderDefinition: SectionDefinition = {
  type: 'hero_slider',
  label: 'Hero Slider',
  icon: 'Image',
  group: 'media',
  maxInstances: 1,
  defaultConfig: {
    slides: [{ image_desktop: '', image_mobile: '', title: 'Bo suu tap moi', subtitle: '', cta_text: 'Mua ngay', cta_link: '/san-pham', text_position: 'center', text_color: '#FFFFFF' }],
    autoplay: true,
    autoplay_speed: 5000,
    show_dots: true,
    show_arrows: true,
  },
  configSchema,
  EditorComponent: HeroSliderEditor,
  RendererComponent: HeroSliderRenderer,
};
