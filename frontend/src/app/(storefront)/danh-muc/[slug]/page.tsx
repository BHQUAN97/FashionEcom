'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { SlidersHorizontal, Search, X } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { ProductGrid } from '@/components/product/product-grid';
import { FilterSidebar, type FilterState } from '@/components/collection/filter-sidebar';
import { FilterBottomSheet } from '@/components/collection/filter-bottom-sheet';
import { FilterChips } from '@/components/collection/filter-chips';
import { SortSelect, type SortValue } from '@/components/collection/sort-select';
import { Pagination } from '@/components/collection/pagination';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/lib/mock/data';
import { formatVND } from '@/lib/utils/format';

const PRODUCTS_PER_PAGE = 12;

/**
 * Category collection page — /danh-muc/[slug]
 * Torano style: search bar on page, filter sidebar, sort header
 */
export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const category = MOCK_CATEGORIES.find((c) => c.slug === slug) || {
    name: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    slug,
  };

  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    colors: [],
    sizes: [],
    priceRange: null,
  });
  const [sort, setSort] = useState<SortValue>('bestseller');
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const COLOR_NAMES: Record<string, string> = { 'c-den': 'Đen', 'c-navy': 'Xanh Navy', 'c-trang': 'Trắng', 'c-nau': 'Nâu', 'c-xam': 'Xám', 'c-be': 'Be', 'c-xreu': 'Xanh rêu', 'c-do': 'Đỏ đậm' };
  const chips = [
    // Chip khoang gia
    ...(filters.priceRange
      ? [{
          label: `Khoảng giá: ${formatVND(filters.priceRange[0])} - ${formatVND(filters.priceRange[1])}`,
          onRemove: () => setFilters((f) => ({ ...f, priceRange: null })),
        }]
      : []),
    // Chip mau sac — gom tat ca mau vao 1 chip (Torano style)
    ...(filters.colors.length > 0
      ? [{
          label: `Màu sắc: ${filters.colors.map((c) => COLOR_NAMES[c] || c).join(', ')}`,
          onRemove: () => setFilters((f) => ({ ...f, colors: [] })),
        }]
      : []),
    // Chip size — gom tat ca size vao 1 chip
    ...(filters.sizes.length > 0
      ? [{
          label: `Size: ${filters.sizes.join(', ')}`,
          onRemove: () => setFilters((f) => ({ ...f, sizes: [] })),
        }]
      : []),
  ];

  // Apply filters to product list
  const filteredProducts = useMemo(() => {
    let result = MOCK_PRODUCTS;

    // Loc theo khoang gia
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      result = result.filter((p) => p.price >= min && p.price <= max);
    }

    // Loc theo mau sac — match color id trong product.colors
    if (filters.colors.length > 0) {
      result = result.filter((p) =>
        p.colors?.some((c: { id: string }) => filters.colors.includes(c.id))
      );
    }

    // Loc theo size — match size name trong product.sizes
    if (filters.sizes.length > 0) {
      result = result.filter((p) =>
        p.sizes?.some((s: { name: string }) => filters.sizes.includes(s.name))
      );
    }

    return result;
  }, [filters]);

  // Reset ve trang 1 khi filter thay doi
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const safePage = currentPage > totalPages ? 1 : currentPage;
  const paginatedProducts = filteredProducts.slice(
    (safePage - 1) * PRODUCTS_PER_PAGE,
    safePage * PRODUCTS_PER_PAGE
  );

  const handleClearAll = () =>
    setFilters({ categories: [], colors: [], sizes: [], priceRange: null });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      {/* Search overlay — hien ngay tren page */}
      {searchOpen && (
        <div className="border-b bg-white relative z-10">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  autoFocus
                  className="w-full border border-red-400 rounded px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-red-500"
                />
                <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
              <button
                onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Goi y tim kiem */}
            <div className="flex items-center gap-2 mt-2 text-sm">
              <span className="text-gray-400">Polo, Ao thun, Quan short</span>
              <a href="/tim-kiem?q=sale" className="text-red-600 hover:underline ml-2">Sale</a>
              <a href="/tim-kiem?q=moi" className="text-red-600 hover:underline">Hang moi</a>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-10 py-4">
        <Breadcrumb items={[{ label: category.name }]} />

        {/* Header — ten danh muc + count + sort */}
        <div className="md:flex md:gap-6 mt-4">
          {/* Sidebar placeholder width cho alignment */}
          <div className="hidden md:block md:w-52 lg:w-56 flex-shrink-0" />

          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-baseline gap-2">
                <h1 className="text-xl md:text-2xl font-bold">{category.name}</h1>
                <span className="text-sm text-gray-400">{filteredProducts.length} sản phẩm</span>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                  title="Tìm kiếm"
                >
                  <Search className="w-4 h-4" />
                </button>
                <SortSelect value={sort} onChange={setSort} />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: filter + sort bar */}
        <div className="flex gap-2 mb-3 md:hidden">
          <button
            onClick={() => setFilterOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-lg text-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Bộ lọc
          </button>
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-200 rounded-lg text-sm"
          >
            <Search className="w-4 h-4" />
          </button>
          <SortSelect value={sort} onChange={setSort} className="flex-1" />
        </div>

        {/* Mobile: filter chips */}
        <FilterChips chips={chips} onClearAll={handleClearAll} className="mb-4 md:hidden" />

        {/* Main: sidebar + grid */}
        <div className="md:flex md:gap-6">
          <div className="hidden md:block md:w-52 lg:w-56 flex-shrink-0">
            <div className="sticky top-20">
              {/* Desktop: "Ban dang xem" + "Xoa het" phia tren bo loc */}
              <FilterChips chips={chips} onClearAll={handleClearAll} className="mb-4" />
              <FilterSidebar filters={filters} onChange={(f) => { setFilters(f); setCurrentPage(1); }} />
            </div>
          </div>
          <div className="flex-1">
            <ProductGrid products={paginatedProducts} columns={4} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>

        <FilterBottomSheet
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          filters={filters}
          onChange={(f) => { setFilters(f); setCurrentPage(1); }}
          resultCount={filteredProducts.length}
        />
      </div>
    </div>
  );
}
