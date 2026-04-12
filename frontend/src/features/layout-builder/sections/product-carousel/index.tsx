import { z } from 'zod';
import { type SectionDefinition, type SectionEditorProps, type SectionRendererProps } from '../../registry/types';
import { createSimpleEditor } from '../_shared/simple-editor';

const configSchema = z.object({
  title: z.string().default('Sản phẩm mới'),
  // Che do hien thi
  display_mode: z.enum(['carousel', 'grid', 'list']).default('carousel'),
  // Nguon du lieu
  source_type: z.string().default('collection'),
  source_value: z.string().default('new_arrivals'),
  category_id: z.string().nullable().default(null),
  max_products: z.number().min(4).max(24).default(12),
  // Hien thi
  show_badge: z.boolean().default(true),
  show_price: z.boolean().default(true),
  show_rating: z.boolean().default(true),
  show_quick_add: z.boolean().default(true),
  show_cta: z.boolean().default(true),
  cta_text: z.string().default('XEM TAT CA'),
  cta_link: z.string().default('/san-pham'),
  // Grid tuy chinh
  columns_desktop: z.number().min(2).max(6).default(5),
  // Autoplay
  autoplay: z.boolean().default(false),
});

const Editor = createSimpleEditor([
  { key: 'title', label: 'Tieu de', type: 'text' },
  { key: 'display_mode', label: 'Che do hien thi', type: 'radio_cards', options: [
    { value: 'carousel', label: 'Carousel', icon: '↔', description: 'Cuon ngang' },
    { value: 'grid', label: 'Luoi', icon: '▦', description: 'Grid co dinh' },
    { value: 'list', label: 'Danh sach', icon: '☰', description: 'Tung dong' },
  ]},
  { key: 'section_source', label: 'Nguon du lieu', type: 'section_header' },
  { key: 'source_value', label: 'Loai san pham', type: 'select', options: [
    { label: 'Hang moi ve', value: 'new_arrivals' },
    { label: 'Ban chay nhat', value: 'best_sellers' },
    { label: 'Dang giam gia', value: 'on_sale' },
    { label: 'Theo danh muc', value: 'by_category' },
  ]},
  { key: 'max_products', label: 'So SP toi da', type: 'range', min: 4, max: 24, step: 2 },
  { key: 'columns_desktop', label: 'So cot (Grid mode)', type: 'number', min: 2, max: 6, showWhen: { key: 'display_mode', value: 'grid' } },
  { key: 'section_display', label: 'Hien thi', type: 'section_header' },
  { key: 'show_badge', label: 'Hien badge (Sale, New)', type: 'toggle' },
  { key: 'show_price', label: 'Hien gia', type: 'toggle' },
  { key: 'show_quick_add', label: 'Nut them vao gio', type: 'toggle' },
  { key: 'autoplay', label: 'Tu dong cuon', type: 'toggle', showWhen: { key: 'display_mode', value: 'carousel' } },
  { key: 'section_cta', label: 'Nut hanh dong', type: 'section_header' },
  { key: 'show_cta', label: 'Hien nut CTA', type: 'toggle' },
  { key: 'cta_text', label: 'Text CTA', type: 'text', showWhen: { key: 'show_cta', value: true } },
  { key: 'cta_link', label: 'Link CTA', type: 'text', showWhen: { key: 'show_cta', value: true } },
]);

/** Placeholder product card — giong storefront ProductCard */
function PlaceholderProductCard({ compact }: { compact?: boolean }) {
  const price = Math.floor(Math.random() * 400 + 150) * 1000;
  const oldPrice = Math.floor(price * 1.3);
  const hasDiscount = Math.random() > 0.5;
  return (
    <div className={compact ? 'flex gap-3 p-2 border rounded-lg' : ''}>
      <div className={`${compact ? 'w-20 h-20 shrink-0' : 'aspect-[4/5] w-full'} bg-gray-100 rounded-lg relative overflow-hidden`}>
        {/* Placeholder image */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-300">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
          </svg>
        </div>
        {hasDiscount && (
          <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">-30%</div>
        )}
      </div>
      <div className={compact ? 'flex-1 py-1' : 'mt-2 px-0.5'}>
        <p className="text-xs text-gray-700 line-clamp-2 mb-1">Ao thun nam co tron basic</p>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-red-600">{price.toLocaleString('vi-VN')}d</span>
          {hasDiscount && <span className="text-[10px] text-gray-400 line-through">{oldPrice.toLocaleString('vi-VN')}d</span>}
        </div>
        {!compact && (
          <p className="text-[10px] text-gray-400 mt-1">+3 Mau sac</p>
        )}
      </div>
    </div>
  );
}

function Renderer({ config }: SectionRendererProps) {
  const title = config.title as string;
  const mode = (config.display_mode as string) || 'carousel';
  const maxProducts = (config.max_products as number) || 12;
  const showCta = config.show_cta !== false;
  const ctaText = (config.cta_text as string) || 'XEM TAT CA';
  const cols = (config.columns_desktop as number) || 5;

  const displayCount = mode === 'carousel' ? Math.min(5, maxProducts) : Math.min(cols * 2, maxProducts);

  // List mode
  if (mode === 'list') {
    return (
      <div className="py-8 px-4">
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold tracking-wide">{title}</h2>
            {showCta && <span className="text-xs text-orange-500 font-medium cursor-pointer">{ctaText} →</span>}
          </div>
        )}
        <div className="space-y-2">
          {Array.from({ length: Math.min(4, displayCount) }).map((_, i) => (
            <PlaceholderProductCard key={i} compact />
          ))}
        </div>
      </div>
    );
  }

  // Grid mode
  if (mode === 'grid') {
    return (
      <div className="py-8 px-4">
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold tracking-wide">{title}</h2>
            {showCta && <span className="text-xs text-orange-500 font-medium cursor-pointer">{ctaText} →</span>}
          </div>
        )}
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: displayCount }).map((_, i) => (
            <PlaceholderProductCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Carousel mode (default) — giong storefront SaleCarousel
  return (
    <div className="py-8">
      {title && (
        <div className="flex items-center justify-between mb-4 px-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full" />
            <h2 className="text-lg font-bold tracking-wide">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 border rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600">‹</button>
            <button className="w-8 h-8 border rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600">›</button>
          </div>
        </div>
      )}
      <div className="flex gap-3 overflow-x-auto px-4 pb-2">
        {Array.from({ length: displayCount }).map((_, i) => (
          <div key={i} className="shrink-0 w-40 md:w-48">
            <PlaceholderProductCard />
          </div>
        ))}
      </div>
      {showCta && (
        <div className="text-center mt-4 px-4">
          <button className="px-6 py-2 border border-gray-800 text-gray-800 text-xs font-medium tracking-wide hover:bg-gray-800 hover:text-white transition">
            {ctaText}
          </button>
        </div>
      )}
    </div>
  );
}

export const productCarouselDefinition: SectionDefinition = {
  type: 'product_carousel',
  label: 'Carousel sản phẩm',
  icon: 'ShoppingBag',
  group: 'product',
  defaultConfig: {
    title: 'Sản phẩm mới',
    display_mode: 'carousel',
    source_type: 'collection',
    source_value: 'new_arrivals',
    category_id: null,
    max_products: 12,
    show_badge: true,
    show_price: true,
    show_rating: true,
    show_quick_add: true,
    show_cta: true,
    cta_text: 'XEM TAT CA',
    cta_link: '/san-pham',
    columns_desktop: 5,
    autoplay: false,
  },
  configSchema,
  EditorComponent: Editor as React.FC<SectionEditorProps>,
  RendererComponent: Renderer,
};
