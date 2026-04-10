'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

export interface FilterState {
  categories: string[];
  colors: string[];
  sizes: string[];
  priceRange: [number, number] | null;
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  className?: string;
}

const MOCK_FILTER_CATEGORIES = [
  { id: 'ao-polo', name: 'Ao Polo', count: 45 },
  { id: 'ao-so-mi', name: 'Ao So Mi', count: 32 },
  { id: 'quan-tay', name: 'Quan Tay', count: 28 },
  { id: 'quan-jeans', name: 'Quan Jeans', count: 36 },
];

const MOCK_FILTER_COLORS = [
  { id: 'den', name: 'Den', hex: '#1a1a1a' },
  { id: 'trang', name: 'Trang', hex: '#ffffff' },
  { id: 'xanh', name: 'Xanh Navy', hex: '#1e3a5f' },
  { id: 'nau', name: 'Nau', hex: '#8b4513' },
  { id: 'xam', name: 'Xam', hex: '#6b7280' },
];

const MOCK_FILTER_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const PRICE_RANGES: { label: string; value: [number, number] }[] = [
  { label: 'Duoi 300.000d', value: [0, 300000] },
  { label: '300.000 - 500.000d', value: [300000, 500000] },
  { label: '500.000 - 1.000.000d', value: [500000, 1000000] },
  { label: 'Tren 1.000.000d', value: [1000000, 99999999] },
];

/** Filter sidebar — desktop co dinh ben trai */
export function FilterSidebar({ filters, onChange, className }: FilterSidebarProps) {
  const toggleArray = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  return (
    <aside className={cn('w-full', className)}>
      <h3 className="font-bold text-sm mb-3">BO LOC</h3>

      <Accordion multiple defaultValue={[0, 1, 2, 3]}>
        {/* Danh muc */}
        <AccordionItem value="category">
          <AccordionTrigger className="text-sm font-semibold py-3">Danh muc</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {MOCK_FILTER_CATEGORIES.map((cat) => (
                <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(cat.id)}
                    onChange={() =>
                      onChange({ ...filters, categories: toggleArray(filters.categories, cat.id) })
                    }
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{cat.name}</span>
                  <span className="text-xs text-gray-400 ml-auto">({cat.count})</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Mau sac */}
        <AccordionItem value="color">
          <AccordionTrigger className="text-sm font-semibold py-3">Mau sac</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2">
              {MOCK_FILTER_COLORS.map((color) => (
                <button
                  key={color.id}
                  onClick={() =>
                    onChange({ ...filters, colors: toggleArray(filters.colors, color.id) })
                  }
                  className={cn(
                    'w-7 h-7 rounded-full border-2 transition',
                    filters.colors.includes(color.id) ? 'border-black scale-110' : 'border-gray-300',
                  )}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Size */}
        <AccordionItem value="size">
          <AccordionTrigger className="text-sm font-semibold py-3">Kich thuoc</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2">
              {MOCK_FILTER_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() =>
                    onChange({ ...filters, sizes: toggleArray(filters.sizes, size) })
                  }
                  className={cn(
                    'min-w-[40px] h-9 px-2 border text-sm rounded transition',
                    filters.sizes.includes(size)
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 hover:border-black',
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Gia */}
        <AccordionItem value="price">
          <AccordionTrigger className="text-sm font-semibold py-3">Khoang gia</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {PRICE_RANGES.map((range) => {
                const isSelected =
                  filters.priceRange?.[0] === range.value[0] &&
                  filters.priceRange?.[1] === range.value[1];
                return (
                  <label key={range.label} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      checked={isSelected}
                      onChange={() => onChange({ ...filters, priceRange: range.value })}
                      className="border-gray-300"
                    />
                    <span className="text-sm">{range.label}</span>
                  </label>
                );
              })}
              {filters.priceRange && (
                <button
                  onClick={() => onChange({ ...filters, priceRange: null })}
                  className="text-xs text-red-600 hover:underline"
                >
                  Xoa khoang gia
                </button>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
}
