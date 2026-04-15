'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';

/**
 * Tao slug tu tieng Viet — bo dau, lowercase, thay khoang trang bang '-'
 */
function toSlug(str: string): string {
  return str
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Tao trang noi dung moi — form nhap thong tin + SEO
 */
export default function CreateCmsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', content: '',
    seoTitle: '', seoDescription: '',
    thumbnail: '', status: 1, sort: 0,
  });

  const set = (key: string, value: string | number) => setForm({ ...form, [key]: value });

  // Tu dong tao slug tu tieu de
  const handleTitleChange = (title: string) => {
    setForm({ ...form, title, slug: toSlug(title) });
  };

  const handleSubmit = async () => {
    if (!form.title) {
      setError('Vui lòng nhập tiêu đề trang');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/admin/layout/pages', form);
      router.push('/admin/trang-noi-dung');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi tạo trang');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Thêm trang nội dung</h1>
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:underline">&larr; Quay lại</button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Thong tin chinh */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border rounded-lg p-6 space-y-4">
            <h2 className="font-medium">Thông tin trang</h2>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Tiêu đề *</label>
              <input value={form.title} onChange={(e) => handleTitleChange(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="VD: Chính sách đổi trả" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Slug (URL)</label>
              <input value={form.slug} onChange={(e) => set('slug', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm font-mono text-gray-600" placeholder="chinh-sach-doi-tra" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Tóm tắt</label>
              <textarea value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Mô tả ngắn cho trang..." maxLength={500} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Nội dung (HTML)</label>
              <textarea value={form.content} onChange={(e) => set('content', e.target.value)} rows={12} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="<p>Nội dung trang...</p>" />
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white border rounded-lg p-6 space-y-4">
            <h2 className="font-medium">SEO</h2>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">SEO Title</label>
              <input value={form.seoTitle} onChange={(e) => set('seoTitle', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" maxLength={60} />
              <span className="text-xs text-gray-400">{form.seoTitle.length}/60</span>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">SEO Description</label>
              <textarea value={form.seoDescription} onChange={(e) => set('seoDescription', e.target.value)} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" maxLength={160} />
              <span className="text-xs text-gray-400">{form.seoDescription.length}/160</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border rounded-lg p-6 space-y-4">
            <h2 className="font-medium">Trạng thái</h2>
            <select value={form.status} onChange={(e) => set('status', Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value={1}>Hiển thị</option>
              <option value={0}>Ẩn</option>
            </select>
          </div>

          <div className="bg-white border rounded-lg p-6 space-y-4">
            <h2 className="font-medium">Ảnh đại diện</h2>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">URL ảnh</label>
              <input value={form.thumbnail} onChange={(e) => set('thumbnail', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="https://..." />
            </div>
            {form.thumbnail && (
              <img src={form.thumbnail} alt="Preview" className="w-full h-32 object-cover rounded-lg border" />
            )}
          </div>

          <div className="bg-white border rounded-lg p-6 space-y-4">
            <h2 className="font-medium">Thứ tự hiển thị</h2>
            <input type="number" value={form.sort} onChange={(e) => set('sort', Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 text-sm" min={0} />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full px-4 py-3 bg-[#ee4d2d] text-white rounded-lg hover:bg-[#d73211] disabled:opacity-50 text-sm font-medium"
          >
            {loading ? 'Đang tạo...' : 'Lưu trang'}
          </button>
        </div>
      </div>
    </div>
  );
}
