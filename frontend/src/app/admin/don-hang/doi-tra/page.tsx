'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';

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

const TYPE_LABELS: Record<number, string> = { 0: 'Doi hang', 1: 'Hoan tien', 2: 'Doi size' };
const REASON_LABELS: Record<number, string> = { 0: 'Loi hang', 1: 'Sai SP', 2: 'Khong vua', 3: 'Doi y', 4: 'Khac' };
const STATUS_LABELS: Record<number, string> = {
  0: 'Yeu cau', 1: 'Dang xem xet', 2: 'Da duyet', 3: 'Tu choi',
  4: 'Dang hoan tien', 5: 'Da hoan tien', 6: 'Dang doi hang', 7: 'Da doi hang',
};
const STATUS_COLORS: Record<number, string> = {
  0: 'bg-yellow-100 text-yellow-700', 1: 'bg-blue-100 text-blue-700',
  2: 'bg-green-100 text-green-700', 3: 'bg-red-100 text-red-700',
  4: 'bg-orange-100 text-orange-700', 5: 'bg-green-100 text-green-700',
  6: 'bg-purple-100 text-purple-700', 7: 'bg-green-100 text-green-700',
};

/**
 * Admin RMA Management — danh sach yeu cau doi tra, thay doi trang thai
 */
export default function ReturnsManagementPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<number | ''>('');

  const loadReturns = async () => {
    try {
      const params = statusFilter !== '' ? `?status=${statusFilter}` : '';
      const res = await api.get<{ data: ReturnRequest[] }>(`/admin/returns${params}`);
      setReturns(res.data.data || (res.data as unknown as ReturnRequest[]));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReturns(); }, [statusFilter]);

  const updateStatus = async (id: string, status: number) => {
    try {
      await api.put(`/admin/returns/${id}/status`, { status });
      loadReturns();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Dang tai...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quan ly Doi tra (RMA)</h1>
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
      </div>

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
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[r.salReturnRequestStatus]}`}>
                    {STATUS_LABELS[r.salReturnRequestStatus]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {r.salReturnRequestRefundAmount > 0
                    ? Number(r.salReturnRequestRefundAmount).toLocaleString('vi-VN') + ' VND'
                    : '-'}
                </td>
                <td className="px-4 py-3 text-gray-500">{new Date(r.createdDate).toLocaleDateString('vi-VN')}</td>
                <td className="px-4 py-3 space-x-2">
                  {r.salReturnRequestStatus === 0 && (
                    <button onClick={() => updateStatus(r.salReturnRequestId, 1)} className="text-blue-600 hover:underline text-xs">Tiep nhan</button>
                  )}
                  {r.salReturnRequestStatus === 1 && (
                    <>
                      <button onClick={() => updateStatus(r.salReturnRequestId, 2)} className="text-green-600 hover:underline text-xs">Duyet</button>
                      <button onClick={() => updateStatus(r.salReturnRequestId, 3)} className="text-red-600 hover:underline text-xs">Tu choi</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {returns.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Khong co yeu cau doi tra nao</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
