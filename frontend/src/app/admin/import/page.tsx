'use client';

import { useState, useCallback, useRef } from 'react';
import { useAdminFetch } from '@/lib/hooks/use-admin-fetch';
import { apiFetch } from '@/lib/api/client';
import { AdminTableLayout } from '@/components/admin/shared/admin-table-layout';
import { useAuthStore } from '@/lib/stores/auth.store';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300/api';

type ImportTarget = 'product' | 'inventory' | 'customer' | 'price';
type TabType = 'upload' | 'google_sheets';

interface ImportJob {
  sysImportJobId: string;
  sysImportJobSource: string;
  sysImportJobTarget: string;
  sysImportJobFileName: string | null;
  sysImportJobStatus: string;
  sysImportJobTotalRows: number;
  sysImportJobCreated: number;
  sysImportJobUpdated: number;
  sysImportJobSkipped: number;
  sysImportJobErrors: number;
  createdDate: string;
}

interface SyncConfig {
  sysSyncConfigId: string;
  sysSyncConfigName: string;
  sysSyncConfigSourceUrl: string;
  sysSyncConfigTarget: string;
  sysSyncConfigAutoSync: number;
  sysSyncConfigIntervalMinutes: number;
  sysSyncConfigLastSyncAt: string | null;
  sysSyncConfigStatus: string;
  sysSyncConfigErrorMessage: string | null;
}

interface PreviewData {
  jobId?: string;
  headers: string[];
  mapping: Record<string, string>;
  preview: Record<string, unknown>[];
  totalRows: number;
  validRows: number;
  errors: Array<{ row: number; field: string; message: string }>;
  sheetNames?: string[];
  sheetId?: string;
}

const TARGET_LABELS: Record<ImportTarget, string> = {
  product: 'San pham',
  inventory: 'Ton kho',
  customer: 'Khach hang',
  price: 'Cap nhat gia',
};

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  processing: 'bg-blue-100 text-blue-700',
  pending: 'bg-yellow-100 text-yellow-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

const SOURCE_LABELS: Record<string, string> = {
  file_upload: 'File',
  google_sheets: 'GSheet',
  google_drive: 'GDrive',
};

/**
 * Admin Import Hub — import du lieu tu file CSV/Excel va Google Sheets
 * 2 tab: Upload File | Google Sheets
 * + lich su import + danh sach sync configs
 */
