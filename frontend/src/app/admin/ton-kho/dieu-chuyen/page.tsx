'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';

interface Transfer {
  invWarehouseTransferId: string;
  invWarehouseTransferCode: string;
  invWarehouseFromId: string;
  invWarehouseToId: string;
  invWarehouseTransferStatus: number;
  invWarehouseTransferReason: string | null;
  createdDate: string;
}

const STATUS_LABELS: Record<number, string> = {
  0: 'Draft', 1: 'Cho xuat kho', 2: 'Dang van chuyen', 3: 'Da nhan', 4: 'Nhan 1 phan', 5: 'Hoan thanh',
};
const STATUS_COLORS: Record<number, string> = {
  0: 'bg-gray-100 text-gray-700', 1: 'bg-yellow-100 text-yellow-700', 2: 'bg-blue-100 text-blue-700',
  3: 'bg-green-100 text-green-700', 4: 'bg-orange-100 text-orange-700', 5: 'bg-green-100 text-green-700',
};

/**
 * Admin Warehouse Transfer — danh sach phieu dieu chuyen kho
 */
export default function WarehouseTransferPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: Transfer[] }>('/admin/warehouse-transfers')
      .then((res) => setTransfers(res.data.data || (res.data as unknown as Transfer[])))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Dang tai...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dieu chuyen kho</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          Tao phieu moi
        </button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Ma phieu</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Trang thai</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Ly do</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Ngay tao</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {transfers.map((t) => (
              <tr key={t.invWarehouseTransferId} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{t.invWarehouseTransferCode}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[t.invWarehouseTransferStatus]}`}>
                    {STATUS_LABELS[t.invWarehouseTransferStatus]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{t.invWarehouseTransferReason || '-'}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(t.createdDate).toLocaleDateString('vi-VN')}</td>
              </tr>
            ))}
            {transfers.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Chua co phieu dieu chuyen nao</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
