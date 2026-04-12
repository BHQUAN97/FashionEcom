'use client';

import { useState } from 'react';
import { Minus, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatVND } from '@/lib/utils/format';

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
  { id: 'san-pham-moi', name: 'Sản phẩm mới', href: '/danh-muc/san-pham-moi' },
  { id: 'sale', name: 'Danh mục sale', href: '/danh-muc/sale' },
  { id: 'ao-nam', name: 'Áo nam', href: '/danh-muc/ao-nam', hasChildren: true },
  { id: 'quan-nam', name: 'Quần nam', href: '/danh-muc/quan-nam', hasChildren: true },
  { id: 'phu-kien', name: 'Phụ kiện', href: '/danh-muc/phu-kien', hasChildren: true },
];

const MOCK_FILTER_COLORS = [
  { id: 'den', name: 'Đen', hex: '#1a1a1a' },
  { id: 'trang', name: 'Trắng', hex: '#ffffff' },
  { id: 'xanh', name: 'Xanh Navy', hex: '#1e3a5f' },
  { id: 'nau', name: 'Nâu', hex: '#8b4513' },
  { id: 'xam', name: 'Xám', hex: '#6b7280' },
  { id: 'be', name: 'Be', hex: '#d2b48c' },
];

const MOCK_FILTER_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39'];

const PRICE_MIN = 0;
const PRICE_MAX = 3000000;
const PRICE_STEP = 50000;

/** Collapsible filter section voi icon minus/plus */
function FilterSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-sm font-semibold"
      >
        {title}
        {open ? <Minus className="w-4 h-4 text-gray-400" /> : <Plus className="w-4 h-4 text-gray-400" />}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

/** Filter sidebar — Torano style: link categories, price slider, clean sections */
export function FilterSidebar({ filters, onChange, className }: FilterSidebarProps) {
  const toggleArray = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  // Local state cho price slider
  const [priceMin, setPriceMin] = useState(filters.priceRange?.[0] ?? PRICE_MIN);
  const [priceMax, setPriceMax] = useState(filters.priceRange?.[1] ?? PRICE_MAX);

  const handlePriceChange = (min: number, max: number) => {
    setPriceMin(min);
    setPriceMax(max);
    onChange({ ...filters, priceRange: [min, max] });
  };

  return (
    <aside className={cn('w-full', className)}>
      <h3 className="font-bold text-base mb-1">Bộ lọc</h3>

      {/* Danh muc san pham — links voi chevron */}
      <FilterSection title="Danh mục sản phẩm">
        <div className="space-y-0">
          {MOCK_FILTER_CATEGORIES.map((cat) => (
            <a
              key={cat.id}
              href={cat.href}
              className="flex items-center justify-between py-1.5 text-sm text-gray-700 hover:text-black transition"
            >
              <span>{cat.name}</span>
              {cat.hasChildren && <span className="text-xs text-gray-400">›</span>}
            </a>
          ))}
        </div>
      </FilterSection>

      {/* Khoang gia — slider doi + input fields */}
      <FilterSection title="Khoảng giá">
        <div className="space-y-3">
          {/* Dual range indicator */}
          <div className="relative h-1 bg-gray-200 rounded-full">
            <div
              className="absolute h-full bg-black rounded-full"
              style={{
                left: `${(priceMin / PRICE_MAX) * 100}%`,
                right: `${100 - (priceMax / PRICE_MAX) * 100}%`,
              }}
            />
          </div>

          {/* Min slider */}
          <input
            type="range"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={PRICE_STEP}
            value={priceMin}
            onChange={(e) => {
              const v = Math.min(Number(e.target.value), priceMax - PRICE_STEP);
              handlePriceChange(v, priceMax);
            }}
            className="w-full absolute opacity-0 cursor-pointer h-6 -mt-4"
          />
          {/* Max slider */}
          <input
            type="range"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={PRICE_STEP}
            value={priceMax}
            onChange={(e) => {
              const v = Math.max(Number(e.target.value), priceMin + PRICE_STEP);
              handlePriceChange(priceMin, v);
            }}
            className="w-full absolute opacity-0 cursor-pointer h-6 -mt-4"
          />

          {/* Input fields */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <input
                type="text"
                value={formatVND(priceMin)}
                readOnly
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs text-center bg-gray-50"
              />
            </div>
            <span className="text-gray-300">—</span>
            <div className="flex-1">
              <input
                type="text"
                value={formatVND(priceMax)}
                readOnly
                className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs text-center bg-gray-50"
              />
            </div>
          </div>
        </div>
      </FilterSection>

      {/* Mau sac */}
      <FilterSection title="Màu sắc" defaultOpen={false}>
        <div className="flex flex-wrap gap-2">
          {MOCK_FILTER_COLORS.map((color) => {
            const isSelected = filters.colors.includes(color.id);
            return (
              <button
                key={color.id}
                onClick={() => onChange({ ...filters, colors: toggleArray(filters.colors, color.id) })}
                className={cn(
                  'w-8 h-8 rounded-full border-2 transition relative',
                  isSelected ? 'border-black scale-110' : 'border-gray-200 hover:border-gray-400',
                )}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              >
                {isSelected && (
                  <Check className={cn(
                    'w-3.5 h-3.5 absolute inset-0 m-auto',
                    color.hex === '#ffffff' || color.hex === '#d2b48c' ? 'text-black' : 'text-white',
                  )} />
                )}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Size */}
      <FilterSection title="Size">
        <div className="flex flex-wrap gap-2">
          {MOCK_FILTER_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => onChange({ ...filters, sizes: toggleArray(filters.sizes, size) })}
              className={cn(
                'min-w-[40px] h-9 px-3 border text-sm rounded transition',
                filters.sizes.includes(size)
                  ? 'border-black bg-black text-white'
                  : 'border-gray-200 hover:border-black',
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>
    </aside>
  );
}
