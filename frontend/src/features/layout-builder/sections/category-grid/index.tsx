import { z } from 'zod';
import { type SectionDefinition, type SectionEditorProps, type SectionRendererProps } from '../../registry/types';
import { createSimpleEditor } from '../_shared/simple-editor';

const configSchema = z.object({
  title: z.string().default('Danh mục nổi bật'),
  // Che do hien thi
  display_mode: z.enum(['grid', 'scroll', 'circle']).default('grid'),
  // Tuy chinh grid
  columns_desktop: z.number().min(2).max(6).default(4),
  columns_mobile: z.number().min(2).max(3).default(2),
  // Hien thi
  show_image: z.boolean().default(true),
  show_count: z.boolean().default(true),
  show_arrow: z.boolean().default(true),
  // Card style
  card_style: z.enum(['overlay', 'below', 'minimal']).default('overlay'),
  // Danh muc IDs
  categories: z.array(z.string()).default([]),
  // So luong placeholder
  item_count: z.number().min(2).max(12).default(4),
});

const Editor = createSimpleEditor([
  { key: 'title', label: 'Tiêu đề', type: 'text' },
  { key: 'display_mode', label: 'Chế độ hiển thị', type: 'radio_cards', options: [
    { value: 'grid', label: 'Lưới', icon: '▦', description: 'Grid cố định' },
    { value: 'scroll', label: 'Cuộn ngang', icon: '↔', description: 'Carousel' },
    { value: 'circle', label: 'Tròn', icon: '◉', description: 'Icon tròn' },
  ]},
  { key: 'card_style', label: 'Kiểu thẻ', type: 'radio_cards', options: [
    { value: 'overlay', label: 'Overlay', icon: '▮', description: 'Text trên ảnh' },
    { value: 'below', label: 'Bên dưới', icon: '▯', description: 'Text dưới ảnh' },
    { value: 'minimal', label: 'Tối giản', icon: '▫', description: 'Chỉ text' },
  ]},
  { key: 'section_grid', label: 'Tùy chỉnh lưới', type: 'section_header' },
  { key: 'columns_desktop', label: 'Số cột desktop', type: 'number', min: 2, max: 6 },
  { key: 'columns_mobile', label: 'Số cột mobile', type: 'number', min: 2, max: 3 },
  { key: 'item_count', label: 'Số danh mục hiển thị', type: 'number', min: 2, max: 12 },
  { key: 'section_display', label: 'Hiển thị', type: 'section_header' },
  { key: 'show_image', label: 'Hiện ảnh', type: 'toggle' },
  { key: 'show_count', label: 'Hiện số sản phẩm', type: 'toggle' },
  { key: 'show_arrow', label: 'Hiện mũi tên', type: 'toggle' },
]);

/** Placeholder category names */
const PLACEHOLDER_NAMES = ['Áo Polo', 'Áo Thun', 'Quần Short', 'Quần Âu', 'Áo Khoác', 'Phụ Kiện', 'Giày Dép', 'Áo Sơ Mi', 'Quần Jeans', 'Áo Vest', 'Túi Xách', 'Nón Mũ'];

function Renderer({ config }: SectionRendererProps) {
  const title = config.title as string;
  const mode = (config.display_mode as string) || 'grid';
  const cardStyle = (config.card_style as string) || 'overlay';
  const cols = (config.columns_desktop as number) || 4;
  const colsMobile = (config.columns_mobile as number) || 2;
  const count = (config.item_count as number) || 4;
  const showImage = config.show_image !== false;
  const showCount = config.show_count !== false;

  const items = Array.from({ length: count }, (_, i) => ({
    name: PLACEHOLDER_NAMES[i] || `Danh mục ${i + 1}`,
    count: Math.floor(Math.random() * 50) + 10,
  }));

  // Circle mode — danh muc dang tron
  if (mode === 'circle') {
    return (
      <div className="py-8 px-4">
        {title && <h2 className="text-lg font-bold mb-5 text-center tracking-wide uppercase">{title}</h2>}
        <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${colsMobile}, 1fr)` }}>
          {items.map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              {showImage && (
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-gray-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <span className="text-xs font-medium text-gray-700 text-center">{item.name}</span>
              {showCount && <span className="text-[10px] text-gray-400">{item.count} SP</span>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Scroll mode — carousel ngang
  if (mode === 'scroll') {
    return (
      <div className="py-8">
        {title && <h2 className="text-lg font-bold mb-5 text-center tracking-wide uppercase px-4">{title}</h2>}
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
          {items.map((item, i) => (
            <div key={i} className="shrink-0 w-32 md:w-40">
              {showImage && (
                <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-2 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  {cardStyle === 'overlay' && (
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-xs font-medium">{item.name}</p>
                    </div>
                  )}
                </div>
              )}
              {cardStyle !== 'overlay' && <p className="text-xs font-medium text-gray-700 mt-1">{item.name}</p>}
              {showCount && <p className="text-[10px] text-gray-400">{item.count} sản phẩm</p>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Grid mode (default) — giong storefront CategoryGrid
  return (
    <div className="py-8 px-4">
      {title && <h2 className="text-lg font-bold mb-5 text-center tracking-wide uppercase">{title}</h2>}
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {items.map((item, i) => (
          <div key={i} className="group cursor-pointer">
            {showImage && cardStyle !== 'minimal' && (
              <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                {/* Placeholder image icon */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                {cardStyle === 'overlay' && (
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-medium text-sm">{item.name}</p>
                    {showCount && <p className="text-white/70 text-xs">{item.count} sản phẩm</p>}
                  </div>
                )}
              </div>
            )}
            {(cardStyle === 'below' || cardStyle === 'minimal') && (
              <div className={cardStyle === 'minimal' ? 'py-4 text-center border rounded-lg' : 'mt-2'}>
                <p className="text-sm font-medium text-gray-800">{item.name}</p>
                {showCount && <p className="text-xs text-gray-400">{item.count} sản phẩm</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export const categoryGridDefinition: SectionDefinition = {
  type: 'category_grid',
  label: 'Lưới danh mục',
  icon: 'LayoutGrid',
  group: 'product',
  defaultConfig: {
    title: 'Danh mục nổi bật',
    display_mode: 'grid',
    columns_desktop: 4,
    columns_mobile: 2,
    show_image: true,
    show_count: true,
    show_arrow: true,
    card_style: 'overlay',
    categories: [],
    item_count: 4,
  },
  configSchema,
  EditorComponent: Editor as React.FC<SectionEditorProps>,
  RendererComponent: Renderer,
};
