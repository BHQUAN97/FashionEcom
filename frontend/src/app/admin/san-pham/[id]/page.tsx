'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdminFetch } from '@/lib/hooks/use-admin-fetch';
import { api } from '@/lib/api/client';

interface Category {
  catCategoryId: string;
  catCategoryName: string;
  catCategoryCode: string;
}

interface Color {
  catColorId: string;
  catColorName: string;
  catColorHex: string;
  catColorStatus: number;
}

interface SizeGroup {
  catSizeGroupId: string;
  catSizeGroupName: string;
  catSizeGroupValues: string;
}

interface Size {
  catSizeId: string;
  catSizeValue: string;
  catSizeGroupId: string;
  catSizeSort: number;
}

interface Variant {
  catProductVariantId: string;
  catProductVariantSku: string;
  catProductVariantPrice: number;
  catProductVariantComparePrice: number;
  catProductVariantCost: number;
  catProductVariantStatus: number;
  catProductVariantColor?: string | null;
  catProductVariantSize?: string | null;
  color?: { catColorId: string; catColorName: string; catColorHex: string } | null;
  size?: { catSizeId: string; catSizeValue: string; sizeGroup?: { catSizeGroupName: string } } | null;
}

interface ProductDetail {
  catProductId: string;
  catProductName: string;
  catProductCode: string;
  catProductSlug: string;
  catProductDescription: string | null;
  catProductShortDesc: string | null;
  catProductBrand: string | null;
  catProductStatus: number;
  catProductIsFeatured: number;
  catProductIsNew: number;
  catProductSeoTitle: string | null;
  catProductSeoDesc: string | null;
  catCategoryId: string;
  catProductOrigin: string | null;
  catProductMaterial: string | null;
  catProductPackagingType: string | null;
  catProductCondition: string | null;
  catProductWeight: number;
  catProductLength: number;
  catProductWidth: number;
  catProductHeight: number;
  catProductPreOrder: number;
  catProductPreOrderDays: number;
  category?: { catCategoryName: string };
  variants?: Variant[];
  createdDate?: string;
}

const TABS = [
  'Thông tin cơ bản',
  'Thông tin chi tiết',
  'Mô tả',
  'Thông tin bán hàng',
  'Vận chuyển',
  'Thông tin khác',
];

/**
 * Chi tiet / Sua san pham — layout Shopee Seller Center voi 6 tab
 */
