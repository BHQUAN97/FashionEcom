'use client';

import { useState } from 'react';
import { useAdminFetch } from '@/lib/hooks/use-admin-fetch';
import { AdminTableLayout } from '@/components/admin/shared/admin-table-layout';
import { EmptyTableRow } from '@/components/admin/shared/empty-table-row';

/* ===== Types ===== */
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

interface SystemLog {
  logSystemId: string;
  logSystemLevel: string;
  logSystemMethod: string;
  logSystemUrl: string;
  logSystemStatus: number;
  logSystemDuration: number;
  logSystemRequestBody: string | null;
  logSystemError: string | null;
  logSystemStack: string | null;
  sysUserId: string | null;
  logSystemIp: string | null;
  createdDate: string;
}

interface SystemLogResponse {
  items: SystemLog[];
  total: number;
  page: number;
  totalPages: number;
}

type Tab = 'audit' | 'system';

/* ===== Constants ===== */
const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  VIEW: 'bg-gray-100 text-gray-700',
  LOGIN: 'bg-purple-100 text-purple-700',
};

const LEVEL_COLORS: Record<string, string> = {
  DEBUG: 'bg-gray-100 text-gray-600',
  INFO: 'bg-blue-100 text-blue-700',
  WARN: 'bg-yellow-100 text-yellow-700',
  ERROR: 'bg-red-100 text-red-700',
  FATAL: 'bg-red-200 text-red-900',
};

const STATUS_COLOR = (s: number) => {
  if (s >= 500) return 'text-red-600 font-bold';
  if (s >= 400) return 'text-yellow-600 font-semibold';
  return 'text-green-600';
};

const METHOD_COLORS: Record<string, string> = {
  GET: 'text-blue-600',
  POST: 'text-green-600',
  PUT: 'text-orange-500',
  DELETE: 'text-red-600',
  PATCH: 'text-purple-600',
};

