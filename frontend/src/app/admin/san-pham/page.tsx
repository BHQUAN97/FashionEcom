'use client';

import { useState, useEffect, useMemo, useCallback, Fragment } from 'react';
import { useAdminFetch } from '@/lib/hooks/use-admin-fetch';
import { api } from '@/lib/api/client';
import { AdminTableLayout } from '@/components/admin/shared/admin-table-layout';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { EmptyTableRow } from '@/components/admin/shared/empty-table-row';

interface Product {
  catProductId: string;
  catProductName: string;
  catProductCode: string;
  catProductStatus: number;
  catProductBrand: string | null;
  category?: { catCategoryName: string };
  createdDate: string;
  variant_count: number;
  price_range: { min: number; max: number };
}

interface Variant {
  catProductVariantId: string;
  catProductVariantSku: string;
  catProductVariantPrice: number;
  catProductVariantStatus: number;
  color?: { catColorName: string; catColorHex: string } | null;
  size?: { catSizeValue: string } | null;
}

interface Category {
  catCategoryId: string;
  catCategoryName: string;
}

/** Format gia VND */
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
};

/** Status tab definition */
const STATUS_TABS = [
  { label: 'Tất cả', value: undefined },
  { label: 'Đang bán', value: 1 },
  { label: 'Ẩn', value: 0 },
  { label: 'Hết hàng', value: 2 },
] as const;

/**
 * Admin Products — danh sach san pham kieu Shopee Seller Center
 * Ho tro: filter status tabs, search, category filter, expandable variants
 */
