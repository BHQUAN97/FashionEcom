'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';
import { useAdminFetch } from '@/lib/hooks/use-admin-fetch';

interface Category {
  catCategoryId: string;
  catCategoryName: string;
  catCategoryCode: string;
}

const TABS = [
  'Thông tin cơ bản',
  'Thông tin chi tiết',
  'Mô tả',
  'Vận chuyển',
  'Thông tin khác',
];

/**
 * Tao san pham moi — layout multi-tab giong Shopee Seller Center
 * Sau khi tao xong redirect sang trang chi tiet de them variants
 */
export default function CreateProductPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const { data: catData } = useAdminFetch<Category[] | { data: Category[] }>({ url: '/admin/categories' });
  const categories = Array.isArray(catData) ? catData : (catData as { data: Category[] } | null)?.data || [];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', code: '', categoryId: '', description: '', shortDesc: '',
    brand: '', slug: '', seoTitle: '', seoDesc: '',
    status: 1, isFeatured: 0, isNew: 1,
    origin: '', material: '', packagingType: '', condition: 'new',
    weight: 0, length: 0, width: 0, height: 0,
    preOrder: 0, preOrderDays: 7,
  });

  const set = (key: string, value: string | number) => setForm({ ...form, [key]: value });

  // Tu dong tao slug tu ten
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setForm({ ...form, name, slug: generateSlug(name) });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.code || !form.categoryId) {
      setError('Vui lòng điền tên, mã SP và danh mục');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post<{ catProductId: string }>('/admin/products', form);
      router.push(`/admin/san-pham/${res.data.catProductId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi tạo sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  // Tinh diem chat luong noi dung
  const qualityScore = useMemo(() => {
    const checks = [
      { label: 'Tên SP 25~100 ký tự', passed: form.name.length >= 25 && form.name.length <= 100 },
      { label: 'Đã chọn danh mục', passed: !!form.categoryId },
      { label: 'Thêm mô tả >= 100 ký tự', passed: form.description.length >= 100 },
      { label: 'Thêm thông tin chi tiết (brand/origin/material)', passed: !!(form.brand || form.origin || form.material) },
      { label: 'Cân nặng > 0', passed: form.weight > 0 },
    ];
    const score = checks.filter((c) => c.passed).length;
    let level: string;
    let color: string;
    let bgColor: string;
    if (score >= 4) {
      level = 'Xuất sắc';
      color = 'text-green-600';
      bgColor = 'bg-green-500';
    } else if (score >= 2) {
      level = 'Đạt chuẩn';
      color = 'text-yellow-600';
      bgColor = 'bg-yellow-500';
    } else {
      level = 'Cần cải thiện';
      color = 'text-red-600';
      bgColor = 'bg-red-500';
    }
    return { checks, score, total: checks.length, level, color, bgColor };
  }, [form.name, form.categoryId, form.description, form.brand, form.origin, form.material, form.weight]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <button onClick={() => router.push('/admin/san-pham')} className="text-sm text-gray-500 hover:underline mb-1 block">
            &larr; Quay lại danh sách
          </button>
          <h1 className="text-2xl font-bold">Thêm sản phẩm mới</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-[#ee4d2d] text-white rounded-lg hover:bg-[#d73211] disabled:opacity-50 text-sm font-medium transition"
          >
            {loading ? 'Đang tạo...' : 'Lưu & Hiển thị'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      {/* Tab Navigation */}
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
        {/* Tab Content */}
        <div className="lg:col-span-2">

          {/* Tab 0: Thong tin co ban */}
          {activeTab === 0 && (
            <div className="bg-white border rounded-lg p-6 space-y-4">
              <h2 className="font-medium text-base">Thông tin cơ bản</h2>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Tên sản phẩm *</label>
                <input
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Tên sản phẩm + Thương hiệu + Model + Thông số kỹ thuật"
                  maxLength={255}
                />
                <span className="text-xs text-gray-400 mt-1 block text-right">{form.name.length}/255</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Mã sản phẩm *</label>
                  <input
                    value={form.code}
                    onChange={(e) => set('code', e.target.value.toUpperCase())}
                    className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                    placeholder="VD: AT-003"
                    maxLength={20}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Thương hiệu</label>
                  <input
                    value={form.brand}
                    onChange={(e) => set('brand', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="VD: FashionEcom"
                  />
                </div>
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
                  placeholder="1-2 dòng mô tả ngắn"
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
                    placeholder="Nhập mô tả sản phẩm hoặc tải lên hình ảnh"
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

          {/* Tab 3: Van chuyen */}
          {activeTab === 3 && (
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

          {/* Tab 4: Thong tin khac */}
          {activeTab === 4 && (
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
              <p className="text-xs text-gray-400 border-t pt-4">
                Sau khi tạo, bạn có thể thêm biến thể (màu/size/giá) và hình ảnh tại trang chi tiết sản phẩm.
              </p>
            </div>
          )}
        </div>

        {/* Sidebar — Content Quality Score */}
        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-6">
            <h2 className="font-medium mb-3">Cấp độ Nội dung</h2>
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

          <div className="bg-white border rounded-lg p-6">
            <h2 className="font-medium mb-2">Gợi ý</h2>
            <ul className="text-xs text-gray-500 space-y-1.5">
              <li>Thêm ít nhất 3 hình ảnh sản phẩm</li>
              <li>Tên SP có ít nhất 25~100 ký tự</li>
              <li>Thêm ít nhất 100 ký tự trong mô tả</li>
              <li>Thêm thông tin Thương hiệu</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
