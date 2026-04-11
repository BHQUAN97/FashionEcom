'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';

interface LoginLog {
  logAccessId: string;
  logAccessEmail: string;
  logAccessSuccess: number;
  logAccessIp: string;
  logAccessUserAgent: string | null;
  createdDate: string;
}

/**
 * Admin Security — login history, password policy config
 */
export default function SecurityPage() {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: LoginLog[] }>('/admin/security/login-history')
      .then((res) => setLogs(res.data.data || (res.data as unknown as LoginLog[])))
      .finally(() => setLoading(false));
  }, []);

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

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-900">Lich su dang nhap</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400">Dang tai...</div>
        ) : (
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
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      l.logAccessSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {l.logAccessSuccess ? 'Thanh cong' : 'That bai'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{l.logAccessIp}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(l.createdDate).toLocaleString('vi-VN')}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Chua co log nao</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
