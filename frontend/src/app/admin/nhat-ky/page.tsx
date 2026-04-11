'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';

interface AuditLog {
  logAuditId: string;
  logAuditAction: string;
  logAuditEntityType: string;
  logAuditEntityId: string;
  logAuditEntityName: string | null;
  logAuditIp: string | null;
  sysUserId: string;
  createdDate: string;
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  VIEW: 'bg-gray-100 text-gray-700',
  LOGIN: 'bg-purple-100 text-purple-700',
};

/**
 * Admin Audit Log — nhat ky hanh dong he thong
 */
export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityTypeFilter, setEntityTypeFilter] = useState('');

  useEffect(() => {
    const params = entityTypeFilter ? `?entityType=${entityTypeFilter}` : '';
    api.get<{ data: AuditLog[] }>(`/admin/audit-logs${params}`)
      .then((res) => setLogs(res.data.data || (res.data as unknown as AuditLog[])))
      .finally(() => setLoading(false));
  }, [entityTypeFilter]);

  const handleExport = () => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300/api'}/admin/audit-logs/export`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Nhat ky he thong</h1>
        <div className="flex gap-3">
          <select
            value={entityTypeFilter}
            onChange={(e) => setEntityTypeFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Tat ca doi tuong</option>
            <option value="cat_product">San pham</option>
            <option value="sal_order">Don hang</option>
            <option value="sys_user">Nguoi dung</option>
            <option value="prm_discount">Khuyen mai</option>
          </select>
          <button onClick={handleExport} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm">
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Dang tai...</div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Hanh dong</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Doi tuong</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Entity ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">IP</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Thoi gian</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((l) => (
                <tr key={l.logAuditId} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${ACTION_COLORS[l.logAuditAction] || 'bg-gray-100'}`}>
                      {l.logAuditAction}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{l.logAuditEntityType}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {l.logAuditEntityName || l.logAuditEntityId.substring(0, 8)}...
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{l.logAuditIp || '-'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(l.createdDate).toLocaleString('vi-VN')}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Chua co log nao</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
