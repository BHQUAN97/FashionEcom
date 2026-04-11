'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';

interface PurchaseOrder {
  invPurchaseOrderId: string;
  invPurchaseOrderCode: string;
  invSupplierId: string;
  invPurchaseOrderStatus: number;
  invPurchaseOrderTotal: number;
  invPurchaseOrderExpectedDate: string | null;
  createdDate: string;
}

const STATUS_LABELS: Record<number, string> = {
  0: 'Draft', 1: 'Cho duyet', 2: 'Da dat', 3: 'Nhan 1 phan', 4: 'Da nhan', 5: 'Hoan thanh', 6: 'Da huy',
};
const STATUS_COLORS: Record<number, string> = {
  0: 'bg-gray-100 text-gray-700', 1: 'bg-yellow-100 text-yellow-700', 2: 'bg-blue-100 text-blue-700',
  3: 'bg-orange-100 text-orange-700', 4: 'bg-green-100 text-green-700', 5: 'bg-green-100 text-green-700', 6: 'bg-red-100 text-red-700',
};

/**
 * Admin Purchase Orders — danh sach don dat hang NCC
 */
export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: PurchaseOrder[] }>('/admin/purchase-orders')
      .then((res) => setOrders(res.data.data || (res.data as unknown as PurchaseOrder[])))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Dang tai...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Don dat hang NCC</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          Tao PO moi
        </button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Ma PO</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Trang thai</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Tong gia tri</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Ngay du kien</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Ngay tao</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((o) => (
              <tr key={o.invPurchaseOrderId} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{o.invPurchaseOrderCode}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.invPurchaseOrderStatus]}`}>
                    {STATUS_LABELS[o.invPurchaseOrderStatus]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-medium">{Number(o.invPurchaseOrderTotal).toLocaleString('vi-VN')} VND</td>
                <td className="px-4 py-3 text-gray-500">{o.invPurchaseOrderExpectedDate || '-'}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(o.createdDate).toLocaleDateString('vi-VN')}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Chua co don dat hang nao</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
