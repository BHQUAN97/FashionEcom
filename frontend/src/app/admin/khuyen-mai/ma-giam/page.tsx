'use client';

import { useState } from 'react';
import { api } from '@/lib/api/client';
import { useAdminFetch } from '@/lib/hooks/use-admin-fetch';
import { AdminTableLayout } from '@/components/admin/shared/AdminTableLayout';
import { StatusBadge } from '@/components/admin/shared/StatusBadge';
import { EmptyTableRow } from '@/components/admin/shared/EmptyTableRow';
import { ConfirmDialog } from '@/components/admin/shared/ConfirmDialog';

interface DiscountCode {
  prmDiscountId: string;
  prmDiscountCode: string;
  prmDiscountType: number;
  prmDiscountValue: number;
  prmDiscountMaxAmount: number;
  prmDiscountUsageCount: number;
  prmDiscountMaxUsage: number | null;
  prmDiscountStartDate: string | null;
  prmDiscountEndDate: string | null;
  prmDiscountStatus: number;
  prmDiscountStackable: number;
}

const TYPE_LABELS: Record<number, string> = { 1: '%', 2: 'VND' };
const STATUS_LABELS: Record<number, string> = { 0: 'Vo hieu', 1: 'Hoat dong' };

/**
 * Admin Discount Codes — CRUD, conditions, validation
 */
