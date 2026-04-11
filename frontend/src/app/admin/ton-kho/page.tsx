'use client';

import { useState } from 'react';
import { useAdminFetch } from '@/lib/hooks/use-admin-fetch';
import { AdminTableLayout } from '@/components/admin/shared/admin-table-layout';
import { EmptyTableRow } from '@/components/admin/shared/empty-table-row';

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
  const [selectedWarehouse, setSelectedWarehouse] = useState('');

  const { data: whData } = useAdminFetch<Warehouse[] | { data: Warehouse[] }>({ url: '/admin/inventory/warehouses' });
  const warehouses = Array.isArray(whData) ? whData : (whData as any)?.data || [];

  const params = selectedWarehouse ? `?warehouseId=${selectedWarehouse}` : '';
  const { data: itemData, loading } = useAdminFetch<{ data: InventoryItem[] }>({ url: `/admin/inventory${params}` });
  const items = itemData?.data || [];

  return (
    <AdminTableLayout
      title="Ton kho"
      actions={
        <>
          <a href="/admin/ton-kho/dieu-chuyen" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            Dieu chuyen kho
          </a>
          <a href="/admin/ton-kho/nhap-kho" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
            Nhap kho
          </a>
        </>
      }
      filters={
        <select
          value={selectedWarehouse}
          onChange={(e) => setSelectedWarehouse(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Tat ca kho</option>
          {warehouses.map((w: Warehouse) => (
            <option key={w.invWarehouseId} value={w.invWarehouseId}>
              {w.invWarehouseCode} — {w.invWarehouseName}
            </option>
          ))}
        </select>
      }
      loading={loading}
    >
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
              <EmptyTableRow colSpan={5} message="Khong co du lieu ton kho" />
            )}
          </tbody>
        </table>
      </div>
    </AdminTableLayout>
  );
}