export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);

  const { data: productRes, loading: loadingProduct } = useAdminFetch<{ data: ProductDetail }>({ url: `/admin/products/${id}` });
  const product = productRes?.data;

  const { data: catRes } = useAdminFetch<{ data: Category[] }>({ url: '/admin/categories' });
  const categories = catRes?.data || [];

  // Fetch colors va size groups cho variant generation
  const { data: colorsRes } = useAdminFetch<{ data: Color[] }>({ url: '/admin/attributes/colors' });
  const colors = colorsRes?.data || [];

  const { data: sizeGroupsRes } = useAdminFetch<{ data: SizeGroup[] }>({ url: '/admin/attributes/sizes' });
  const sizeGroups = sizeGroupsRes?.data || [];

  // State cho variant generator
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizeGroup, setSelectedSizeGroup] = useState('');
  const [availableSizes, setAvailableSizes] = useState<Size[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [defaultPrice, setDefaultPrice] = useState(0);
  const [defaultCost, setDefaultCost] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [editingVariants, setEditingVariants] = useState<Record<string, Partial<Variant>>>({});

  // Khi chon size group, fetch sizes cua nhom do
  useEffect(() => {
    if (selectedSizeGroup) {
      api.get<Size[]>(`/admin/attributes/sizes/${selectedSizeGroup}/values`)
        .then((res) => {
          setAvailableSizes(res.data);
          setSelectedSizes(res.data.map((s) => s.catSizeId));
        })
        .catch(() => setAvailableSizes([]));
    } else {
      setAvailableSizes([]);
      setSelectedSizes([]);
    }
  }, [selectedSizeGroup]);

  // Load variants khi product load xong
  useEffect(() => {
    if (product?.variants) {
      setVariants(product.variants);
    }
  }, [product]);

  const [form, setForm] = useState({
    name: '', code: '', categoryId: '', description: '', shortDesc: '',
    brand: '', slug: '', seoTitle: '', seoDesc: '',
    status: 1, isFeatured: 0, isNew: 0,
    origin: '', material: '', packagingType: '', condition: 'new',
    weight: 0, length: 0, width: 0, height: 0,
    preOrder: 0, preOrderDays: 7,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [initialized, setInitialized] = useState(false);

  // Sync product data vao form khi load xong
  useEffect(() => {
    if (product && !initialized) {
      setForm({
        name: product.catProductName || '',
        code: product.catProductCode || '',
        categoryId: product.catCategoryId || '',
        description: product.catProductDescription || '',
        shortDesc: product.catProductShortDesc || '',
        brand: product.catProductBrand || '',
        slug: product.catProductSlug || '',
        seoTitle: product.catProductSeoTitle || '',
        seoDesc: product.catProductSeoDesc || '',
        status: product.catProductStatus ?? 1,
        isFeatured: product.catProductIsFeatured ?? 0,
        isNew: product.catProductIsNew ?? 0,
        origin: product.catProductOrigin || '',
        material: product.catProductMaterial || '',
        packagingType: product.catProductPackagingType || '',
        condition: product.catProductCondition || 'new',
        weight: product.catProductWeight || 0,
        length: product.catProductLength || 0,
        width: product.catProductWidth || 0,
        height: product.catProductHeight || 0,
        preOrder: product.catProductPreOrder || 0,
        preOrderDays: product.catProductPreOrderDays || 7,
      });
      setInitialized(true);
    }
  }, [product, initialized]);

  const set = (key: string, value: string | number) => setForm({ ...form, [key]: value });

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await api.put(`/admin/products/${id}`, form);
      setMessage('Đã lưu thành công');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi cập nhật sản phẩm');
    } finally {
      setSaving(false);
    }
  };

  // Toggle chon mau sac
  const toggleColor = (colorId: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorId) ? prev.filter((c) => c !== colorId) : [...prev, colorId],
    );
  };

  // Toggle chon size
  const toggleSize = (sizeId: string) => {
    setSelectedSizes((prev) =>
      prev.includes(sizeId) ? prev.filter((s) => s !== sizeId) : [...prev, sizeId],
    );
  };

  // Generate variant matrix
  const handleGenerate = async () => {
    if (selectedColors.length === 0 && selectedSizes.length === 0) return;
    setGenerating(true);
    try {
      const res = await api.post<{ created: number; total: number }>(
        `/admin/products/${id}/variants/generate`,
        {
          colorIds: selectedColors.length > 0 ? selectedColors : undefined,
          sizeIds: selectedSizes.length > 0 ? selectedSizes : undefined,
          defaultPrice,
          defaultCost,
        },
      );
      // Reload variants
      const varRes = await api.get<Variant[]>(`/admin/products/${id}/variants`);
      setVariants(varRes.data);
      setMessage(`Đã tạo ${res.data.created} biến thể mới (tổng: ${res.data.total})`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi tạo variants');
    } finally {
      setGenerating(false);
    }
  };

  // Update variant gia inline
  const handleVariantSave = async (variantId: string) => {
    const changes = editingVariants[variantId];
    if (!changes) return;
    try {
      await api.put(`/admin/products/variants/${variantId}`, changes);
      const varRes = await api.get<Variant[]>(`/admin/products/${id}/variants`);
      setVariants(varRes.data);
      setEditingVariants((prev) => {
        const next = { ...prev };
        delete next[variantId];
        return next;
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi cập nhật variant');
    }
  };

  // Xoa variant
  const handleVariantDelete = async (variantId: string) => {
    try {
      await api.delete(`/admin/products/variants/${variantId}`);
      setVariants((prev) => prev.filter((v) => v.catProductVariantId !== variantId));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi xóa variant');
    }
  };

  // Tinh diem chat luong noi dung
  const qualityScore = useMemo(() => {
    const checks = [
      { label: 'Thêm ít nhất 3 hình ảnh', passed: false }, // TODO: khi co media
      { label: 'Tên SP 25~100 ký tự', passed: form.name.length >= 25 && form.name.length <= 100 },
      { label: 'Thêm mô tả >= 100 ký tự', passed: form.description.length >= 100 },
      { label: 'Thêm thông tin chi tiết (brand/origin/material)', passed: !!(form.brand || form.origin || form.material) },
      { label: 'Thêm ít nhất 1 biến thể', passed: variants.length > 0 },
      { label: 'Cân nặng > 0', passed: form.weight > 0 },
    ];
    const score = checks.filter((c) => c.passed).length;
    let level: string;
    let color: string;
    let bgColor: string;
    if (score >= 5) {
      level = 'Xuất sắc';
      color = 'text-green-600';
      bgColor = 'bg-green-500';
    } else if (score >= 3) {
      level = 'Đạt chuẩn';
      color = 'text-yellow-600';
      bgColor = 'bg-yellow-500';
    } else {
      level = 'Cần cải thiện';
      color = 'text-red-600';
      bgColor = 'bg-red-500';
    }
    return { checks, score, total: checks.length, level, color, bgColor };
  }, [form.name, form.description, form.brand, form.origin, form.material, form.weight, variants.length]);

  if (loadingProduct) {
    return <div className="p-8 text-center text-gray-500">Đang tải...</div>;
  }

  if (!product) {
    return <div className="p-8 text-center text-red-500">Không tìm thấy sản phẩm</div>;
  }

  return (
    <div>
      {/* Header — luon hien thi */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <button onClick={() => router.push('/admin/san-pham')} className="text-sm text-gray-500 hover:underline mb-1 block">
            &larr; Quay lại danh sách
          </button>
          <h1 className="text-2xl font-bold">{product.catProductName}</h1>
          <p className="text-xs text-gray-400 mt-1 font-mono">{product.catProductCode} &bull; {id}</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-[#ee4d2d] text-white rounded-lg hover:bg-[#d73211] disabled:opacity-50 text-sm font-medium transition"
        >
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>

      {message && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{message}</div>}
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      {/* Tab Navigation — sticky */}
      <div className="sticky top-0 z-10 bg-white border-b mb-6">
        <div className="flex overflow-x-auto">
          {TABS.map((tab, idx) => (
            <button
              key={tab}
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition border-b-2 ${
                activeTab === idx
                  ? 'border-[#ee4d2d] text-[#ee4d2d]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tab Content — left 2 cols */}
        <div className="lg:col-span-2">

          {/* Tab 0: Thong tin co ban */}
          {activeTab === 0 && (
            <div className="bg-white border rounded-lg p-6 space-y-4">
              <h2 className="font-medium text-base">Thông tin cơ bản</h2>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Tên sản phẩm *</label>
                <input
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  maxLength={255}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
                <span className="text-xs text-gray-400 mt-1 block text-right">{form.name.length}/255</span>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Mã sản phẩm</label>
                <input
                  value={form.code}
                  onChange={(e) => set('code', e.target.value.toUpperCase())}
                  className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Danh mục *</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => set('categoryId', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((c: Category) => (
                    <option key={c.catCategoryId} value={c.catCategoryId}>
                      {c.catCategoryName} ({c.catCategoryCode})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Mô tả ngắn</label>
                <input
                  value={form.shortDesc}
                  onChange={(e) => set('shortDesc', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  maxLength={500}
                />
              </div>
            </div>
          )}

          {/* Tab 1: Thong tin chi tiet */}
          {activeTab === 1 && (
            <div className="bg-white border rounded-lg p-6 space-y-4">
              <h2 className="font-medium text-base">Thông tin chi tiết</h2>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Thương hiệu</label>
                <input
                  value={form.brand}
                  onChange={(e) => set('brand', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Xuất xứ</label>
                <input
                  value={form.origin}
                  onChange={(e) => set('origin', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="VD: Việt Nam, Trung Quốc..."
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Chất liệu</label>
                <input
                  value={form.material}
                  onChange={(e) => set('material', e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="VD: Cotton 100%, Polyester..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Kiểu đóng gói</label>
                  <select
                    value={form.packagingType}
                    onChange={(e) => set('packagingType', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">-- Chọn --</option>
                    <option value="single">Đơn</option>
                    <option value="combo">Combo</option>
                    <option value="set">Bộ</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Tình trạng</label>
                  <select
                    value={form.condition}
                    onChange={(e) => set('condition', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="new">Mới</option>
                    <option value="used">Đã sử dụng</option>
                    <option value="refurbished">Tân trang</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Mo ta + SEO */}
          {activeTab === 2 && (
            <div className="space-y-6">
              <div className="bg-white border rounded-lg p-6 space-y-4">
                <h2 className="font-medium text-base">Mô tả sản phẩm</h2>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Mô tả chi tiết (HTML)</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                    rows={10}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    maxLength={3000}
                  />
                  <span className="text-xs text-gray-400 mt-1 block text-right">{form.description.length}/3000</span>
                </div>
              </div>

              <div className="bg-white border rounded-lg p-6 space-y-4">
                <h2 className="font-medium text-base">SEO</h2>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Slug (URL)</label>
                  <input
                    value={form.slug}
                    onChange={(e) => set('slug', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono text-gray-600"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">SEO Title</label>
                  <input
                    value={form.seoTitle}
                    onChange={(e) => set('seoTitle', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    maxLength={60}
                  />
                  <span className="text-xs text-gray-400 mt-1 block text-right">{form.seoTitle.length}/60</span>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">SEO Description</label>
                  <textarea
                    value={form.seoDesc}
                    onChange={(e) => set('seoDesc', e.target.value)}
                    rows={2}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    maxLength={160}
                  />
                  <span className="text-xs text-gray-400 mt-1 block text-right">{form.seoDesc.length}/160</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Thong tin ban hang — Variant Generator + Bang variants */}
          {activeTab === 3 && (
            <div className="space-y-6">
              {/* Variant Generator */}
              <div className="bg-white border rounded-lg p-6 space-y-4">
                <h2 className="font-medium text-base">Tạo biến thể (Màu x Size)</h2>

                {/* Chon mau sac */}
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Chọn màu sắc</label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((c) => (
                      <button
                        key={c.catColorId}
                        type="button"
                        onClick={() => toggleColor(c.catColorId)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition ${
                          selectedColors.includes(c.catColorId)
                            ? 'border-[#ee4d2d] bg-[#ee4d2d] text-white'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: c.catColorHex }} />
                        {c.catColorName}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chon nhom size */}
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Nhóm kích thước</label>
                  <select
                    value={selectedSizeGroup}
                    onChange={(e) => setSelectedSizeGroup(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">-- Không chọn --</option>
                    {sizeGroups.map((g) => (
                      <option key={g.catSizeGroupId} value={g.catSizeGroupId}>
                        {g.catSizeGroupName} ({g.catSizeGroupValues})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Chon tung size */}
                {availableSizes.length > 0 && (
                  <div>
                    <label className="text-xs text-gray-500 mb-2 block">Chọn size</label>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map((s) => (
                        <button
                          key={s.catSizeId}
                          type="button"
                          onClick={() => toggleSize(s.catSizeId)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                            selectedSizes.includes(s.catSizeId)
                              ? 'border-[#ee4d2d] bg-[#ee4d2d] text-white'
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          {s.catSizeValue}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gia mac dinh */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Giá bán mặc định</label>
                    <input
                      type="number"
                      value={defaultPrice}
                      onChange={(e) => setDefaultPrice(Number(e.target.value))}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Giá vốn mặc định</label>
                    <input
                      type="number"
                      value={defaultCost}
                      onChange={(e) => setDefaultCost(Number(e.target.value))}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      min={0}
                    />
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={generating || (selectedColors.length === 0 && selectedSizes.length === 0)}
                  className="px-4 py-2 bg-[#ee4d2d] text-white rounded-lg hover:bg-[#d73211] disabled:opacity-50 text-sm font-medium transition"
                >
                  {generating ? 'Đang tạo...' : `Tạo ${Math.max(selectedColors.length, 1) * Math.max(selectedSizes.length, 1)} biến thể`}
                </button>
              </div>

              {/* Bang variants — editable gia */}
              {variants.length > 0 && (
                <div className="bg-white border rounded-lg p-6">
                  <h2 className="font-medium mb-4">Biến thể ({variants.length})</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">SKU</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">Màu</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">Size</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-600">Giá bán</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-600">Giá so sánh</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-600">Giá vốn</th>
                          <th className="px-3 py-2 text-center font-medium text-gray-600">TT</th>
                          <th className="px-3 py-2 text-center font-medium text-gray-600"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {variants.map((v) => {
                          const editing = editingVariants[v.catProductVariantId];
                          return (
                            <tr key={v.catProductVariantId} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-mono text-xs">{v.catProductVariantSku}</td>
                              <td className="px-3 py-2">
                                {v.color ? (
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: v.color.catColorHex }} />
                                    {v.color.catColorName}
                                  </span>
                                ) : (v.catProductVariantColor || '-')}
                              </td>
                              <td className="px-3 py-2">{v.size?.catSizeValue || v.catProductVariantSize || '-'}</td>
                              <td className="px-3 py-2 text-right">
                                <input
                                  type="number"
                                  defaultValue={v.catProductVariantPrice}
                                  onChange={(e) => setEditingVariants((prev) => ({
                                    ...prev,
                                    [v.catProductVariantId]: {
                                      ...prev[v.catProductVariantId],
                                      catProductVariantPrice: Number(e.target.value),
                                    },
                                  }))}
                                  className="w-24 border rounded px-2 py-1 text-right text-xs"
                                  min={0}
                                />
                              </td>
                              <td className="px-3 py-2 text-right">
                                <input
                                  type="number"
                                  defaultValue={v.catProductVariantComparePrice}
                                  onChange={(e) => setEditingVariants((prev) => ({
                                    ...prev,
                                    [v.catProductVariantId]: {
                                      ...prev[v.catProductVariantId],
                                      catProductVariantComparePrice: Number(e.target.value),
                                    },
                                  }))}
                                  className="w-24 border rounded px-2 py-1 text-right text-xs"
                                  min={0}
                                />
                              </td>
                              <td className="px-3 py-2 text-right">
                                <input
                                  type="number"
                                  defaultValue={v.catProductVariantCost}
                                  onChange={(e) => setEditingVariants((prev) => ({
                                    ...prev,
                                    [v.catProductVariantId]: {
                                      ...prev[v.catProductVariantId],
                                      catProductVariantCost: Number(e.target.value),
                                    },
                                  }))}
                                  className="w-24 border rounded px-2 py-1 text-right text-xs"
                                  min={0}
                                />
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span className={`inline-block w-2 h-2 rounded-full ${v.catProductVariantStatus === 1 ? 'bg-green-500' : 'bg-gray-300'}`} />
                              </td>
                              <td className="px-3 py-2 text-center space-x-1">
                                {editing && (
                                  <button
                                    onClick={() => handleVariantSave(v.catProductVariantId)}
                                    className="text-xs text-[#ee4d2d] hover:underline"
                                  >
                                    Lưu
                                  </button>
                                )}
                                <button
                                  onClick={() => handleVariantDelete(v.catProductVariantId)}
                                  className="text-xs text-red-500 hover:underline"
                                >
                                  Xóa
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Van chuyen */}
          {activeTab === 4 && (
            <div className="bg-white border rounded-lg p-6 space-y-4">
              <h2 className="font-medium text-base">Vận chuyển</h2>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Cân nặng (g)</label>
                <input
                  type="number"
                  value={form.weight}
                  onChange={(e) => set('weight', Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  min={0}
                  placeholder="VD: 200"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-2 block">Kích thước đóng gói (cm)</label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Dài</label>
                    <input
                      type="number"
                      value={form.length}
                      onChange={(e) => set('length', Number(e.target.value))}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Rộng</label>
                    <input
                      type="number"
                      value={form.width}
                      onChange={(e) => set('width', Number(e.target.value))}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Cao</label>
                    <input
                      type="number"
                      value={form.height}
                      onChange={(e) => set('height', Number(e.target.value))}
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      min={0}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="text-xs text-gray-500 mb-2 block">Hàng đặt trước (Pre-order)</label>
                <div className="flex items-center gap-4 mb-3">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="preOrder"
                      checked={form.preOrder === 0}
                      onChange={() => set('preOrder', 0)}
                      className="accent-[#ee4d2d]"
                    />
                    Không
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="preOrder"
                      checked={form.preOrder === 1}
                      onChange={() => set('preOrder', 1)}
                      className="accent-[#ee4d2d]"
                    />
                    Đồng ý
                  </label>
                </div>
                {form.preOrder === 1 && (
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Số ngày chuẩn bị (5-15 ngày)</label>
                    <input
                      type="number"
                      value={form.preOrderDays}
                      onChange={(e) => set('preOrderDays', Math.min(15, Math.max(5, Number(e.target.value))))}
                      className="w-32 border rounded-lg px-3 py-2 text-sm"
                      min={5}
                      max={15}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 5: Thong tin khac */}
          {activeTab === 5 && (
            <div className="bg-white border rounded-lg p-6 space-y-4">
              <h2 className="font-medium text-base">Thông tin khác</h2>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Trạng thái</label>
                <select
                  value={form.status}
                  onChange={(e) => set('status', Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value={1}>Đang bán</option>
                  <option value={0}>Ẩn</option>
                  <option value={2}>Hết hàng</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!form.isFeatured}
                    onChange={(e) => set('isFeatured', e.target.checked ? 1 : 0)}
                    className="accent-[#ee4d2d]"
                  />
                  Sản phẩm nổi bật
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!form.isNew}
                    onChange={(e) => set('isNew', e.target.checked ? 1 : 0)}
                    className="accent-[#ee4d2d]"
                  />
                  Sản phẩm mới
                </label>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Product ID</span>
                  <span className="font-mono text-xs text-gray-600">{product.catProductId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Ngày tạo</span>
                  <span className="text-gray-600">
                    {product.createdDate ? new Date(product.createdDate).toLocaleDateString('vi-VN') : '-'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar — luon hien thi */}
        <div className="space-y-6">
          {/* Content Quality Score */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="font-medium mb-3">Cấp độ Nội dung</h2>
            {/* Progress bar */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${qualityScore.color}`}>{qualityScore.level}</span>
                <span className="text-xs text-gray-400">{qualityScore.score}/{qualityScore.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${qualityScore.bgColor}`}
                  style={{ width: `${(qualityScore.score / qualityScore.total) * 100}%` }}
                />
              </div>
            </div>
            {/* Checklist */}
            <ul className="mt-4 space-y-2">
              {qualityScore.checks.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className={`mt-0.5 text-base leading-none ${item.passed ? 'text-green-500' : 'text-gray-300'}`}>
                    {item.passed ? '\u2705' : '\u2B1C'}
                  </span>
                  <span className={item.passed ? 'text-gray-700' : 'text-gray-400'}>{item.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Status panel */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="font-medium mb-2">Thông tin</h2>
            <dl className="text-xs space-y-1.5 text-gray-500">
              <div className="flex justify-between">
                <dt>Trạng thái</dt>
                <dd className="font-medium text-gray-700">
                  {form.status === 1 ? 'Đang bán' : form.status === 0 ? 'Ẩn' : 'Hết hàng'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Danh mục</dt>
                <dd className="font-medium text-gray-700">{product.category?.catCategoryName || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Biến thể</dt>
                <dd className="font-medium text-gray-700">{variants.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Nổi bật</dt>
                <dd className="font-medium text-gray-700">{form.isFeatured ? 'Có' : 'Không'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