export default function DiscountCodesPage() {
  const { data, loading, refetch } = useAdminFetch<{ data: DiscountCode[]; pagination: unknown }>({ url: '/admin/promotions/discounts' });
  const discounts = data?.data || [];

  const [confirmState, setConfirmState] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: '', type: 1, value: 0, maxAmount: 0, maxUsage: '',
    maxPerCustomer: '', startDate: '', endDate: '', status: 1, stackable: 0,
    conditionsJson: '{}',
  });

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    setForm({ ...form, code });
  };

  const handleSubmit = async () => {
    let conditionsJson: Record<string, unknown> | undefined;
    try {
      conditionsJson = form.conditionsJson ? JSON.parse(form.conditionsJson) : undefined;
    } catch {
      conditionsJson = undefined;
    }

    const payload = {
      code: form.code,
      type: form.type,
      value: form.value,
      maxAmount: form.maxAmount || 0,
      maxUsage: form.maxUsage ? Number(form.maxUsage) : undefined,
      maxPerCustomer: form.maxPerCustomer ? Number(form.maxPerCustomer) : undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      status: form.status,
      stackable: form.stackable,
      conditionsJson,
    };

    if (editId) {
      await api.put(`/admin/promotions/discounts/${editId}`, payload);
    } else {
      await api.post('/admin/promotions/discounts', payload);
    }
    setShowForm(false);
    setEditId(null);
    refetch();
  };

  const handleConfirmDelete = async () => {
    if (confirmState.id) {
      await api.delete(`/admin/promotions/discounts/${confirmState.id}`);
      refetch();
    }
    setConfirmState({ open: false, id: null });
  };

  const formatValue = (d: DiscountCode) => {
    if (d.prmDiscountType === 1) return `${d.prmDiscountValue}%${d.prmDiscountMaxAmount > 0 ? ` (max ${d.prmDiscountMaxAmount.toLocaleString()}d)` : ''}`;
    return `${d.prmDiscountValue.toLocaleString()}d`;
  };

  return (
    <AdminTableLayout
      title="Ma giam gia"
      actions={
        <button onClick={() => { setShowForm(true); setEditId(null); generateCode(); }} className="px-4 py-2 bg-black text-white text-sm rounded">
          + Tao ma
        </button>
      }
      loading={loading}
    >
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Ma</th>
              <th className="text-left px-4 py-3 font-medium">Gia tri</th>
              <th className="text-left px-4 py-3 font-medium">Da dung</th>
              <th className="text-left px-4 py-3 font-medium">Thoi gian</th>
              <th className="text-left px-4 py-3 font-medium">Trang thai</th>
              <th className="text-right px-4 py-3 font-medium">Hanh dong</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {discounts.map(d => (
              <tr key={d.prmDiscountId} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-bold">{d.prmDiscountCode}</td>
                <td className="px-4 py-3">{formatValue(d)}</td>
                <td className="px-4 py-3 text-gray-500">
                  {d.prmDiscountUsageCount}{d.prmDiscountMaxUsage !== null ? ` / ${d.prmDiscountMaxUsage}` : ''}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {d.prmDiscountStartDate ? new Date(d.prmDiscountStartDate).toLocaleDateString('vi') : '-'}
                  {' → '}
                  {d.prmDiscountEndDate ? new Date(d.prmDiscountEndDate).toLocaleDateString('vi') : '∞'}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={d.prmDiscountStatus} label={STATUS_LABELS[d.prmDiscountStatus]} />
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setEditId(d.prmDiscountId); setForm({ code: d.prmDiscountCode, type: d.prmDiscountType, value: d.prmDiscountValue, maxAmount: d.prmDiscountMaxAmount, maxUsage: d.prmDiscountMaxUsage?.toString() || '', maxPerCustomer: '', startDate: d.prmDiscountStartDate || '', endDate: d.prmDiscountEndDate || '', status: d.prmDiscountStatus, stackable: d.prmDiscountStackable, conditionsJson: '{}' }); setShowForm(true); }} className="text-blue-600 hover:underline text-xs mr-2">Sua</button>
                  <button onClick={() => setConfirmState({ open: true, id: d.prmDiscountId })} className="text-red-600 hover:underline text-xs">Xoa</button>
                </td>
              </tr>
            ))}
            {discounts.length === 0 && <EmptyTableRow colSpan={6} />}
          </tbody>
        </table>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg space-y-3 max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold">{editId ? 'Sua ma giam gia' : 'Tao ma giam gia moi'}</h2>

            <div className="flex gap-2">
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="Ma giam gia" className="flex-1 border rounded px-3 py-2 text-sm font-mono" />
              <button onClick={generateCode} type="button" className="px-3 py-2 border rounded text-xs">Random</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Loai giam</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: Number(e.target.value) })} className="w-full border rounded px-3 py-2 text-sm">
                  <option value={1}>Phan tram (%)</option>
                  <option value={2}>So tien (VND)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500">Gia tri</label>
                <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
            </div>

            {form.type === 1 && (
              <div>
                <label className="text-xs text-gray-500">Giam toi da (VND)</label>
                <input type="number" value={form.maxAmount} onChange={(e) => setForm({ ...form, maxAmount: Number(e.target.value) })} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Gioi han luot</label>
                <input type="number" value={form.maxUsage} onChange={(e) => setForm({ ...form, maxUsage: e.target.value })} placeholder="Khong gioi han" className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Luot/KH</label>
                <input type="number" value={form.maxPerCustomer} onChange={(e) => setForm({ ...form, maxPerCustomer: e.target.value })} placeholder="Khong gioi han" className="w-full border rounded px-3 py-2 text-sm" />
              </div>
            </div>

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

            <div>
              <label className="text-xs text-gray-500">Dieu kien (JSON)</label>
              <textarea value={form.conditionsJson} onChange={(e) => setForm({ ...form, conditionsJson: e.target.value })} rows={3} className="w-full border rounded px-3 py-2 text-sm font-mono" placeholder='{"min_order_value": 300000}' />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!form.stackable} onChange={(e) => setForm({ ...form, stackable: e.target.checked ? 1 : 0 })} />
              Cho phep ket hop voi ma khac
            </label>

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
        message="Ban co chac chan muon xoa ma giam gia nay? Hanh dong nay khong the hoan tac."
        variant="danger"
        confirmLabel="Xoa"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmState({ open: false, id: null })}
      />
    </AdminTableLayout>
  );
}
