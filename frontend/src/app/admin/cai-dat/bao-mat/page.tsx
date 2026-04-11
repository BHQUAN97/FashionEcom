'use client';

import { useAdminFetch } from '@/lib/hooks/use-admin-fetch';
import { AdminTableLayout } from '@/components/admin/shared/AdminTableLayout';
import { StatusBadge } from '@/components/admin/shared/StatusBadge';
import { EmptyTableRow } from '@/components/admin/shared/EmptyTableRow';

interface LoginLog {
  logAccessId: string;
  logAccessEmail: string;
  logAccessSuccess: number;
  logAccessIp: string;
  logAccessUserAgent: string | null;
  createdDate: string;
}

const LOGIN_STATUS_LABELS: Record<number, string> = { 0: 'That bai', 1: 'Thanh cong' };
const LOGIN_STATUS_COLORS: Record<number, string> = {
  0: 'bg-red-100 text-red-700',
  1: 'bg-green-100 text-green-700',
};

/**
 * Admin Security — login history, password policy config
 */
export default function SecurityPage() {
  const { data, loading } = useAdminFetch<{ data: LoginLog[] }>({ url: '/admin/security/login-history' });
  const logs = data?.data || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Bao mat</h1>

      <div className="bg-white border rounded-lg p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Chinh sach mat khau</h2>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>Toi thieu 8 ky tu: 1 hoa, 1 thuong, 1 so, 1 ky tu dac biet</li>
          <li>Bat buoc doi mat khau moi 90 ngay (admin)</li>
          <li>Khong su dung lai 5 mat khau gan nhat</li>
          <li>Khoa tai khoan sau 5 lan nhap sai (30 phut)</li>
        </ul>
      </div>

      <AdminTableLayout title="Lich su dang nhap" loading={loading}>
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Ket qua</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">IP</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Thoi gian</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((l) => (
                <tr key={l.logAccessId} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{l.logAccessEmail}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={l.logAccessSuccess}
                      label={LOGIN_STATUS_LABELS[l.logAccessSuccess]}
                      colors={LOGIN_STATUS_COLORS}
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{l.logAccessIp}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(l.createdDate).toLocaleString('vi-VN')}</td>
                </tr>
              ))}
              {logs.length === 0 && <EmptyTableRow colSpan={4} message="Chua co log nao" />}
            </tbody>
          </table>
        </div>
      </AdminTableLayout>
    </div>
  );
}
