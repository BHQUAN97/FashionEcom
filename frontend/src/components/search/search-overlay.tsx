'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { X, Search, Clock, TrendingUp } from 'lucide-react';
import { ProductCard } from '@/components/product/product-card';
import { useSearchStore } from '@/lib/stores/search.store';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { MOCK_PRODUCTS, MOCK_POPULAR_SEARCHES } from '@/lib/mock/data';

/** Nut trigger desktop — icon search, mo overlay */
export function SearchTriggerDesktop() {
  const openSearch = useSearchStore((s) => s.openSearch);
  return (
    <button
      onClick={openSearch}
      aria-label="Tìm kiếm"
      className="p-2 hover:bg-gray-100 rounded-full transition"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </button>
  );
}

/** Nut trigger mobile — thanh input gia, click mo overlay */
export function SearchTriggerMobile() {
  const openSearch = useSearchStore((s) => s.openSearch);
  return (
    <div className="px-4 pb-3" onClick={openSearch}>
      <div className="relative cursor-pointer">
        <input
          type="search"
          placeholder="Tìm kiếm sản phẩm..."
          readOnly
          className="w-full h-11 px-5 pr-12 bg-[#f6f6f6] border border-fashion-border text-[15px] font-medium focus:outline-none cursor-pointer"
        />
        <span className="absolute right-0 top-0 w-12 h-11 flex items-center justify-center pointer-events-none">
          <svg className="w-[18px] h-[18px] opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
      </div>
    </div>
  );
}

/** Nut trigger bottom nav — mobile tab bar, mo overlay thay vi navigate */
export function SearchTriggerBottomNav() {
  const openSearch = useSearchStore((s) => s.openSearch);
  return (
    <button
      onClick={openSearch}
      className="flex-[0_0_20%] flex flex-col items-center justify-center gap-1"
    >
      <span className="w-5 h-[22px] block relative">
        <svg className="w-full h-full" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </span>
      <span className="text-[11px] font-medium leading-none line-clamp-1">Tìm kiếm</span>
    </button>
  );
}

/**
 * Search overlay panel — Torano style
 * Fullscreen overlay: input centered, popular tags, live results
 * Dat 1 lan duy nhat trong layout
 */
export function SearchOverlayPanel() {
  const { isOpen, closeSearch, recentSearches, addRecent, removeRecent, clearRecent } = useSearchStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  // Filter san pham theo ten
  const results = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) return [];
    return MOCK_PRODUCTS.filter((p) =>
      p.name.toLowerCase().includes(debouncedQuery.toLowerCase()),
    );
  }, [debouncedQuery]);

  const handleClose = useCallback(() => {
    closeSearch();
    setQuery('');
  }, [closeSearch]);

  const handleSelect = useCallback((term: string) => {
    setQuery(term);
    addRecent(term);
    inputRef.current?.focus();
  }, [addRecent]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) addRecent(query.trim());
  }, [query, addRecent]);

  // Auto-focus khi mo
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Escape dong overlay + khoa scroll body
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const showResults = debouncedQuery.length >= 2;

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col">
      {/* Header: input + close */}
      <div className="border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <form onSubmit={handleSubmit} className="flex-1 relative">
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full h-12 pl-5 pr-12 border border-gray-300 text-base focus:outline-none focus:border-fashion-red transition"
            />
            <button
              type="submit"
              className="absolute right-0 top-0 w-12 h-12 flex items-center justify-center"
              aria-label="Tìm kiếm"
            >
              <Search className="w-5 h-5 text-gray-400" />
            </button>
          </form>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition flex-shrink-0"
            aria-label="Đóng"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Popular keyword tags — Torano style */}
        <div className="max-w-3xl mx-auto px-4 pb-4">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500">
            {MOCK_POPULAR_SEARCHES.slice(0, 6).map((term, i) => (
              <button
                key={term}
                onClick={() => handleSelect(term)}
                className="hover:text-fashion-red transition capitalize"
              >
                {term}{i < 5 && ','}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body: results hoac suggestions */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {!showResults ? (
            <>
              {/* Tim kiem gan day */}
              {recentSearches.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Tìm kiếm gần đây</h3>
                    <button onClick={clearRecent} className="text-sm text-gray-400 hover:text-red-600">
                      Xóa tất cả
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSelect(term)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition group"
                      >
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {term}
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRecent(term);
                          }}
                          className="ml-0.5 opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-3.5 h-3.5 text-gray-400 hover:text-red-600" />
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tim kiem pho bien */}
              <div>
                <h3 className="font-semibold mb-3">Tìm kiếm phổ biến</h3>
                <div className="space-y-1">
                  {MOCK_POPULAR_SEARCHES.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleSelect(term)}
                      className="flex items-center gap-2.5 w-full px-2 py-2.5 hover:bg-gray-50 rounded transition text-left"
                    >
                      <TrendingUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm capitalize">{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : results.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gray-500">
                Không tìm thấy sản phẩm cho &ldquo;{debouncedQuery}&rdquo;
              </p>
              <p className="text-sm text-gray-400 mt-1">Thử tìm với từ khóa khác</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">
                Tìm thấy {results.length} sản phẩm cho &ldquo;{debouncedQuery}&rdquo;
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-6">
                {results.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
