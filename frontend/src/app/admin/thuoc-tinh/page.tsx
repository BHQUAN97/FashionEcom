'use client';

import { useState } from 'react';
import { api } from '@/lib/api/client';
import { useAdminFetch } from '@/lib/hooks/use-admin-fetch';
import { AdminTableLayout } from '@/components/admin/shared/admin-table-layout';
import { EmptyTableRow } from '@/components/admin/shared/empty-table-row';
import { ConfirmDialog } from '@/components/admin/shared/confirm-dialog';

/* ======== Types ======== */
interface Color {
  catColorId: string;
  catColorName: string;
  catColorHex: string;
  catColorSort: number;
  catColorStatus: number;
}

interface SizeGroup {
  catSizeGroupId: string;
  catSizeGroupName: string;
  catSizeGroupValues: string[];
  catSizeGroupGuide: string | null;
  catSizeGroupSort: number;
}

type Tab = 'colors' | 'sizes';

/* ======== Color Panel ======== */
function ColorsPanel() {
  const { data, loading, refetch } = useAdminFetch<{ data: Color[] }>({ url: '/admin/attributes/colors' });
  const colors = data?.data || [];

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', hex: '#000000', sort: 0 });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [confirmState, setConfirmState] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const openCreate = () => {
    setEditId(null);
    setForm({ name: '', hex: '#000000', sort: colors.length });
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (c: Color) => {
    setEditId(c.catColorId);
    setForm({ name: c.catColorName, hex: c.catColorHex, sort: c.catColorSort });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.hex) { setFormError('Ten va ma mau la bat buoc'); return; }
    if (!/^#[0-9a-fA-F]{6}$/.test(form.hex)) { setFormError('Ma mau phai co format #RRGGBB'); return; }
    setFormLoading(true);
    setFormError('');
    try {
      if (editId) {
        await api.put(`/admin/attributes/colors/${editId}`, form);
      } else {
        await api.post('/admin/attributes/colors', form);
      }
      setShowForm(false);
      refetch();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Loi');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirmState.id) {
      await api.delete(`/admin/attributes/colors/${confirmState.id}`);
      refetch();
    }
    setConfirmState({ open: false, id: null });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{colors.length} mau sac</p>
        <button onClick={openCreate} className="px-4 py-2 bg-[#ee4d2d] text-white rounded-lg hover:bg-[#d73211] text-sm">
          Them mau sac
        </button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600 w-12">Mau</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Ten</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Ma HEX</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Thu tu</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Thao tac</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {colors.map((c) => (
              <tr key={c.catColorId} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div
                    className="w-7 h-7 rounded-full border border-gray-200"
                    style={{ backgroundColor: c.catColorHex }}
                  />
                </td>
                <td className="px-4 py-3 font-medium">{c.catColorName}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.catColorHex}</td>
                <td className="px-4 py-3 text-center">{c.catColorSort}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(c)} className="text-[#ee4d2d] hover:underline text-xs mr-2">Sua</button>
                  <button onClick={() => setConfirmState({ open: true, id: c.catColorId })} className="text-red-600 hover:underline text-xs">Xoa</button>
                </td>
              </tr>
            ))}
            {!loading && colors.length === 0 && (
              <EmptyTableRow colSpan={5} message="Chua co mau sac nao" />
            )}
          </tbody>
        </table>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm space-y-4">
            <h2 className="font-bold text-lg">{editId ? 'Sua mau sac' : 'Them mau sac moi'}</h2>
            {formError && <div className="p-2 bg-red-50 text-red-700 rounded text-sm">{formError}</div>}

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Ten mau *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="VD: Den, Xanh Navy" />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Ma HEX *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.hex}
                    onChange={(e) => setForm({ ...form, hex: e.target.value })}
                    className="w-10 h-10 rounded border cursor-pointer"
                  />
                  <input
                    value={form.hex}
                    onChange={(e) => setForm({ ...form, hex: e.target.value })}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm font-mono"
                    placeholder="#000000"
                  />
                </div>
              </div>
              <div className="w-20">
                <label className="text-xs text-gray-500 mb-1 block">Thu tu</label>
                <input type="number" value={form.sort} onChange={(e) => setForm({ ...form, sort: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm">Huy</button>
              <button onClick={handleSubmit} disabled={formLoading} className="px-4 py-2 bg-[#ee4d2d] text-white rounded-lg hover:bg-[#d73211] disabled:opacity-50 text-sm">
                {formLoading ? 'Dang luu...' : 'Luu'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmState.open}
        title="Xac nhan xoa"
        message="Xoa mau sac nay? San pham co mau nay se mat lien ket."
        variant="danger"
        confirmLabel="Xoa"
        onConfirm={handleDelete}
        onCancel={() => setConfirmState({ open: false, id: null })}
      />
    </>
  );
}

/* ======== Size Group Panel ======== */
function SizesPanel() {
  const { data, loading, refetch } = useAdminFetch<{ data: SizeGroup[] }>({ url: '/admin/attributes/sizes' });
  const groups = data?.data || [];

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', values: '', guide: '', sort: 0 });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [confirmState, setConfirmState] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const openCreate = () => {
    setEditId(null);
    setForm({ name: '', values: '', guide: '', sort: groups.length });
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (g: SizeGroup) => {
    setEditId(g.catSizeGroupId);
    setForm({
      name: g.catSizeGroupName,
      values: g.catSizeGroupValues.join(', '),
      guide: g.catSizeGroupGuide || '',
      sort: g.catSizeGroupSort,
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.values.trim()) { setFormError('Ten nhom va cac gia tri size la bat buoc'); return; }
    const valuesArr = form.values.split(',').map(v => v.trim()).filter(Boolean);
    if (valuesArr.length === 0) { setFormError('Nhap it nhat 1 gia tri size'); return; }
    setFormLoading(true);
    setFormError('');
    try {
      const payload = { name: form.name, values: valuesArr, guide: form.guide || undefined, sort: form.sort };
      if (editId) {
        await api.put(`/admin/attributes/sizes/${editId}`, payload);
      } else {
        await api.post('/admin/attributes/sizes', payload);
      }
      setShowForm(false);
      refetch();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Loi');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirmState.id) {
      await api.delete(`/admin/attributes/sizes/${confirmState.id}`);
      refetch();
    }
    setConfirmState({ open: false, id: null });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{groups.length} nhom size</p>
        <button onClick={openCreate} className="px-4 py-2 bg-[#ee4d2d] text-white rounded-lg hover:bg-[#d73211] text-sm">
          Them nhom size
        </button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Ten nhom</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Cac gia tri</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Thu tu</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Thao tac</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {groups.map((g) => (
              <tr key={g.catSizeGroupId} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{g.catSizeGroupName}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {g.catSizeGroupValues.map((v) => (
                      <span key={v} className="px-2 py-0.5 bg-gray-100 rounded text-xs">{v}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">{g.catSizeGroupSort}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(g)} className="text-[#ee4d2d] hover:underline text-xs mr-2">Sua</button>
                  <button onClick={() => setConfirmState({ open: true, id: g.catSizeGroupId })} className="text-red-600 hover:underline text-xs">Xoa</button>
                </td>
              </tr>
            ))}
            {!loading && groups.length === 0 && (
              <EmptyTableRow colSpan={4} message="Chua co nhom size nao" />
            )}
          </tbody>
        </table>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
            <h2 className="font-bold text-lg">{editId ? 'Sua nhom size' : 'Them nhom size moi'}</h2>
            {formError && <div className="p-2 bg-red-50 text-red-700 rounded text-sm">{formError}</div>}

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Ten nhom *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="VD: Ao (S-XXL), Quan (29-33)" />
              </div>
              <div className="w-20">
                <label className="text-xs text-gray-500 mb-1 block">Thu tu</label>
                <input type="number" value={form.sort} onChange={(e) => setForm({ ...form, sort: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Cac gia tri size * (cach nhau boi dau phay)</label>
              <input value={form.values} onChange={(e) => setForm({ ...form, values: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="S, M, L, XL, 2XL" />
              {form.values && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.values.split(',').map(v => v.trim()).filter(Boolean).map((v) => (
                    <span key={v} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{v}</span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Huong dan chon size (tuy chon)</label>
              <textarea value={form.guide} onChange={(e) => setForm({ ...form, guide: e.target.value })} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="VD: Size S: 40-55kg, M: 55-65kg..." />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm">Huy</button>
              <button onClick={handleSubmit} disabled={formLoading} className="px-4 py-2 bg-[#ee4d2d] text-white rounded-lg hover:bg-[#d73211] disabled:opacity-50 text-sm">
                {formLoading ? 'Dang luu...' : 'Luu'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmState.open}
        title="Xac nhan xoa"
        message="Xoa nhom size nay? San pham co size nay se mat lien ket."
        variant="danger"
        confirmLabel="Xoa"
        onConfirm={handleDelete}
        onCancel={() => setConfirmState({ open: false, id: null })}
      />
    </>
  );
}

/* ======== Main Page ======== */

/**
 * Admin Attributes — quan ly mau sac + size san pham
 * Backend: /admin/attributes/colors, /admin/attributes/sizes
 */
export default function AttributesPage() {
  const [tab, setTab] = useState<Tab>('colors');

  return (
    <AdminTableLayout title="Thuoc tinh san pham">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
        <button
          onClick={() => setTab('colors')}
          className={`px-4 py-2 text-sm rounded-md transition ${
            tab === 'colors' ? 'bg-white font-semibold shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Mau sac
        </button>
        <button
          onClick={() => setTab('sizes')}
          className={`px-4 py-2 text-sm rounded-md transition ${
            tab === 'sizes' ? 'bg-white font-semibold shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Kich co (Size)
        </button>
      </div>

      {tab === 'colors' ? <ColorsPanel /> : <SizesPanel />}
    </AdminTableLayout>
  );
}
