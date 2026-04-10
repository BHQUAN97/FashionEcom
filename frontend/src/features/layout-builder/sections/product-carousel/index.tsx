import { z } from 'zod';
import { type SectionDefinition } from '../../registry/types';
import { createSimpleEditor } from '../_shared/simple-editor';

const configSchema = z.object({
  title: z.string().default('San pham moi'),
  source_type: z.string().default('collection'),
  source_value: z.string().default('new_arrivals'),
  category_id: z.string().nullable().default(null),
  max_products: z.number().default(12),
  show_badge: z.boolean().default(true),
  show_price: z.boolean().default(true),
  show_rating: z.boolean().default(true),
  autoplay: z.boolean().default(false),
});

const Editor = createSimpleEditor([
  { key: 'title', label: 'Tieu de', type: 'text' },
  { key: 'source_type', label: 'Nguon du lieu', type: 'select', options: [
    { label: 'Hang moi', value: 'new_arrivals' },
    { label: 'Ban chay', value: 'best_sellers' },
    { label: 'Giam gia', value: 'on_sale' },
  ]},
  { key: 'max_products', label: 'So SP toi da', type: 'number' },
  { key: 'show_badge', label: 'Hien badge', type: 'checkbox' },
  { key: 'show_price', label: 'Hien gia', type: 'checkbox' },
  { key: 'show_rating', label: 'Hien rating', type: 'checkbox' },
]);

function Renderer({ config }: { config: Record<string, unknown>; preview?: boolean }) {
  const title = config.title as string;
  return (
    <div className="py-8 px-4">
      {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="shrink-0 w-48">
            <div className="bg-gray-100 aspect-square rounded-lg mb-2" />
            <div className="h-3 bg-gray-100 rounded w-3/4 mb-1" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export const productCarouselDefinition: SectionDefinition = {
  type: 'product_carousel',
  label: 'Carousel san pham',
  icon: 'ShoppingBag',
  group: 'product',
  defaultConfig: { title: 'San pham moi', source_type: 'collection', source_value: 'new_arrivals', category_id: null, max_products: 12, show_badge: true, show_price: true, show_rating: true, autoplay: false },
  configSchema,
  EditorComponent: Editor,
  RendererComponent: Renderer,
};
