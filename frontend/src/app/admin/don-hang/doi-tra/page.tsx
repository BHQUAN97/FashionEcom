'use client';

import { useState } from 'react';
import { api } from '@/lib/api/client';
import { useAdminFetch } from '@/lib/hooks/use-admin-fetch';
import { AdminTableLayout } from '@/components/admin/shared/admin-table-layout';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { EmptyTableRow } from '@/components/admin/shared/empty-table-row';
import { ConfirmDialog } from '@/components/admin/shared/confirm-dialog';

interface ReturnRequest {
  salReturnRequestId: string;
  salReturnRequestCode: string;
  salOrderId: string;
  salReturnRequestType: number;
  salReturnRequestReason: number;
  salReturnRequestStatus: number;
  salReturnRequestRefundAmount: number;
  createdDate: string;
}

const TYPE_LABELS: Record<number, string> = { 0: 'Đổi hàng', 1: 'Hoàn tiền', 2: 'Đổi size' };
const REASON_LABELS: Record<number, string> = { 0: 'Lỗi hàng', 1: 'Sai SP', 2: 'Không vừa', 3: 'Đổi ý', 4: 'Khác' };
const STATUS_LABELS: Record<number, string> = {
  0: 'Yêu cầu', 1: 'Đang xem xét', 2: 'Đã duyệt', 3: 'Từ chối',
  4: 'Đang hoàn tiền', 5: 'Đã hoàn tiền', 6: 'Đang đổi hàng', 7: 'Đã đổi hàng',
};
const STATUS_BADGE_COLORS: Record<number, string> = {
  0: 'bg-yellow-100 text-yellow-700', 1: 'bg-blue-100 text-blue-700',
  2: 'bg-green-100 text-green-700', 3: 'bg-red-100 text-red-700',
  4: 'bg-orange-100 text-orange-700', 5: 'bg-green-100 text-green-700',
  6: 'bg-purple-100 text-purple-700', 7: 'bg-green-100 text-green-700',
};

/**
 * Admin RMA Management — danh sach yeu cau doi tra, thay doi trang thai
 */
export default function ReturnsManagementPage() {
  const [confirmState, setConfirmState] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [statusFilter, setStatusFilter] = useState<number | ''>('');

  const params = statusFilter !== '' ? `?status=${statusFilter}` : '';
  const { data, loading, refetch } = useAdminFetch<{ data: ReturnRequest[] }>({ url: `/admin/returns${params}` });
  const returns = data?.data || [];

  const updateStatus = async (id: string, status: number) => {
    try {
      await api.put(`/admin/returns/${id}/status`, { status });
      refetch();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Co loi xay ra';
      alert(message);
    }
  };

  const handleConfirmReject = async () => {
    if (confirmState.id) {
      await updateStatus(confirmState.id, 3);
    }
    setConfirmState({ open: false, id: null });
  };

  return (
    <AdminTableLayout
      title="Quản lý Đổi trả (RMA)"
      filters={
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value === '' ? '' : Number(e.target.value))}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Tat ca trang thai</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      }
      loading={loading}
    >
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Ma RMA</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Loai</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Ly do</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Trang thai</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">So tien hoan</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Ngay tao</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Thao tac</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {returns.map((r) => (
              <tr key={r.salReturnRequestId} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{r.salReturnRequestCode}</td>
                <td className="px-4 py-3">{TYPE_LABELS[r.salReturnRequestType]}</td>
                <td className="px-4 py-3">{REASON_LABELS[r.salReturnRequestReason]}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.salReturnRequestStatus} label={STATUS_LABELS[r.salReturnRequestStatus]} colors={STATUS_BADGE_COLORS} />
                </td>
                <td className="px-4 py-3">
                  {r.salReturnRequestRefundAmount > 0
                    ? Number(r.salReturnRequestRefundAmount).toLocaleString('vi-VN') + ' VND'
                    : '-'}
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(r.createdDate).toLocaleDateString('vi-VN')}</td>
                <td className="px-4 py-3 space-x-2">
                  {r.salReturnRequestStatus === 0 && (
                    <button onClick={() => updateStatus(r.salReturnRequestId, 1)} className="text-[#ee4d2d] hover:underline text-xs">Tiep nhan</button>
                  )}
                  {r.salReturnRequestStatus === 1 && (
                    <>
                      <button onClick={() => updateStatus(r.salReturnRequestId, 2)} className="text-green-600 hover:underline text-xs">Duyet</button>
                      <button onClick={() => setConfirmState({ open: true, id: r.salReturnRequestId })} className="text-red-600 hover:underline text-xs">Tu choi</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {returns.length === 0 && (
              <EmptyTableRow colSpan={7} message="Không có yêu cầu đổi trả nào" />
            )}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        open={confirmState.open}
        title="Xác nhận từ chối"
        message="Bạn có chắc chắn muốn từ chối yêu cầu đổi trả này? Hành động này không thể hoàn tác."
        variant="danger"
        confirmLabel="Từ chối"
        onConfirm={handleConfirmReject}
        onCancel={() => setConfirmState({ open: false, id: null })}
      />
    </AdminTableLayout>
  );
}
