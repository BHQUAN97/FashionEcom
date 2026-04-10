'use client';

import { useState, useMemo } from 'react';
import { SearchInput } from '@/components/search/search-input';
import { RecentSearches } from '@/components/search/recent-searches';
import { PopularSearches } from '@/components/search/popular-searches';
import { ProductGrid } from '@/components/product/product-grid';
import { useSearchStore } from '@/lib/stores/search.store';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { MOCK_PRODUCTS, MOCK_POPULAR_SEARCHES } from '@/lib/mock/data';

/**
 * Search page — /tim-kiem
 * Dedicated mobile page, auto-focus, recent/popular, results
 */
export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const addRecent = useSearchStore((s) => s.addRecent);
  const debouncedQuery = useDebounce(query, 300);

  // Mock search — filter by name
  const results = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) return [];
    return MOCK_PRODUCTS.filter((p) =>
      p.name.toLowerCase().includes(debouncedQuery.toLowerCase()),
    );
  }, [debouncedQuery]);

  const handleSubmit = (term: string) => {
    setQuery(term);
    setSubmitted(true);
    addRecent(term);
  };

  const handleSelect = (term: string) => {
    setQuery(term);
    handleSubmit(term);
  };

  const showResults = submitted || (debouncedQuery.length >= 2 && results.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
      <SearchInput
        value={query}
        onChange={(v) => {
          setQuery(v);
          if (!v) setSubmitted(false);
        }}
        onSubmit={handleSubmit}
        autoFocus
      />

      {!showResults && (
        <>
          <RecentSearches onSelect={handleSelect} />
          <PopularSearches terms={MOCK_POPULAR_SEARCHES} onSelect={handleSelect} />
        </>
      )}

      {showResults && (
        <div className="mt-6">
          {results.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gray-500">
                Khong tim thay san pham cho &ldquo;{debouncedQuery}&rdquo;
              </p>
              <p className="text-sm text-gray-400 mt-1">Thu tim voi tu khoa khac</p>

              {/* Goi y san pham pho bien */}
              <div className="mt-8 text-left">
                <h3 className="text-lg font-bold mb-4">San pham pho bien</h3>
                <ProductGrid products={MOCK_PRODUCTS.slice(0, 4)} columns={4} />
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">
                Tim thay {results.length} san pham cho &ldquo;{debouncedQuery}&rdquo;
              </p>
              <ProductGrid products={results} columns={4} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