export default function ProductsPage() {
  // Filter state
  const [statusFilter, setStatusFilter] = useState<number | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [variantsCache, setVariantsCache] = useState<Record<string, Variant[]>>({});
  const [variantsLoading, setVariantsLoading] = useState<Set<string>>(new Set());
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  // Build URL dong voi filter params
  const fetchUrl = useMemo(() => {
    let url = '/admin/products?limit=50';
    if (statusFilter !== undefined) url += `&status=${statusFilter}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (categoryFilter) url += `&categoryId=${encodeURIComponent(categoryFilter)}`;
    return url;
  }, [statusFilter, search, categoryFilter]);

  const { data, loading } = useAdminFetch<{ data: Product[]; pagination?: { total: number } }>({ url: fetchUrl });
  const products = data?.data || [];

  // Fetch categories cho dropdown filter
  const { data: catData } = useAdminFetch<{ data: Category[] }>({ url: '/admin/categories' });
  const categories = catData?.data || [];

  // Dem so luong theo status (tu data hien tai hoac dung total)
  const statusCounts = useMemo(() => {
    const counts = { all: products.length, active: 0, hidden: 0, outOfStock: 0 };
    products.forEach((p) => {
      if (p.catProductStatus === 1) counts.active++;
      else if (p.catProductStatus === 0) counts.hidden++;
      else if (p.catProductStatus === 2) counts.outOfStock++;
    });
    return counts;
  }, [products]);

  // Reset expanded khi filter thay doi
  useEffect(() => {
    setExpandedProducts(new Set());
    setSelectedProducts(new Set());
  }, [fetchUrl]);

  /** Toggle expand san pham — fetch variants neu chua co trong cache */
  const toggleExpand = useCallback(async (productId: string) => {
    setExpandedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
    // Fetch variants neu chua co trong cache
    setVariantsCache((prev) => {
      if (prev[productId]) return prev; // da co trong cache
      // Trigger fetch
      setVariantsLoading((ls) => new Set(ls).add(productId));
      api.get<{ data: Variant[] }>(`/admin/products/${productId}/variants`)
        .then((res) => {
          const variants = res.data?.data || res.data || [];
          setVariantsCache((c) => ({ ...c, [productId]: variants as Variant[] }));
        })
        .catch(() => {
          setVariantsCache((c) => ({ ...c, [productId]: [] }));
        })
        .finally(() => {
          setVariantsLoading((ls) => {
            const s = new Set(ls);
            s.delete(productId);
            return s;
          });
        });
      return prev;
    });
  }, []);

  /** Toggle select tat ca */
  const toggleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map((p) => p.catProductId)));
    }
  };

  /** Toggle select 1 san pham */
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedProducts);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedProducts(newSet);
  };

  /** Ap dung search */
  const applyFilters = () => {
    setSearch(searchInput);
  };

  /** Dat lai tat ca filter */
  const resetFilters = () => {
    setSearchInput('');
    setSearch('');
    setCategoryFilter('');
    setStatusFilter(undefined);
  };

  /** Status config cho StatusBadge shared component */
  const PRODUCT_STATUS_LABELS: Record<number, string> = {
    0: 'Ẩn', 1: 'Đang bán', 2: 'Hết hàng',
  };
  const PRODUCT_STATUS_COLORS: Record<number, string> = {
    0: 'bg-gray-100 text-gray-500',
    1: 'bg-green-100 text-green-700',
    2: 'bg-red-100 text-red-700',
  };

  return (
    <AdminTableLayout
      title="Sản phẩm"
      actions={
        <a
          href="/admin/san-pham/tao"
          className="px-4 py-2 bg-[#ee4d2d] text-white rounded-lg hover:bg-[#d73211] text-sm inline-block font-medium transition-colors"
        >
          + Thêm sản phẩm
        </a>
      }
      loading={loading}
    >
      {/* Status filter tabs */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="border-b flex">
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.value;
            const count =
              tab.value === undefined
                ? statusCounts.all
                : tab.value === 1
                  ? statusCounts.active
                  : tab.value === 0
                    ? statusCounts.hidden
                    : statusCounts.outOfStock;

            return (
              <button
                key={tab.label}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-5 py-3 text-sm font-medium transition-colors relative ${
                  isActive
                    ? 'text-[#ee4d2d] border-b-2 border-[#ee4d2d]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`ml-1 text-xs ${isActive ? 'text-[#ee4d2d]' : 'text-gray-400'}`}>
                    ({count})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search + filter bar */}
        <div className="p-4 border-b bg-gray-50 flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Tìm tên sản phẩm, SKU, mã sản phẩm..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            className="flex-1 min-w-[200px] px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#ee4d2d]/30 focus:border-[#ee4d2d]"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#ee4d2d]/30"
          >
            <option value="">Danh mục</option>
            {categories.map((c) => (
              <option key={c.catCategoryId} value={c.catCategoryId}>
                {c.catCategoryName}
              </option>
            ))}
          </select>
          <button
            onClick={applyFilters}
            className="px-4 py-2 bg-[#ee4d2d] text-white rounded-md text-sm font-medium hover:bg-[#d73211] transition-colors"
          >
            Áp dụng
          </button>
          <button
            onClick={resetFilters}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Đặt lại
          </button>
        </div>

        {/* Product table */}
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={products.length > 0 && selectedProducts.size === products.length}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 accent-[#ee4d2d]"
                />
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Tên sản phẩm</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Giá</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Kho hàng</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Trạng thái</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((p) => {
              const isExpanded = expandedProducts.has(p.catProductId);
              const variants = variantsCache[p.catProductId] || [];
              const isLoadingVariants = variantsLoading.has(p.catProductId);
              const hasPriceRange = p.price_range && (p.price_range.min > 0 || p.price_range.max > 0);

              return (
                <Fragment key={p.catProductId}>
                  {/* Product row */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(p.catProductId)}
                        onChange={() => toggleSelect(p.catProductId)}
                        className="rounded border-gray-300 accent-[#ee4d2d]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        {/* Expand toggle */}
                        {p.variant_count > 0 && (
                          <button
                            onClick={() => toggleExpand(p.catProductId)}
                            className="mt-1 text-gray-400 hover:text-gray-600 text-xs flex-shrink-0 w-4"
                          >
                            {isExpanded ? '▲' : '▼'}
                          </button>
                        )}
                        <div className={p.variant_count === 0 ? 'ml-6' : ''}>
                          <a
                            href={`/admin/san-pham/${p.catProductId}`}
                            className="text-gray-900 hover:text-[#ee4d2d] font-medium"
                          >
                            {p.catProductName}
                          </a>
                          <div className="text-xs text-gray-400 mt-0.5">
                            SKU: {p.catProductCode}
                          </div>
                          {p.category && (
                            <div className="text-xs text-gray-400">
                              {p.category.catCategoryName}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      {hasPriceRange ? (
                        p.price_range.min === p.price_range.max ? (
                          <span className="text-gray-900">{formatPrice(p.price_range.min)}</span>
                        ) : (
                          <span className="text-gray-900">
                            {formatPrice(p.price_range.min)} - {formatPrice(p.price_range.max)}
                          </span>
                        )
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-gray-700">
                        {p.variant_count > 0 ? `${p.variant_count} phân loại` : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={p.catProductStatus} label={PRODUCT_STATUS_LABELS[p.catProductStatus] || 'N/A'} colors={PRODUCT_STATUS_COLORS} />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <a
                        href={`/admin/san-pham/${p.catProductId}`}
                        className="text-[#ee4d2d] hover:underline text-xs font-medium"
                      >
                        Cập nhật
                      </a>
                      {p.variant_count > 0 && (
                        <button
                          onClick={() => toggleExpand(p.catProductId)}
                          className="ml-3 text-gray-500 hover:text-gray-700 text-xs"
                        >
                          Xem thêm
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* Expanded variant rows */}
                  {isExpanded && (
                    <>
                      {isLoadingVariants ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-3 bg-gray-50 text-center text-gray-400 text-xs">
                            Đang tải phân loại...
                          </td>
                        </tr>
                      ) : variants.length > 0 ? (
                        variants.map((v) => (
                          <tr key={v.catProductVariantId} className="bg-gray-50 border-t border-gray-100">
                            <td className="px-4 py-2" />
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2 pl-6">
                                {v.color && (
                                  <span
                                    className="inline-block w-3 h-3 rounded-full border border-gray-300 flex-shrink-0"
                                    style={{ backgroundColor: v.color.catColorHex }}
                                    title={v.color.catColorName}
                                  />
                                )}
                                <span className="text-xs text-gray-600">
                                  {v.catProductVariantSku}
                                  {v.size && ` — ${v.size.catSizeValue}`}
                                  {v.color && ` — ${v.color.catColorName}`}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-right">
                              <span className="text-xs text-gray-700">
                                {formatPrice(v.catProductVariantPrice)}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-center">
                              <span className={`inline-block w-2 h-2 rounded-full ${v.catProductVariantStatus === 1 ? 'bg-green-500' : 'bg-gray-300'}`} />
                            </td>
                            <td className="px-4 py-2" />
                            <td className="px-4 py-2" />
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-2 bg-gray-50 text-center text-gray-400 text-xs">
                            Không có phân loại
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                </Fragment>
              );
            })}
            {products.length === 0 && (
              <EmptyTableRow colSpan={6} message="Chưa có sản phẩm nào" />
            )}
          </tbody>
        </table>
      </div>
    </AdminTableLayout>
  );
}
