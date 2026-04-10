'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';

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
const STATUS_COLORS: Record<number, string> = { 0: 'bg-gray-100 text-gray-600', 1: 'bg-green-100 text-green-700' };

/**
 * Admin Discount Codes — CRUD, conditions, validation
 */
export default function DiscountCodesPage() {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: '', type: 1, value: 0, maxAmount: 0, maxUsage: '',
    maxPerCustomer: '', startDate: '', endDate: '', status: 1, stackable: 0,
    conditionsJson: '{}',
  });

  const loadDiscounts = async () => {
    try {
      const res = await api.get<{ data: DiscountCode[]; pagination: unknown }>('/admin/promotions/discounts');
      setDiscounts(res.data.data || (res.data as unknown as DiscountCode[]));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDiscounts(); }, []);

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
    loadDiscounts();
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/admin/promotions/discounts/${id}`);
    loadDiscounts();
  };

  const formatValue = (d: DiscountCode) => {
    if (d.prmDiscountType === 1) return `${d.prmDiscountValue}%${d.prmDiscountMaxAmount > 0 ? ` (max ${d.prmDiscountMaxAmount.toLocaleString()}d)` : ''}`;
    return `${d.prmDiscountValue.toLocaleString()}d`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Ma giam gia</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); generateCode(); }} className="px-4 py-2 bg-black text-white text-sm rounded">
          + Tao ma
        </button>
      </div>

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
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[d.prmDiscountStatus]}`}>
                    {STATUS_LABELS[d.prmDiscountStatus]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setEditId(d.prmDiscountId); setForm({ code: d.prmDiscountCode, type: d.prmDiscountType, value: d.prmDiscountValue, maxAmount: d.prmDiscountMaxAmount, maxUsage: d.prmDiscountMaxUsage?.toString() || '', maxPerCustomer: '', startDate: d.prmDiscountStartDate || '', endDate: d.prmDiscountEndDate || '', status: d.prmDiscountStatus, stackable: d.prmDiscountStackable, conditionsJson: '{}' }); setShowForm(true); }} className="text-blue-600 hover:underline text-xs mr-2">Sua</button>
                  <button onClick={() => handleDelete(d.prmDiscountId)} className="text-red-600 hover:underline text-xs">Xoa</button>
                </td>
              </tr>
            ))}
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
    </div>
  );
}
