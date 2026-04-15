'use client';

import { useState, useRef, useCallback } from 'react';
import { useAdminFetch } from '@/lib/hooks/use-admin-fetch';
import { AdminTableLayout } from '@/components/admin/shared/admin-table-layout';

interface MediaItem {
  sysMediaId: string;
  sysMediaFilename: string;
  sysMediaPath: string;
  sysMediaType: number;
  sysMediaSize: number;
  sysMediaAlt: string | null;
  createdDate: string;
}

// Whitelist MIME types cho phep upload — dat ngoai component de tranh recreate moi render
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']);

/**
 * Admin Media — upload anh, quan ly media library
 * Upload su dung multipart/form-data voi FormData
 */
export default function MediaPage() {
  const { data, loading, refetch } = useAdminFetch<{ data: MediaItem[] }>({ url: '/admin/media' });
  const items = data?.data || [];

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getToken = () => {
    try {
      // Lay token tu Zustand store memory state
      const { useAuthStore } = require('@/lib/stores/auth.store');
      return useAuthStore.getState().accessToken;
    } catch { return null; }
  };

  const uploadFile = useCallback(async (file: File) => {
    if (!ALLOWED_TYPES.has(file.type)) {
      setError('Chi ho tro JPG, PNG, GIF, WebP, MP4, WebM');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(`File "${file.name}" vuot qua 5MB`);
      return;
    }
    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = getToken();
      // Upload truc tiep den backend (tranh Next.js proxy body size limit)
      const apiBase = typeof window !== 'undefined' && window.location.hostname === 'localhost'
        ? 'http://localhost:4300/api'
        : (process.env.NEXT_PUBLIC_API_URL || '/api');
      const res = await fetch(`${apiBase}/admin/media/upload`, {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({ message: 'Upload that bai' }));
        throw new Error(json.message || `HTTP ${res.status}`);
      }
      refetch();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Loi upload');
    } finally {
      setUploading(false);
    }
  }, [refetch]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xoa file nay?')) return;
    try {
      const token = getToken();
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300/api';
      await fetch(`${apiBase}/admin/media/${id}`, {
        method: 'DELETE',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      refetch();
    } catch { /* ignore */ }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <AdminTableLayout
      title="Quản lý Media"
      actions={
        <>
          <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-[#ee4d2d] text-white rounded-lg hover:bg-[#d73211] disabled:opacity-50 text-sm"
          >
            {uploading ? 'Đang tải...' : 'Tải lên'}
          </button>
        </>
      }
      loading={loading}
    >
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

      {/* Drop zone + Grid */}
      {items.length === 0 ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`bg-white border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition ${
            dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-lg font-medium mb-1">Kéo thả hoặc click để tải lên</p>
          <p className="text-sm text-gray-400">Hỗ trợ: JPG, PNG, GIF, WebP, MP4 (tối đa 5MB)</p>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={dragOver ? 'ring-2 ring-blue-400 rounded-lg' : ''}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {items.map((item) => {
              const imgUrl = item.sysMediaPath.startsWith('http')
                ? item.sysMediaPath
                : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300/api'}/../${item.sysMediaPath}`;
              return (
                <div key={item.sysMediaId} className="bg-white border rounded-lg overflow-hidden group relative">
                  {item.sysMediaType === 1 ? (
                    <img src={imgUrl} alt={item.sysMediaAlt || item.sysMediaFilename} className="w-full h-32 object-cover" />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-gray-400">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-xs truncate" title={item.sysMediaFilename}>{item.sysMediaFilename}</p>
                    <p className="text-xs text-gray-400">{formatSize(item.sysMediaSize)}</p>
                  </div>
                  {/* Overlay actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      onClick={() => navigator.clipboard.writeText(item.sysMediaPath)}
                      className="px-2 py-1 bg-white text-xs rounded"
                    >
                      Copy path
                    </button>
                    <button
                      onClick={() => handleDelete(item.sysMediaId)}
                      className="px-2 py-1 bg-red-600 text-white text-xs rounded"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </AdminTableLayout>
  );
}
