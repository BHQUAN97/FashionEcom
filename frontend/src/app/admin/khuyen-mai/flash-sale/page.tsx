'use client';

import { useState } from 'react';
import { api } from '@/lib/api/client';
import { useAdminFetch } from '@/lib/hooks/use-admin-fetch';
import { AdminTableLayout } from '@/components/admin/shared/AdminTableLayout';
import { StatusBadge } from '@/components/admin/shared/StatusBadge';
import { EmptyTableRow } from '@/components/admin/shared/EmptyTableRow';
import { ConfirmDialog } from '@/components/admin/shared/ConfirmDialog';

interface FlashSaleItem {
  prmFlashSaleItemId: string;
  catProductId: string;
  prmFlashSaleItemDiscountPct: number;
  prmFlashSaleItemMaxQty: number;
  prmFlashSaleItemSoldQty: number;
}

interface FlashSale {
  prmFlashSaleId: string;
  prmFlashSaleTitle: string;
  prmFlashSaleStartDate: string;
  prmFlashSaleEndDate: string;
  prmFlashSaleStatus: number;
  items: FlashSaleItem[];
}

const STATUS_LABELS: Record<number, string> = { 0: 'Draft', 1: 'Scheduled', 2: 'Active', 3: 'Ended' };
const FLASH_SALE_STATUS_COLORS: Record<number, string> = {
  0: 'bg-gray-100 text-gray-600',
  1: 'bg-blue-100 text-blue-700',
  2: 'bg-green-100 text-green-700',
  3: 'bg-red-100 text-red-700',
};

/**
 * Admin Flash Sale Manager — CRUD, product selection, stock tracking
 */
export default function FlashSalePage() {
  const { data, loading, refetch } = useAdminFetch<{ data: FlashSale[]; pagination: unknown }>({ url: '/admin/promotions/flash-sales' });
  const flashSales = data?.data || [];

  const [confirmState, setConfirmState] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', startDate: '', endDate: '', status: 0,
    items: [{ productId: '', discountPct: 10, maxQty: 100 }] as Array<{ productId: string; discountPct: number; maxQty: number }>,
  });

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { productId: '', discountPct: 10, maxQty: 100 }] });
  };

  const updateItem = (index: number, key: string, value: string | number) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [key]: value };
    setForm({ ...form, items: newItems });
  };

  const removeItem = (index: number) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) });
  };

  const handleSubmit = async () => {
    const payload = {
      title: form.title,
      startDate: form.startDate,
      endDate: form.endDate,
      status: form.status,
      items: form.items.filter(i => i.productId),
    };

    if (editId) {
      await api.put(`/admin/promotions/flash-sales/${editId}`, payload);
    } else {
      await api.post('/admin/promotions/flash-sales', payload);
    }
    setShowForm(false);
    setEditId(null);
    refetch();
  };

  const handleConfirmDelete = async () => {
    if (confirmState.id) {
      await api.delete(`/admin/promotions/flash-sales/${confirmState.id}`);
      refetch();
    }
    setConfirmState({ open: false, id: null });
  };

  const getTotalProgress = (fs: FlashSale) => {
    const totalMax = fs.items.reduce((sum, i) => sum + i.prmFlashSaleItemMaxQty, 0);
    const totalSold = fs.items.reduce((sum, i) => sum + i.prmFlashSaleItemSoldQty, 0);
    if (totalMax === 0) return 0;
    return Math.round((totalSold / totalMax) * 100);
  };

  return (
    <AdminTableLayout
      title="Flash Sale"
      actions={
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ title: '', startDate: '', endDate: '', status: 0, items: [{ productId: '', discountPct: 10, maxQty: 100 }] }); }} className="px-4 py-2 bg-black text-white text-sm rounded">
          + Tao Flash Sale
        </button>
      }
      loading={loading}
    >
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Tieu de</th>
              <th className="text-left px-4 py-3 font-medium">Thoi gian</th>
              <th className="text-left px-4 py-3 font-medium">Trang thai</th>
              <th className="text-left px-4 py-3 font-medium">SP</th>
              <th className="text-left px-4 py-3 font-medium">Da ban</th>
              <th className="text-right px-4 py-3 font-medium">Hanh dong</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {flashSales.map(fs => (
              <tr key={fs.prmFlashSaleId} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{fs.prmFlashSaleTitle}</td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(fs.prmFlashSaleStartDate).toLocaleString('vi')} → {new Date(fs.prmFlashSaleEndDate).toLocaleString('vi')}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    status={fs.prmFlashSaleStatus}
                    label={STATUS_LABELS[fs.prmFlashSaleStatus]}
                    colors={FLASH_SALE_STATUS_COLORS}
                  />
                </td>
                <td className="px-4 py-3 text-gray-500">{fs.items?.length || 0} SP</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${getTotalProgress(fs)}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{getTotalProgress(fs)}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setEditId(fs.prmFlashSaleId); setForm({ title: fs.prmFlashSaleTitle, startDate: fs.prmFlashSaleStartDate.slice(0, 16), endDate: fs.prmFlashSaleEndDate.slice(0, 16), status: fs.prmFlashSaleStatus, items: fs.items.map(i => ({ productId: i.catProductId, discountPct: Number(i.prmFlashSaleItemDiscountPct), maxQty: i.prmFlashSaleItemMaxQty })) }); setShowForm(true); }} className="text-blue-600 hover:underline text-xs mr-2">Sua</button>
                  <button onClick={() => setConfirmState({ open: true, id: fs.prmFlashSaleId })} className="text-red-600 hover:underline text-xs">Xoa</button>
                </td>
              </tr>
            ))}
            {flashSales.length === 0 && <EmptyTableRow colSpan={6} />}
          </tbody>
        </table>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg space-y-3 max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold">{editId ? 'Sua Flash Sale' : 'Tao Flash Sale moi'}</h2>

            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Tieu de flash sale" className="w-full border rounded px-3 py-2 text-sm" />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Bat dau</label>
                <input type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Ket thuc</label>
                <input type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
            </div>

            <select value={form.status} onChange={(e) => setForm({ ...form, status: Number(e.target.value) })} className="w-full border rounded px-3 py-2 text-sm">
              <option value={0}>Draft</option>
              <option value={1}>Scheduled</option>
              <option value={2}>Active</option>
            </select>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">San pham ({form.items.length})</h3>
                <button onClick={addItem} className="text-xs px-2 py-1 border rounded">+ Them SP</button>
              </div>
              {form.items.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={item.productId} onChange={(e) => updateItem(i, 'productId', e.target.value)} placeholder="Product ID" className="flex-1 text-sm border rounded px-2 py-1 font-mono" />
                  <input type="number" value={item.discountPct} onChange={(e) => updateItem(i, 'discountPct', Number(e.target.value))} className="w-16 text-sm border rounded px-2 py-1" />
                  <span className="text-xs text-gray-400">%</span>
                  <input type="number" value={item.maxQty} onChange={(e) => updateItem(i, 'maxQty', Number(e.target.value))} className="w-16 text-sm border rounded px-2 py-1" />
                  <span className="text-xs text-gray-400">SL</span>
                  <button onClick={() => removeItem(i)} className="text-red-500 text-xs">X</button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded text-sm">Huy</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-black text-white rounded text-sm">Luu</button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={confirmState.open}
        title="Xac nhan xoa"
        message="Ban co chac chan muon xoa flash sale nay? Hanh dong nay khong the hoan tac."
        variant="danger"
        confirmLabel="Xoa"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmState({ open: false, id: null })}
      />
    </AdminTableLayout>
  );
}
