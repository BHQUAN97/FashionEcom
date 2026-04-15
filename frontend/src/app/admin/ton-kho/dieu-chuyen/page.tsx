'use client';

import { useState } from 'react';
import { api } from '@/lib/api/client';
import { useAdminFetch } from '@/lib/hooks/use-admin-fetch';
import { AdminTableLayout } from '@/components/admin/shared/admin-table-layout';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { EmptyTableRow } from '@/components/admin/shared/empty-table-row';

interface Transfer {
  invWarehouseTransferId: string;
  invWarehouseTransferCode: string;
  invWarehouseFromId: string;
  invWarehouseToId: string;
  invWarehouseTransferStatus: number;
  invWarehouseTransferReason: string | null;
  createdDate: string;
}

interface Warehouse {
  invWarehouseId: string;
  invWarehouseCode: string;
  invWarehouseName: string;
}

const STATUS_LABELS: Record<number, string> = {
  0: 'Draft', 1: 'Chờ xuất kho', 2: 'Đang vận chuyển', 3: 'Đã nhận', 4: 'Nhận 1 phần', 5: 'Hoàn thành',
};
const STATUS_BADGE_COLORS: Record<number, string> = {
  0: 'bg-gray-100 text-gray-700', 1: 'bg-yellow-100 text-yellow-700', 2: 'bg-blue-100 text-blue-700',
  3: 'bg-green-100 text-green-700', 4: 'bg-orange-100 text-orange-700', 5: 'bg-green-100 text-green-700',
};

interface TransferItem { variantId: string; qty: number }

/**
 * Admin Warehouse Transfer — danh sach + tao phieu dieu chuyen kho
 */
export default function WarehouseTransferPage() {
  const { data, loading, refetch } = useAdminFetch<{ data: Transfer[] }>({ url: '/admin/warehouse-transfers' });
  const transfers = data?.data || [];

  const { data: whData } = useAdminFetch<Warehouse[] | { data: Warehouse[] }>({ url: '/admin/inventory/warehouses' });
  const warehouses = Array.isArray(whData) ? whData : (whData as { data: Warehouse[] } | null)?.data || [];

  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({
    fromWarehouseId: '', toWarehouseId: '', reason: '',
    items: [{ variantId: '', qty: 0 }] as TransferItem[],
  });

  const openCreate = () => {
    setForm({ fromWarehouseId: '', toWarehouseId: '', reason: '', items: [{ variantId: '', qty: 0 }] });
    setFormError('');
    setShowForm(true);
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { variantId: '', qty: 0 }] });
  const removeItem = (i: number) => { if (form.items.length > 1) setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) }); };
  const updateItem = (i: number, key: keyof TransferItem, val: string | number) => {
    const items = [...form.items]; items[i] = { ...items[i], [key]: val }; setForm({ ...form, items });
  };

  const handleSubmit = async () => {
    if (!form.fromWarehouseId || !form.toWarehouseId) { setFormError('Chọn kho xuất và kho nhận'); return; }
    if (form.fromWarehouseId === form.toWarehouseId) { setFormError('Kho xuất và kho nhận phải khác nhau'); return; }
    const validItems = form.items.filter(i => i.variantId && i.qty > 0);
    if (validItems.length === 0) { setFormError('Cần ít nhất 1 sản phẩm hợp lệ'); return; }

    setFormLoading(true);
    setFormError('');
    try {
      await api.post('/admin/warehouse-transfers', {
        fromWarehouseId: form.fromWarehouseId,
        toWarehouseId: form.toWarehouseId,
        reason: form.reason || undefined,
        items: validItems,
      });
      setShowForm(false);
      refetch();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Lỗi tạo phiếu');
    } finally {
      setFormLoading(false);
    }
  };

  const getWarehouseName = (id: string) => warehouses.find((w: Warehouse) => w.invWarehouseId === id)?.invWarehouseCode || id.substring(0, 8);

  return (
    <AdminTableLayout
      title="Điều chuyển kho"
      actions={
        <button onClick={openCreate} className="px-4 py-2 bg-[#ee4d2d] text-white rounded-lg hover:bg-[#d73211] text-sm">
          Tạo phiếu mới
        </button>
      }
      loading={loading}
    >
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Mã phiếu</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Từ kho</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Đến kho</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Trạng thái</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Lý do</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Ngày tạo</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {transfers.map((t) => (
              <tr key={t.invWarehouseTransferId} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{t.invWarehouseTransferCode}</td>
                <td className="px-4 py-3">{getWarehouseName(t.invWarehouseFromId)}</td>
                <td className="px-4 py-3">{getWarehouseName(t.invWarehouseToId)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={t.invWarehouseTransferStatus} label={STATUS_LABELS[t.invWarehouseTransferStatus]} colors={STATUS_BADGE_COLORS} />
                </td>
                <td className="px-4 py-3 text-gray-500">{t.invWarehouseTransferReason || '-'}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(t.createdDate).toLocaleDateString('vi-VN')}</td>
              </tr>
            ))}
            {transfers.length === 0 && (
              <EmptyTableRow colSpan={6} message="Chưa có phiếu điều chuyển nào" />
            )}
          </tbody>
        </table>
      </div>

      {/* Form tao phieu moi */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="font-bold text-lg">Tạo phiếu điều chuyển</h2>
            {formError && <div className="p-2 bg-red-50 text-red-700 rounded text-sm">{formError}</div>}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Kho xuất *</label>
                <select value={form.fromWarehouseId} onChange={(e) => setForm({ ...form, fromWarehouseId: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">-- Chọn --</option>
                  {warehouses.map((w: Warehouse) => (
                    <option key={w.invWarehouseId} value={w.invWarehouseId}>{w.invWarehouseCode} — {w.invWarehouseName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Kho nhận *</label>
                <select value={form.toWarehouseId} onChange={(e) => setForm({ ...form, toWarehouseId: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                  <option value="">-- Chọn --</option>
                  {warehouses.map((w: Warehouse) => (
                    <option key={w.invWarehouseId} value={w.invWarehouseId}>{w.invWarehouseCode} — {w.invWarehouseName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Lý do</label>
              <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="VD: Cân bằng tồn kho" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">Sản phẩm ({form.items.length})</h3>
                <button onClick={addItem} className="text-xs px-2 py-1 border rounded">+ Thêm</button>
              </div>
              {form.items.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={item.variantId} onChange={(e) => updateItem(i, 'variantId', e.target.value)} placeholder="Variant ID" className="flex-1 text-sm border rounded px-2 py-1 font-mono" />
                  <input type="number" min={1} value={item.qty || ''} onChange={(e) => updateItem(i, 'qty', Number(e.target.value))} placeholder="SL" className="w-20 text-sm border rounded px-2 py-1 text-right" />
                  <button onClick={() => removeItem(i)} className="text-red-500 text-xs" disabled={form.items.length <= 1}>X</button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg text-sm">Hủy</button>
              <button onClick={handleSubmit} disabled={formLoading} className="px-4 py-2 bg-[#ee4d2d] text-white rounded-lg hover:bg-[#d73211] disabled:opacity-50 text-sm">
                {formLoading ? 'Đang tạo...' : 'Tạo phiếu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminTableLayout>
  );
}
