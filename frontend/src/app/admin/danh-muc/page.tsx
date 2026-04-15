'use client';

import { useState } from 'react';
import { api } from '@/lib/api/client';
import { useAdminFetch } from '@/lib/hooks/use-admin-fetch';
import { AdminTableLayout } from '@/components/admin/shared/admin-table-layout';
import { EmptyTableRow } from '@/components/admin/shared/empty-table-row';
import { ConfirmDialog } from '@/components/admin/shared/confirm-dialog';

interface Category {
  catCategoryId: string;
  catCategoryName: string;
  catCategoryCode: string;
  catCategorySlug: string;
  catCategoryParentId: string | null;
  catCategoryDescription: string | null;
  catCategoryStatus: number;
  catCategorySort: number;
}

/**
 * Admin Categories — CRUD danh muc san pham
 */
export default function CategoriesPage() {
  const { data, loading, refetch } = useAdminFetch<{ data: Category[] }>({ url: '/admin/categories' });
  const categories = data?.data || [];

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', slug: '', description: '', parentId: '' });

  const [confirmState, setConfirmState] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const generateSlug = (name: string) =>
    name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

  const openCreate = () => {
    setEditId(null);
    setForm({ code: '', name: '', slug: '', description: '', parentId: '' });
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (c: Category) => {
    setEditId(c.catCategoryId);
    setForm({
      code: c.catCategoryCode,
      name: c.catCategoryName,
      slug: c.catCategorySlug || '',
      description: c.catCategoryDescription || '',
      parentId: c.catCategoryParentId || '',
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.code || !form.name) { setFormError('Mã và tên danh mục là bắt buộc'); return; }
    setFormLoading(true);
    setFormError('');
    try {
      const payload = {
        code: form.code,
        name: form.name,
        slug: form.slug || generateSlug(form.name),
        description: form.description || undefined,
        parentId: form.parentId || undefined,
      };
      if (editId) {
        await api.put(`/admin/categories/${editId}`, payload);
      } else {
        await api.post('/admin/categories', payload);
      }
      setShowForm(false);
      refetch();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Lỗi');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirmState.id) {
      await api.delete(`/admin/categories/${confirmState.id}`);
      refetch();
    }
    setConfirmState({ open: false, id: null });
  };

  // Danh muc cha (chi level 0)
  const parentCategories = categories.filter(c => !c.catCategoryParentId);

  return (
    <AdminTableLayout
      title="Danh mục sản phẩm"
      actions={
        <button onClick={openCreate} className="px-4 py-2 bg-[#ee4d2d] text-white rounded-lg hover:bg-[#d73211] text-sm">
          Thêm danh mục
        </button>
      }
      loading={loading}
    >
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Mã</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Tên danh mục</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Slug</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Thứ tự</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Trạng thái</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((c) => (
              <tr key={c.catCategoryId} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{c.catCategoryCode}</td>
                <td className="px-4 py-3 font-medium">
                  {c.catCategoryParentId && <span className="text-gray-400 mr-1">└</span>}
                  {c.catCategoryName}
                </td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{c.catCategorySlug}</td>
                <td className="px-4 py-3 text-center">{c.catCategorySort}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.catCategoryStatus === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.catCategoryStatus === 1 ? 'Hiện' : 'Ẩn'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(c)} className="text-[#ee4d2d] hover:underline text-xs mr-2">Sửa</button>
                  <button onClick={() => setConfirmState({ open: true, id: c.catCategoryId })} className="text-red-600 hover:underline text-xs">Xóa</button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <EmptyTableRow colSpan={6} message="Chưa có danh mục nào" />
            )}
          </tbody>
        </table>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
            <h2 className="font-bold text-lg">{editId ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h2>
            {formError && <div className="p-2 bg-red-50 text-red-700 rounded text-sm">{formError}</div>}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Mã danh mục *</label>
                <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="w-full border rounded-lg px-3 py-2 text-sm font-mono" placeholder="VD: AO-THUN" maxLength={20} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Danh mục cha</label>
                <select value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">-- Gốc --</option>
                  {parentCategories.map(p => (
                    <option key={p.catCategoryId} value={p.catCategoryId}>{p.catCategoryName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Tên danh mục *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="VD: Áo Thun" maxLength={255} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Slug</label>
              <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm font-mono text-gray-600" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Mô tả</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm">Hủy</button>
              <button onClick={handleSubmit} disabled={formLoading} className="px-4 py-2 bg-[#ee4d2d] text-white rounded-lg hover:bg-[#d73211] disabled:opacity-50 text-sm">
                {formLoading ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmState.open}
        title="Xác nhận xóa"
        message="Xóa danh mục này? Sản phẩm trong danh mục sẽ mất liên kết."
        variant="danger"
        confirmLabel="Xóa"
        onConfirm={handleDelete}
        onCancel={() => setConfirmState({ open: false, id: null })}
      />
    </AdminTableLayout>
  );
}
