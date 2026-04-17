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
  { id: 'ao-polo',  name: 'Áo Polo',       href: '/danh-muc/ao-polo' },
  { id: 'ao-thun',  name: 'Áo Thun',       href: '/danh-muc/ao-thun' },
  { id: 'ao-khoac', name: 'Áo Khoác',      href: '/danh-muc/ao-khoac' },
  { id: 'ao-so-mi', name: 'Áo Sơ Mi',      href: '/danh-muc/ao-so-mi' },
  { id: 'ao-ni',    name: 'Áo Nỉ/Hoodie',  href: '/danh-muc/ao-ni' },
  { id: 'quan-au',  name: 'Quần Âu/Jeans',  href: '/danh-muc/quan-au' },
  { id: 'quan-short', name: 'Quần Short',   href: '/danh-muc/quan-short' },
  { id: 'phu-kien', name: 'Phụ Kiện',       href: '/danh-muc/phu-kien' },
];

const MOCK_FILTER_COLORS = [
  { id: 'c-den',   name: 'Đen',        hex: '#1a1a1a' },
  { id: 'c-trang', name: 'Trắng',      hex: '#f5f5f5' },
  { id: 'c-navy',  name: 'Xanh Navy',  hex: '#1e3a5f' },
  { id: 'c-nau',   name: 'Nâu',        hex: '#8b5e3c' },
  { id: 'c-xam',   name: 'Xám',        hex: '#808080' },
  { id: 'c-be',    name: 'Be',         hex: '#c8ad7f' },
  { id: 'c-xreu',  name: 'Xanh rêu',   hex: '#4a6741' },
  { id: 'c-do',    name: 'Đỏ đậm',     hex: '#8b2500' },
];

const MOCK_FILTER_SIZES = ['S', 'M', 'L', 'XL', '2XL', '29', '30', '31', '32', '33'];

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
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-sm font-bold text-gray-900 tracking-wide"
      >
        {title}
        {open ? <Minus className="w-4 h-4 text-gray-500" /> : <Plus className="w-4 h-4 text-gray-500" />}
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
      <h3 className="font-bold text-lg mb-2 text-gray-900">Bộ lọc</h3>

      {/* Danh muc san pham — links voi chevron */}
      <FilterSection title="Danh mục sản phẩm">
        <div className="space-y-0.5">
          {MOCK_FILTER_CATEGORIES.map((cat) => (
            <a
              key={cat.id}
              href={cat.href}
              className="flex items-center justify-between py-1.5 text-[13px] font-medium text-gray-800 hover:text-black transition"
            >
              <span>{cat.name}</span>
              <span className="text-xs text-gray-400">›</span>
            </a>
          ))}
        </div>
      </FilterSection>

      {/* Khoang gia — noUi-style dual range slider */}
      <FilterSection title="Khoảng giá">
        <div className="overflow-hidden">
          {/* Tooltip labels — justify-between de khong tran */}
          <div className="flex justify-between mb-2">
            <span className="text-[11px] border border-gray-300 rounded px-1.5 py-0.5 bg-white">
              {formatVND(priceMin)}
            </span>
            <span className="text-[11px] border border-gray-300 rounded px-1.5 py-0.5 bg-white">
              {formatVND(priceMax)}
            </span>
          </div>

          {/* Slider track + handles — dung pointer-events de ca 2 handle deu keo duoc */}
          <div className="relative h-6 mx-2.5">
            {/* Track nen */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 bg-gray-200 rounded-full" />
            {/* Filled bar */}
            <div
              className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-black rounded-full"
              style={{
                left: `${(priceMin / PRICE_MAX) * 100}%`,
                right: `${100 - (priceMax / PRICE_MAX) * 100}%`,
              }}
            />
            {/* Visual handle min */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white border-2 border-black shadow pointer-events-none z-10"
              style={{ left: `${(priceMin / PRICE_MAX) * 100}%` }}
            />
            {/* Visual handle max */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white border-2 border-black shadow pointer-events-none z-10"
              style={{ left: `${(priceMax / PRICE_MAX) * 100}%` }}
            />
            {/* Min slider — chi chiem nua trai, luon keo duoc */}
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
              className="absolute inset-0 w-full opacity-0 cursor-pointer z-30"
              style={{ clipPath: `inset(0 ${100 - ((priceMin + priceMax) / 2 / PRICE_MAX) * 100}% 0 0)` }}
            />
            {/* Max slider — chi chiem nua phai, luon keo duoc */}
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
              className="absolute inset-0 w-full opacity-0 cursor-pointer z-30"
              style={{ clipPath: `inset(0 0 0 ${((priceMin + priceMax) / 2 / PRICE_MAX) * 100}%)` }}
            />
          </div>

          {/* Tick marks + labels — justify-between */}
          <div className="flex justify-between mt-0.5">
            <div className="flex flex-col items-center">
              <div className="w-px h-2 bg-gray-400" />
              <span className="text-[10px] text-gray-500">{formatVND(PRICE_MIN)}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-px h-2 bg-gray-400" />
              <span className="text-[10px] text-gray-500">{formatVND(PRICE_MAX)}</span>
            </div>
          </div>

          {/* Gia tri hien tai */}
          <p className="text-xs text-gray-600 text-center mt-1">
            {formatVND(priceMin)} - {formatVND(priceMax)}
          </p>
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
