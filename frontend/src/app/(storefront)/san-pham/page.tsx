'use client';

import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { ProductGrid } from '@/components/product/product-grid';
import { FilterSidebar, type FilterState } from '@/components/collection/filter-sidebar';
import { FilterBottomSheet } from '@/components/collection/filter-bottom-sheet';
import { FilterChips } from '@/components/collection/filter-chips';
import { SortSelect, type SortValue } from '@/components/collection/sort-select';
import { GridToggle } from '@/components/collection/grid-toggle';
import { LoadMoreButton } from '@/components/home/load-more-button';
import { MOCK_PRODUCTS } from '@/lib/mock/data';

/**
 * Collection page — /san-pham
 * Filter sidebar desktop, bottom sheet mobile, sort, grid toggle, load more
 */
export default function CollectionPage() {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    colors: [],
    sizes: [],
    priceRange: null,
  });
  const [sort, setSort] = useState<SortValue>('newest');
  const [gridCols, setGridCols] = useState<2 | 4>(2);
  const [filterOpen, setFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [loadingMore, setLoadingMore] = useState(false);

  // Tao filter chips tu state
  const chips = [
    ...filters.categories.map((c) => ({
      label: `Danh muc: ${c}`,
      onRemove: () => setFilters((f) => ({ ...f, categories: f.categories.filter((x) => x !== c) })),
    })),
    ...filters.colors.map((c) => ({
      label: `Mau: ${c}`,
      onRemove: () => setFilters((f) => ({ ...f, colors: f.colors.filter((x) => x !== c) })),
    })),
    ...filters.sizes.map((s) => ({
      label: `Size: ${s}`,
      onRemove: () => setFilters((f) => ({ ...f, sizes: f.sizes.filter((x) => x !== s) })),
    })),
    ...(filters.priceRange
      ? [{ label: 'Khoang gia', onRemove: () => setFilters((f) => ({ ...f, priceRange: null })) }]
      : []),
  ];

  const handleClearAll = () =>
    setFilters({ categories: [], colors: [], sizes: [], priceRange: null });

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + 12, MOCK_PRODUCTS.length));
      setLoadingMore(false);
    }, 500);
  };

  const products = MOCK_PRODUCTS.slice(0, visibleCount);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
      <Breadcrumb items={[{ label: 'Tat ca san pham' }]} />

      {/* Header */}
      <div className="flex items-center justify-between mt-4 mb-3">
        <h1 className="text-lg md:text-2xl font-bold">
          Tat ca san pham <span className="text-gray-400 text-sm font-normal">({MOCK_PRODUCTS.length})</span>
        </h1>
        <div className="flex items-center gap-2">
          <GridToggle columns={gridCols} onChange={setGridCols} />
          <SortSelect value={sort} onChange={setSort} className="hidden md:block" />
        </div>
      </div>

      {/* Mobile filter/sort bar */}
      <div className="flex gap-2 mb-3 md:hidden">
        <button
          onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg text-sm"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Bo loc
        </button>
        <SortSelect value={sort} onChange={setSort} className="flex-1" />
      </div>

      {/* Filter chips */}
      <FilterChips chips={chips} onClearAll={handleClearAll} className="mb-4" />

      {/* Layout: sidebar (desktop) + grid */}
      <div className="md:flex md:gap-6">
        {/* Sidebar — desktop only */}
        <div className="hidden md:block md:w-60 flex-shrink-0">
          <FilterSidebar filters={filters} onChange={setFilters} className="sticky top-20" />
        </div>

        {/* Product grid */}
        <div className="flex-1">
          <ProductGrid
            products={products}
            columns={gridCols === 4 ? 4 : 4}
          />
          <LoadMoreButton
            onClick={handleLoadMore}
            loading={loadingMore}
            hasMore={visibleCount < MOCK_PRODUCTS.length}
          />
        </div>
      </div>

      {/* Filter bottom sheet — mobile */}
      <FilterBottomSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onChange={setFilters}
        resultCount={MOCK_PRODUCTS.length}
      />
    </div>
  );
}
