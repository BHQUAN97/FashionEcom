import { z } from 'zod';
import { type SectionDefinition } from '../../registry/types';
import { HeroSliderEditor } from './editor';
import { HeroSliderRenderer } from './renderer';

const configSchema = z.object({
  // Che do hien thi
  display_mode: z.enum(['fullwidth', 'contained', 'split']).default('fullwidth'),
  slides: z.array(z.object({
    image_desktop: z.string(),
    image_mobile: z.string(),
    title: z.string(),
    subtitle: z.string(),
    cta_text: z.string(),
    cta_link: z.string(),
    text_position: z.enum(['center', 'left', 'right']).default('center'),
    text_color: z.string().default('#FFFFFF'),
  })).max(5),
  // Tuy chinh hieu ung
  autoplay: z.boolean().default(true),
  autoplay_speed: z.number().min(2000).max(10000).default(5000),
  show_dots: z.boolean().default(true),
  show_arrows: z.boolean().default(true),
  // Overlay
  overlay_color: z.string().default('#000000'),
  overlay_opacity: z.number().min(0).max(100).default(30),
  // Chieu cao
  height_desktop: z.number().default(500),
  height_mobile: z.number().default(300),
});

export const heroSliderDefinition: SectionDefinition = {
  type: 'hero_slider',
  label: 'Hero Slider',
  icon: 'Image',
  group: 'media',
  maxInstances: 1,
  defaultConfig: {
    display_mode: 'fullwidth',
    slides: [{
      image_desktop: '', image_mobile: '',
      title: 'Bo suu tap moi', subtitle: 'Kham pha phong cach thoi trang moi nhat',
      cta_text: 'Mua ngay', cta_link: '/san-pham',
      text_position: 'center', text_color: '#FFFFFF',
    }],
    autoplay: true,
    autoplay_speed: 5000,
    show_dots: true,
    show_arrows: true,
    overlay_color: '#000000',
    overlay_opacity: 30,
    height_desktop: 500,
    height_mobile: 300,
  },
  configSchema,
  EditorComponent: HeroSliderEditor,
  RendererComponent: HeroSliderRenderer,
};