/* ===== Audit Log Panel ===== */
function AuditLogPanel() {
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const params = entityTypeFilter ? `?entityType=${entityTypeFilter}` : '';
  const { data, loading } = useAdminFetch<{ data: AuditLog[] }>({ url: `/admin/audit-logs${params}` });
  const logs = data?.data || [];

  const handleExport = () => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300/api'}/admin/audit-logs/export`, '_blank');
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-4">
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
        <button onClick={handleExport} className="ml-auto px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm">
          Export CSV
        </button>
      </div>

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
            {!loading && logs.length === 0 && <EmptyTableRow colSpan={5} message="Chua co log nao" />}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ===== System Log Panel (NLog style) ===== */
function SystemLogPanel() {
  const [level, setLevel] = useState('');
  const [method, setMethod] = useState('');
  const [statusGroup, setStatusGroup] = useState(''); // '4xx', '5xx', 'all'
  const [urlSearch, setUrlSearch] = useState('');
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Build query string
  const params = new URLSearchParams();
  if (level) params.set('level', level);
  if (method) params.set('method', method);
  if (statusGroup === '4xx') { params.set('statusMin', '400'); params.set('statusMax', '499'); }
  if (statusGroup === '5xx') { params.set('statusMin', '500'); params.set('statusMax', '599'); }
  if (urlSearch) params.set('url', urlSearch);
  params.set('page', String(page));
  params.set('limit', '50');

  const { data, loading } = useAdminFetch<{ data: SystemLogResponse }>({
    url: `/admin/system-logs?${params.toString()}`,
  });
  const logs = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;

  // Stats
  const { data: statsData } = useAdminFetch<{ data: Record<string, number> }>({ url: '/admin/system-logs/stats' });
  const stats = statsData?.data || {};

  return (
    <>
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {(['INFO', 'WARN', 'ERROR', 'FATAL'] as const).map((lvl) => (
          <button
            key={lvl}
            onClick={() => { setLevel(level === lvl ? '' : lvl); setPage(1); }}
            className={`rounded-lg border p-3 text-left transition ${
              level === lvl ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:border-gray-400'
            }`}
          >
            <div className="text-xs text-gray-500">{lvl}</div>
            <div className="text-xl font-bold mt-0.5">{stats[lvl] || 0}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select value={method} onChange={(e) => { setMethod(e.target.value); setPage(1); }} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">Tat ca method</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
        <select value={statusGroup} onChange={(e) => { setStatusGroup(e.target.value); setPage(1); }} className="border rounded-lg px-3 py-2 text-sm">
          <option value="">Tat ca status</option>
          <option value="4xx">4xx (Client Error)</option>
          <option value="5xx">5xx (Server Error)</option>
        </select>
        <input
          type="text"
          placeholder="Tim theo URL..."
          value={urlSearch}
          onChange={(e) => { setUrlSearch(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]"
        />
      </div>

      {/* Log table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-3 text-left font-medium text-gray-600 w-16">Level</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600 w-16">Status</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600 w-20">Method</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600">URL</th>
              <th className="px-3 py-3 text-right font-medium text-gray-600 w-16">ms</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600 w-24">IP</th>
              <th className="px-3 py-3 text-left font-medium text-gray-600 w-36">Thoi gian</th>
            </tr>
          </thead>
          <tbody className="divide-y font-mono text-xs">
            {logs.map((l) => (
              <tr key={l.logSystemId} className="group">
                <td colSpan={7} className="p-0">
                  {/* Main row */}
                  <button
                    className="w-full flex items-center hover:bg-gray-50 transition text-left"
                    onClick={() => setExpandedId(expandedId === l.logSystemId ? null : l.logSystemId)}
                  >
                    <span className="px-3 py-2.5 w-16">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${LEVEL_COLORS[l.logSystemLevel] || ''}`}>
                        {l.logSystemLevel}
                      </span>
                    </span>
                    <span className={`px-3 py-2.5 w-16 ${STATUS_COLOR(l.logSystemStatus)}`}>
                      {l.logSystemStatus}
                    </span>
                    <span className={`px-3 py-2.5 w-20 font-semibold ${METHOD_COLORS[l.logSystemMethod] || ''}`}>
                      {l.logSystemMethod}
                    </span>
                    <span className="px-3 py-2.5 flex-1 truncate text-gray-700">{l.logSystemUrl}</span>
                    <span className={`px-3 py-2.5 w-16 text-right ${l.logSystemDuration > 1000 ? 'text-red-500' : l.logSystemDuration > 300 ? 'text-yellow-500' : 'text-gray-400'}`}>
                      {l.logSystemDuration}
                    </span>
                    <span className="px-3 py-2.5 w-24 text-gray-400">{l.logSystemIp || '-'}</span>
                    <span className="px-3 py-2.5 w-36 text-gray-400">
                      {new Date(l.createdDate).toLocaleString('vi-VN')}
                    </span>
                  </button>

                  {/* Expanded detail */}
                  {expandedId === l.logSystemId && (
                    <div className="px-4 py-3 bg-gray-50 border-t space-y-2 text-xs">
                      {l.logSystemError && (
                        <div>
                          <span className="font-semibold text-red-600">Error: </span>
                          <span className="text-gray-700">{l.logSystemError}</span>
                        </div>
                      )}
                      {l.logSystemStack && (
                        <details>
                          <summary className="font-semibold text-gray-500 cursor-pointer">Stack trace</summary>
                          <pre className="mt-1 p-2 bg-gray-900 text-green-400 rounded text-[10px] overflow-x-auto whitespace-pre-wrap max-h-40">
                            {l.logSystemStack}
                          </pre>
                        </details>
                      )}
                      {l.logSystemRequestBody && (
                        <details>
                          <summary className="font-semibold text-gray-500 cursor-pointer">Request body</summary>
                          <pre className="mt-1 p-2 bg-gray-100 rounded text-[10px] overflow-x-auto whitespace-pre-wrap max-h-40">
                            {(() => { try { return JSON.stringify(JSON.parse(l.logSystemRequestBody), null, 2); } catch { return l.logSystemRequestBody; } })()}
                          </pre>
                        </details>
                      )}
                      <div className="text-gray-400">
                        User ID: {l.sysUserId || 'anonymous'}
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {!loading && logs.length === 0 && <EmptyTableRow colSpan={7} message="Khong co log nao" />}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 border rounded text-sm disabled:opacity-30"
          >
            Truoc
          </button>
          <span className="text-sm text-gray-500">Trang {page} / {totalPages}</span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 border rounded text-sm disabled:opacity-30"
          >
            Sau
          </button>
        </div>
      )}
    </>
  );
}

/* ===== Main Page ===== */

/**
 * Admin Nhat ky — 2 tab: Hanh dong (audit) + System Logs (HTTP request log)
 */
export default function LogsPage() {
  const [tab, setTab] = useState<Tab>('system');

  return (
    <AdminTableLayout title="Nhat ky he thong">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
        <button
          onClick={() => setTab('system')}
          className={`px-4 py-2 text-sm rounded-md transition ${
            tab === 'system' ? 'bg-white font-semibold shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          System Logs
        </button>
        <button
          onClick={() => setTab('audit')}
          className={`px-4 py-2 text-sm rounded-md transition ${
            tab === 'audit' ? 'bg-white font-semibold shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Hanh dong Admin
        </button>
      </div>

      {tab === 'system' ? <SystemLogPanel /> : <AuditLogPanel />}
    </AdminTableLayout>
  );
}