export default function ImportPage() {
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [target, setTarget] = useState<ImportTarget>('product');
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Google Sheets state
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetName, setSheetName] = useState('Sheet1');
  const [sheetLoading, setSheetLoading] = useState(false);
  const [autoSync, setAutoSync] = useState(false);
  const [syncInterval, setSyncInterval] = useState(30);
  const [syncName, setSyncName] = useState('');

  // Fetch data
  const { data: historyData, refetch: refetchHistory } = useAdminFetch<{ data: ImportJob[] }>({ url: '/admin/integrations/history?limit=20' });
  const { data: configsData, refetch: refetchConfigs } = useAdminFetch<{ data: SyncConfig[] }>({ url: '/admin/integrations/sync-configs' });
  const { data: sheetsStatus } = useAdminFetch<{ data: { configured: boolean; message: string } }>({ url: '/admin/integrations/sheets/status' });

  const history = historyData?.data || [];
  const syncConfigs = configsData?.data || [];
  const isGoogleConfigured = sheetsStatus?.data?.configured || false;

  // ==================== FILE UPLOAD ====================

  // Ref de luu controller upload hien tai — cancel neu user re-upload
  const uploadAbortRef = useRef<AbortController | null>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    // Huy upload truoc (neu co) de tranh race khi user chon file thu 2
    if (uploadAbortRef.current) uploadAbortRef.current.abort();
    const controller = new AbortController();
    uploadAbortRef.current = controller;

    setUploading(true);
    setMessage(null);
    setPreview(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = useAuthStore.getState().accessToken;
      const res = await fetch(`${API_BASE}/admin/integrations/upload?target=${target}`, {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
        signal: controller.signal,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Upload that bai');

      setPreview(json.data);
      setMessage({ type: 'success', text: json.message });
    } catch (err) {
      // Bo qua abort error — user chu dong huy
      if (err instanceof Error && err.name === 'AbortError') return;
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Loi upload file' });
    } finally {
      if (uploadAbortRef.current === controller) {
        uploadAbortRef.current = null;
        setUploading(false);
      }
    }
  }, [target]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [handleFileUpload]);

  // ==================== GOOGLE SHEETS ====================

  const handlePreviewSheet = useCallback(async () => {
    if (!sheetUrl.trim()) return;
    setSheetLoading(true);
    setMessage(null);
    setPreview(null);

    try {
      const res = await apiFetch<PreviewData>('/admin/integrations/sheets/preview', {
        method: 'POST',
        body: JSON.stringify({ sourceUrl: sheetUrl, sheetName, target }),
      });
      setPreview(res.data);
      setMessage({ type: 'success', text: res.message });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Loi doc Google Sheet' });
    } finally {
      setSheetLoading(false);
    }
  }, [sheetUrl, sheetName, target]);

  const handleCreateSyncConfig = useCallback(async () => {
    if (!sheetUrl.trim() || !syncName.trim()) return;

    try {
      await apiFetch('/admin/integrations/sync-configs', {
        method: 'POST',
        body: JSON.stringify({
          name: syncName,
          sourceUrl: sheetUrl,
          target,
          sheetName,
          autoSync,
          intervalMinutes: syncInterval,
        }),
      });
      setMessage({ type: 'success', text: `Da tao cau hinh sync "${syncName}"` });
      setSyncName('');
      refetchConfigs();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Loi tao sync config' });
    }
  }, [sheetUrl, syncName, target, sheetName, autoSync, syncInterval, refetchConfigs]);

  const handleTriggerSync = useCallback(async (configId: string) => {
    try {
      const res = await apiFetch<{ created: number; updated: number }>(`/admin/integrations/sync-configs/${configId}/sync`, {
        method: 'POST',
      });
      setMessage({ type: 'success', text: `Sync xong: ${res.data.created} tao moi, ${res.data.updated} cap nhat` });
      refetchHistory();
      refetchConfigs();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Loi sync' });
    }
  }, [refetchHistory, refetchConfigs]);

  const handleDeleteSyncConfig = useCallback(async (configId: string) => {
    if (!confirm('Xoa cau hinh sync nay?')) return;
    try {
      await apiFetch(`/admin/integrations/sync-configs/${configId}`, { method: 'DELETE' });
      setMessage({ type: 'success', text: 'Da xoa cau hinh sync' });
      refetchConfigs();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Loi xoa' });
    }
  }, [refetchConfigs]);

  // ==================== CONFIRM IMPORT ====================

  const handleConfirmImport = useCallback(async () => {
    if (!preview) return;
    setConfirming(true);

    try {
      // Chi gui jobId — server doc data tu cache, KHONG gui rows tu client
      const res = await apiFetch<{ created: number; updated: number; skipped: number }>('/admin/integrations/confirm', {
        method: 'POST',
        body: JSON.stringify({ jobId: preview.jobId }),
      });
      setMessage({ type: 'success', text: `Import xong: ${res.data.created} tao moi, ${res.data.updated} cap nhat, ${res.data.skipped} bo qua` });
      setPreview(null);
      refetchHistory();
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Loi import' });
    } finally {
      setConfirming(false);
    }
  }, [preview, target, refetchHistory]);

  // ==================== TEMPLATE DOWNLOAD ====================

  const handleDownloadTemplate = useCallback(() => {
    const token = useAuthStore.getState().accessToken;
    const url = `${API_BASE}/admin/integrations/template?target=${target}`;
    const a = document.createElement('a');
    // Dung fetch de attach token
    fetch(url, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
      .then((res) => res.blob())
      .then((blob) => {
        a.href = URL.createObjectURL(blob);
        a.download = `import_template_${target}.xlsx`;
        a.click();
      });
  }, [target]);

  return (
    <AdminTableLayout title="Import & Dong bo">
      {/* Message */}
      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {(['upload', 'google_sheets'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setPreview(null); setMessage(null); }}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === tab ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'upload' ? 'Upload File' : 'Google Sheets'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content — 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Target selector */}
          <div className="bg-white border rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Loai du lieu</label>
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(TARGET_LABELS) as ImportTarget[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTarget(t)}
                  className={`px-3 py-1.5 rounded-md text-sm border transition ${
                    target === t
                      ? 'border-[#ee4d2d] bg-orange-50 text-[#ee4d2d]'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  {TARGET_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="bg-white border rounded-lg p-6">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#ee4d2d] transition cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {uploading ? (
                  <p className="text-sm text-gray-500">Dang xu ly...</p>
                ) : (
                  <>
                    <p className="text-sm text-gray-700 font-medium">Keo tha file CSV/Excel vao day</p>
                    <p className="text-xs text-gray-400 mt-1">hoac click de chon file (toi da 10MB)</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              <button
                onClick={handleDownloadTemplate}
                className="mt-3 text-sm text-[#ee4d2d] hover:underline flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Tai template mau ({TARGET_LABELS[target]})
              </button>
            </div>
          )}

          {/* Google Sheets Tab */}
          {activeTab === 'google_sheets' && (
            <div className="bg-white border rounded-lg p-6 space-y-4">
              {!isGoogleConfigured && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm">
                  Google Sheets API chua cau hinh. Them <code className="bg-yellow-100 px-1 rounded">GOOGLE_API_KEY</code> vao file <code className="bg-yellow-100 px-1 rounded">.env</code> va dam bao sheet duoc chia se &quot;Anyone with the link&quot;.
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link Google Sheet</label>
                <input
                  type="url"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#ee4d2d] focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tab sheet</label>
                  <input
                    type="text"
                    value={sheetName}
                    onChange={(e) => setSheetName(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#ee4d2d] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
                  <button
                    onClick={handlePreviewSheet}
                    disabled={sheetLoading || !sheetUrl.trim()}
                    className="w-full px-4 py-2 bg-[#ee4d2d] text-white rounded-lg text-sm font-medium hover:bg-[#d73211] disabled:opacity-50 transition"
                  >
                    {sheetLoading ? 'Dang doc...' : 'Ket noi & Preview'}
                  </button>
                </div>
              </div>

              {/* Auto-sync config */}
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Cau hinh tu dong sync</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Ten cau hinh</label>
                    <input
                      type="text"
                      value={syncName}
                      onChange={(e) => setSyncName(e.target.value)}
                      placeholder="VD: Catalog chinh"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#ee4d2d] focus:border-transparent outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={autoSync}
                        onChange={(e) => setAutoSync(e.target.checked)}
                        className="rounded border-gray-300 text-[#ee4d2d] focus:ring-[#ee4d2d]"
                      />
                      Tu dong sync
                    </label>
                    {autoSync && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">moi</span>
                        <input
                          type="number"
                          value={syncInterval}
                          onChange={(e) => setSyncInterval(Number(e.target.value))}
                          min={5}
                          max={1440}
                          className="w-16 border rounded px-2 py-1 text-sm"
                        />
                        <span className="text-gray-500">phut</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleCreateSyncConfig}
                    disabled={!sheetUrl.trim() || !syncName.trim()}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition"
                  >
                    Luu cau hinh sync
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
                <h3 className="text-sm font-medium">Preview — {preview.totalRows} dong</h3>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-green-600 font-medium">{preview.validRows} hop le</span>
                  {preview.errors.length > 0 && (
                    <span className="text-red-600 font-medium">{preview.errors.length} loi</span>
                  )}
                </div>
              </div>

              {/* Errors */}
              {preview.errors.length > 0 && (
                <div className="px-4 py-2 bg-red-50 border-b max-h-32 overflow-y-auto">
                  {preview.errors.slice(0, 10).map((err, i) => (
                    <p key={i} className="text-xs text-red-600">
                      Dong {err.row}: [{err.field}] {err.message}
                    </p>
                  ))}
                  {preview.errors.length > 10 && (
                    <p className="text-xs text-red-400">...va {preview.errors.length - 10} loi khac</p>
                  )}
                </div>
              )}

              {/* Preview table */}
              <div className="overflow-x-auto max-h-80">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">#</th>
                      {preview.headers.slice(0, 8).map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-medium text-gray-500 whitespace-nowrap">
                          {h}
                          {preview.mapping[h] && (
                            <span className="block text-[10px] text-[#ee4d2d] font-normal">→ {preview.mapping[h]}</span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {preview.preview.slice(0, 15).map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                        {preview.headers.slice(0, 8).map((h) => (
                          <td key={h} className="px-3 py-2 text-gray-700 whitespace-nowrap max-w-[150px] truncate">
                            {String(row[preview.mapping[h] || h] ?? row[h] ?? '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Confirm */}
              <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
                <button
                  onClick={() => setPreview(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Huy
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={confirming || preview.validRows === 0}
                  className="px-6 py-2 bg-[#ee4d2d] text-white rounded-lg text-sm font-medium hover:bg-[#d73211] disabled:opacity-50 transition"
                >
                  {confirming ? 'Dang import...' : `Xac nhan Import (${preview.validRows} dong)`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar — 1 col */}
        <div className="space-y-6">
          {/* Sync Configs */}
          {syncConfigs.length > 0 && (
            <div className="bg-white border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b bg-gray-50">
                <h3 className="text-sm font-medium">Cau hinh Sync</h3>
              </div>
              <div className="divide-y">
                {syncConfigs.map((config) => (
                  <div key={config.sysSyncConfigId} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{config.sysSyncConfigName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        config.sysSyncConfigStatus === 'active' ? 'bg-green-100 text-green-700' :
                        config.sysSyncConfigStatus === 'error' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {config.sysSyncConfigStatus}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">
                      {TARGET_LABELS[config.sysSyncConfigTarget as ImportTarget] || config.sysSyncConfigTarget}
                      {config.sysSyncConfigAutoSync ? ` · moi ${config.sysSyncConfigIntervalMinutes}p` : ''}
                      {config.sysSyncConfigLastSyncAt && ` · ${new Date(config.sysSyncConfigLastSyncAt).toLocaleString('vi-VN')}`}
                    </p>
                    {config.sysSyncConfigErrorMessage && (
                      <p className="text-xs text-red-500 mb-2">{config.sysSyncConfigErrorMessage}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTriggerSync(config.sysSyncConfigId)}
                        className="text-xs px-2 py-1 bg-[#ee4d2d] text-white rounded hover:bg-[#d73211] transition"
                      >
                        Sync ngay
                      </button>
                      <button
                        onClick={() => handleDeleteSyncConfig(config.sysSyncConfigId)}
                        className="text-xs px-2 py-1 text-red-500 hover:bg-red-50 rounded transition"
                      >
                        Xoa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Import History */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50">
              <h3 className="text-sm font-medium">Lich su Import</h3>
            </div>
            {history.length === 0 ? (
              <p className="px-4 py-6 text-sm text-gray-400 text-center">Chua co lich su import</p>
            ) : (
              <div className="divide-y max-h-96 overflow-y-auto">
                {history.map((job) => (
                  <div key={job.sysImportJobId} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                          {SOURCE_LABELS[job.sysImportJobSource] || job.sysImportJobSource}
                        </span>
                        <span className="text-xs text-gray-500">
                          {TARGET_LABELS[job.sysImportJobTarget as ImportTarget] || job.sysImportJobTarget}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[job.sysImportJobStatus] || 'bg-gray-100'}`}>
                        {job.sysImportJobStatus}
                      </span>
                    </div>
                    {job.sysImportJobFileName && (
                      <p className="text-xs text-gray-400 truncate">{job.sysImportJobFileName}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span>{job.sysImportJobTotalRows} dong</span>
                      {job.sysImportJobCreated > 0 && <span className="text-green-600">+{job.sysImportJobCreated}</span>}
                      {job.sysImportJobUpdated > 0 && <span className="text-blue-600">~{job.sysImportJobUpdated}</span>}
                      {job.sysImportJobErrors > 0 && <span className="text-red-600">{job.sysImportJobErrors} loi</span>}
                      <span className="ml-auto">{new Date(job.createdDate).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminTableLayout>
  );
}
