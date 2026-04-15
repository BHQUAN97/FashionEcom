'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';
import { useAdminFetch } from '@/lib/hooks/use-admin-fetch';

interface Warehouse {
  invWarehouseId: string;
  invWarehouseCode: string;
  invWarehouseName: string;
}

interface ImportItem {
  sku: string;
  warehouseId: string;
  qty: number;
}

/**
 * Nhap kho — nhap so luong hang hoa vao kho theo SKU
 * Su dung API POST /admin/inventory/import
 */
export default function ImportInventoryPage() {
  const router = useRouter();
  const { data: whData } = useAdminFetch<Warehouse[] | { data: Warehouse[] }>({ url: '/admin/inventory/warehouses' });
  const warehouses = Array.isArray(whData) ? whData : (whData as { data: Warehouse[] } | null)?.data || [];

  const [items, setItems] = useState<ImportItem[]>([{ sku: '', warehouseId: '', qty: 0 }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const addRow = () => {
    // Copy warehouseId tu row cuoi de tien thao tac
    const lastWarehouse = items[items.length - 1]?.warehouseId || '';
    setItems([...items, { sku: '', warehouseId: lastWarehouse, qty: 0 }]);
  };

  const removeRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, key: keyof ImportItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [key]: value };
    setItems(newItems);
  };

  const handleSubmit = async () => {
    const validItems = items.filter(i => i.sku && i.warehouseId && i.qty > 0);
    if (validItems.length === 0) {
      setError('Can it nhat 1 dong hop le (SKU, kho, so luong > 0)');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/admin/inventory/import', { items: validItems });
      setSuccess(`Nhap kho thanh cong ${validItems.length} dong`);
      setItems([{ sku: '', warehouseId: '', qty: 0 }]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Loi nhap kho');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Nhập kho</h1>
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:underline">← Quay lại</button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">{success}</div>}

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600 w-12">#</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">SKU *</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Kho *</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600 w-32">Số lượng *</th>
              <th className="px-4 py-3 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item, i) => (
              <tr key={i}>
                <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                <td className="px-4 py-2">
                  <input
                    value={item.sku}
                    onChange={(e) => updateRow(i, 'sku', e.target.value.toUpperCase())}
                    placeholder="VD: AT001-DEN-M"
                    className="w-full border rounded px-2 py-1.5 text-sm font-mono"
                  />
                </td>
                <td className="px-4 py-2">
                  <select
                    value={item.warehouseId}
                    onChange={(e) => updateRow(i, 'warehouseId', e.target.value)}
                    className="w-full border rounded px-2 py-1.5 text-sm"
                  >
                    <option value="">-- Chon kho --</option>
                    {warehouses.map((w: Warehouse) => (
                      <option key={w.invWarehouseId} value={w.invWarehouseId}>
                        {w.invWarehouseCode} — {w.invWarehouseName}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2">
                  <input
                    type="number"
                    min={0}
                    value={item.qty || ''}
                    onChange={(e) => updateRow(i, 'qty', Number(e.target.value))}
                    className="w-full border rounded px-2 py-1.5 text-sm text-right"
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <button onClick={() => removeRow(i)} className="text-red-500 hover:text-red-700 text-xs" disabled={items.length <= 1}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <button onClick={addRow} className="px-4 py-2 border border-[#ee4d2d] text-[#ee4d2d] rounded-lg text-sm hover:bg-orange-50">
          + Thêm dòng
        </button>
        <div className="flex gap-3">
          <button onClick={() => router.push('/admin/ton-kho')} className="px-4 py-2 border rounded-lg text-sm">
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-[#ee4d2d] text-white rounded-lg hover:bg-[#d73211] disabled:opacity-50 text-sm font-medium"
          >
            {loading ? 'Đang nhập...' : 'Nhập kho'}
          </button>
        </div>
      </div>
    </div>
  );
}
