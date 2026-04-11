'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';

interface InventoryItem {
  invInventoryLevelId: string;
  catProductVariantId: string;
  invWarehouseId: string;
  invInventoryLevelAvailable: number;
  invInventoryLevelLocked: number;
}

interface Warehouse {
  invWarehouseId: string;
  invWarehouseCode: string;
  invWarehouseName: string;
}

/**
 * Admin Inventory — ton kho da kho, filter theo warehouse
 */
export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Warehouse[]>('/admin/inventory/warehouses').then((res) => {
      const data = Array.isArray(res.data) ? res.data : (res.data as any).data || [];
      setWarehouses(data);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = selectedWarehouse ? `?warehouseId=${selectedWarehouse}` : '';
    api.get<{ data: InventoryItem[] }>(`/admin/inventory${params}`).then((res) => {
      setItems(res.data.data || (res.data as unknown as InventoryItem[]));
    }).finally(() => setLoading(false));
  }, [selectedWarehouse]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Ton kho</h1>
        <div className="flex gap-3">
          <select
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Tat ca kho</option>
            {warehouses.map((w) => (
              <option key={w.invWarehouseId} value={w.invWarehouseId}>
                {w.invWarehouseCode} — {w.invWarehouseName}
              </option>
            ))}
          </select>
          <a href="/admin/ton-kho/dieu-chuyen" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            Dieu chuyen kho
          </a>
          <a href="/admin/ton-kho/nhap-kho" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
            Nhap kho
          </a>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Dang tai...</div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Variant ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Kho</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Kha dung</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Tam giu</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Tong</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item) => (
                <tr key={item.invInventoryLevelId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{item.catProductVariantId.substring(0, 8)}...</td>
                  <td className="px-4 py-3">{item.invWarehouseId.substring(0, 8)}...</td>
                  <td className="px-4 py-3 text-right font-medium">{Number(item.invInventoryLevelAvailable)}</td>
                  <td className="px-4 py-3 text-right text-orange-600">{Number(item.invInventoryLevelLocked)}</td>
                  <td className="px-4 py-3 text-right font-bold">
                    {Number(item.invInventoryLevelAvailable) + Number(item.invInventoryLevelLocked)}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Khong co du lieu ton kho</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
