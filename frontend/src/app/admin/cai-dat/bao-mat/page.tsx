'use client';

import { useAdminFetch } from '@/lib/hooks/use-admin-fetch';
import { AdminTableLayout } from '@/components/admin/shared/admin-table-layout';
import { StatusBadge } from '@/components/admin/shared/status-badge';
import { EmptyTableRow } from '@/components/admin/shared/empty-table-row';

interface LoginLog {
  logAccessId: string;
  logAccessEmail: string;
  logAccessSuccess: number;
  logAccessIp: string;
  logAccessUserAgent: string | null;
  createdDate: string;
}

const LOGIN_STATUS_LABELS: Record<number, string> = { 0: 'Thất bại', 1: 'Thành công' };
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
      <h1 className="text-2xl font-bold text-gray-900">Bảo mật</h1>

      <div className="bg-white border rounded-lg p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Chính sách mật khẩu</h2>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>Tối thiểu 8 ký tự: 1 hoa, 1 thường, 1 số, 1 ký tự đặc biệt</li>
          <li>Bắt buộc đổi mật khẩu mỗi 90 ngày (admin)</li>
          <li>Không sử dụng lại 5 mật khẩu gần nhất</li>
          <li>Khóa tài khoản sau 5 lần nhập sai (30 phút)</li>
        </ul>
      </div>

      <AdminTableLayout title="Lịch sử đăng nhập" loading={loading}>
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Kết quả</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">IP</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Thời gian</th>
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
              {logs.length === 0 && <EmptyTableRow colSpan={4} message="Chưa có log nào" />}
            </tbody>
          </table>
        </div>
      </AdminTableLayout>
    </div>
  );
}
