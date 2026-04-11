'use client';

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

const STATUS_LABELS: Record<number, string> = {
  0: 'Draft', 1: 'Cho xuat kho', 2: 'Dang van chuyen', 3: 'Da nhan', 4: 'Nhan 1 phan', 5: 'Hoan thanh',
};
const STATUS_BADGE_COLORS: Record<number, string> = {
  0: 'bg-gray-100 text-gray-700', 1: 'bg-yellow-100 text-yellow-700', 2: 'bg-blue-100 text-blue-700',
  3: 'bg-green-100 text-green-700', 4: 'bg-orange-100 text-orange-700', 5: 'bg-green-100 text-green-700',
};

/**
 * Admin Warehouse Transfer — danh sach phieu dieu chuyen kho
 */
export default function WarehouseTransferPage() {
  const { data, loading } = useAdminFetch<{ data: Transfer[] }>({ url: '/admin/warehouse-transfers' });
  const transfers = data?.data || [];

  return (
    <AdminTableLayout
      title="Dieu chuyen kho"
      actions={
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          Tao phieu moi
        </button>
      }
      loading={loading}
    >
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
                  <StatusBadge status={t.invWarehouseTransferStatus} label={STATUS_LABELS[t.invWarehouseTransferStatus]} colors={STATUS_BADGE_COLORS} />
                </td>
                <td className="px-4 py-3 text-gray-500">{t.invWarehouseTransferReason || '-'}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(t.createdDate).toLocaleDateString('vi-VN')}</td>
              </tr>
            ))}
            {transfers.length === 0 && (
              <EmptyTableRow colSpan={4} message="Chua co phieu dieu chuyen nao" />
            )}
          </tbody>
        </table>
      </div>
    </AdminTableLayout>
  );
}
