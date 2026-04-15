'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdminFetch } from '@/lib/hooks/use-admin-fetch';
import { api } from '@/lib/api/client';

interface CmsPageDetail {
  cmsPageId: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  thumbnail: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  status: number;
  sort: number;
  createdDate: string;
}

/**
 * Chi tiet / Sua trang noi dung — load data tu API, cho phep edit + save + delete
 */
export default function EditCmsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: pageRes, loading: loadingPage } = useAdminFetch<{ data: CmsPageDetail }>({ url: `/admin/layout/pages/${id}` });
  const page = pageRes?.data;

  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', content: '',
    seoTitle: '', seoDescription: '',
    thumbnail: '', status: 1, sort: 0,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync page data vao form khi load xong
  useEffect(() => {
    if (page && !initialized) {
      setForm({
        title: page.title || '',
        slug: page.slug || '',
        excerpt: page.excerpt || '',
        content: page.content || '',
        seoTitle: page.seoTitle || '',
        seoDescription: page.seoDescription || '',
        thumbnail: page.thumbnail || '',
        status: page.status ?? 1,
        sort: page.sort ?? 0,
      });
      setInitialized(true);
    }
  }, [page, initialized]);

  const set = (key: string, value: string | number) => setForm({ ...form, [key]: value });

  const handleSave = async () => {
    if (!form.title) {
      setError('Vui lòng nhập tiêu đề trang');
      return;
    }
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await api.put(`/admin/layout/pages/${id}`, form);
      setMessage('Đã lưu thành công');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi cập nhật trang');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/layout/pages/${id}`);
      router.push('/admin/trang-noi-dung');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi xóa trang');
      setShowDeleteConfirm(false);
    }
  };

  if (loadingPage) {
    return <div className="p-8 text-center text-gray-500">Đang tải...</div>;
  }

  if (!page) {
    return <div className="p-8 text-center text-red-500">Không tìm thấy trang</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={() => router.push('/admin/trang-noi-dung')} className="text-sm text-gray-500 hover:underline mb-1 block">&larr; Quay lại danh sách</button>
          <h1 className="text-2xl font-bold">{page.title}</h1>
          <p className="text-xs text-gray-400 mt-1 font-mono">/{page.slug} &bull; {id}</p>
        </div>
        <div className="flex items-center gap-3">
          {page.slug && (
            <a href={`/trang/${page.slug}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
              Xem trang
            </a>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-[#ee4d2d] text-white rounded-lg hover:bg-[#d73211] disabled:opacity-50 text-sm font-medium"
          >
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>

      {message && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{message}</div>}
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Thong tin chinh */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border rounded-lg p-6 space-y-4">
            <h2 className="font-medium">Thông tin trang</h2>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Tiêu đề *</label>
              <input value={form.title} onChange={(e) => set('title', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Slug (URL)</label>
              <input value={form.slug} onChange={(e) => set('slug', e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm font-mono text-gray-600" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Tóm tắt</label>
              <textarea value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" maxLength={500} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Nội dung (HTML)</label>
              <textarea value={form.content} onChange={(e) => set('content', e.target.value)} rows={12} className="w-full border rounded-lg px-3 py-2 text-sm" />
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

          <div className="bg-white border rounded-lg p-6">
            <h2 className="font-medium mb-2">Thông tin</h2>
            <dl className="text-xs space-y-1.5 text-gray-500">
              <div className="flex justify-between">
                <dt>Ngày tạo</dt>
                <dd className="font-medium text-gray-700">{page.createdDate ? new Date(page.createdDate).toLocaleDateString('vi-VN') : '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt>ID</dt>
                <dd className="font-medium text-gray-700 font-mono">{id}</dd>
              </div>
            </dl>
          </div>

          {/* Xoa trang */}
          <div className="bg-white border border-red-200 rounded-lg p-6">
            <h2 className="font-medium text-red-600 mb-2">Xóa trang</h2>
            <p className="text-xs text-gray-500 mb-3">Hành động này không thể hoàn tác.</p>
            {!showDeleteConfirm ? (
              <button onClick={() => setShowDeleteConfirm(true)} className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm">
                Xóa trang này
              </button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-red-600 font-medium">Bạn chắc chắn muốn xóa?</p>
                <div className="flex gap-2">
                  <button onClick={handleDelete} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                    Xác nhận xóa
                  </button>
                  <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm">
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
