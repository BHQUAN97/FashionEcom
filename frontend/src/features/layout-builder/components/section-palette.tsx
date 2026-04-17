'use client';

import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { ChevronUp, Image, Type, SlidersHorizontal, Grid3X3, ShoppingBag, Layers, PlayCircle, Flame, Star, Layout, Columns, BookOpen, Code, Minus, Space, Mail } from 'lucide-react';
import { getAllSectionDefinitions } from '../registry';
import { type SectionDefinition } from '../registry/types';
import { useLayoutStore } from '../stores/layout-store';

/**
 * Map section type -> Lucide icon component
 * Hien thi thumbnail icon trong palette
 */
const SECTION_ICONS: Record<string, React.ElementType> = {
  hero_slider: SlidersHorizontal,
  announcement_bar: Type,
  category_grid: Grid3X3,
  product_carousel: ShoppingBag,
  featured_products_tab: Star,
  lookbook: BookOpen,
  banner_fullwidth: Image,
  banner_columns: Columns,
  trust_bar: Layers,
  text_image: Layout,
  video: PlayCircle,
  newsletter: Mail,
  flash_sale_countdown: Flame,
  spacer: Space,
  divider: Minus,
  custom_html: Code,
};

/**
 * Nhom section kieu Shopee:
 * - Hinh anh & Van ban
 * - San pham & Nganh hang
 * - Khuyen mai & Tien ich
 */
const PALETTE_GROUPS = [
  {
    key: 'media-content',
    label: 'Hình ảnh và Văn bản',
    types: ['hero_slider', 'banner_fullwidth', 'banner_columns', 'lookbook', 'video', 'text_image', 'announcement_bar', 'custom_html'],
  },
  {
    key: 'product',
    label: 'Sản phẩm và Ngành hàng',
    types: ['product_carousel', 'featured_products_tab', 'category_grid'],
  },
  {
    key: 'promo-utility',
    label: 'Khuyến mãi & Tiện ích',
    types: ['flash_sale_countdown', 'trust_bar', 'newsletter', 'spacer', 'divider'],
  },
];

/**
 * Palette item — card thumbnail voi icon + ten + so luong da dung
 */
function PaletteItem({ definition }: { definition: SectionDefinition }) {
  const sections = useLayoutStore(s => s.sections);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${definition.type}`,
    data: { type: 'palette', sectionType: definition.type },
  });

  const Icon = SECTION_ICONS[definition.type] || Image;
  const usedCount = sections.filter(s => s.type === definition.type).length;
  const maxReached = definition.maxInstances ? usedCount >= definition.maxInstances : false;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex flex-col items-center gap-1.5 p-2 border rounded-lg text-center transition select-none ${
        isDragging ? 'opacity-40 scale-95' : ''
      } ${maxReached ? 'opacity-40 cursor-not-allowed' : 'cursor-grab hover:bg-gray-50 hover:border-gray-400'}`}
    >
      {/* Thumbnail icon */}
      <div className="w-full aspect-[4/3] bg-gray-50 rounded flex items-center justify-center border border-dashed border-gray-200">
        <Icon className="w-6 h-6 text-gray-400" />
      </div>
      {/* Label + count */}
      <span className="text-[11px] leading-tight text-gray-600 line-clamp-2">{definition.label}</span>
      {definition.maxInstances && (
        <span className="text-[10px] text-gray-400">{usedCount}/{definition.maxInstances}</span>
      )}
    </div>
  );
}

/**
 * Section Palette — sidebar Shopee style
 * Grid 2 cot, grouped, collapsible
 */
export function SectionPalette() {
  const allDefinitions = getAllSectionDefinitions();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleGroup = (key: string) => {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Tìm kiếm"
          className="w-full text-sm border rounded-md px-3 py-1.5 pr-8 focus:outline-none focus:border-gray-400"
          disabled
        />
        <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {PALETTE_GROUPS.map(group => {
        const definitions = group.types
          .map(t => allDefinitions.find(d => d.type === t))
          .filter(Boolean) as SectionDefinition[];

        if (definitions.length === 0) return null;

        const isCollapsed = collapsed[group.key];

        return (
          <div key={group.key}>
            {/* Group header — collapsible */}
            <button
              onClick={() => toggleGroup(group.key)}
              className="flex items-center justify-between w-full text-sm font-medium text-gray-800 mb-2"
            >
              <span>{group.label}</span>
              <ChevronUp className={`w-4 h-4 text-gray-400 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>

            {!isCollapsed && (
              <div className="grid grid-cols-2 gap-2">
                {definitions.map(def => (
                  <PaletteItem key={def.type} definition={def} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
