import { type ZodSchema } from 'zod';
import { type FC } from 'react';

/**
 * Dinh nghia 1 section type trong Layout Builder
 * Moi section dang ky 1 SectionDefinition vao registry
 */
export interface SectionDefinition {
  /** Unique key, vd: 'hero_slider' */
  type: string;
  /** Hien thi trong palette */
  label: string;
  /** Lucide icon name */
  icon: string;
  /** Nhom trong palette */
  group: 'content' | 'media' | 'product' | 'utility';
  /** Config mac dinh khi tao moi */
  defaultConfig: Record<string, unknown>;
  /** Zod schema validate config */
  configSchema: ZodSchema;
  /** Component editor (panel cai dat ben phai) */
  EditorComponent: FC<SectionEditorProps>;
  /** Component renderer (preview + storefront) */
  RendererComponent: FC<SectionRendererProps>;
  /** Gioi han so section loai nay tren 1 trang */
  maxInstances?: number;
}

export interface SectionEditorProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export interface SectionRendererProps {
  config: Record<string, unknown>;
  /** true khi dang preview trong admin (disable links, forms) */
  preview?: boolean;
}

/**
 * 1 section instance trong layout
 */
export interface LayoutSection {
  id: string;
  type: string;
  config: Record<string, unknown>;
  sort: number;
  visible: number;
}
