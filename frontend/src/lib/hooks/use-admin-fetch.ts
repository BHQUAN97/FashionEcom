'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api/client';

interface UseAdminFetchOptions {
  /** URL path — e.g. '/admin/orders' */
  url: string;
  /** Auto-fetch on mount */
  immediate?: boolean;
  /** Debounce milliseconds — tranh spam request khi url thay doi lien tuc (vd: search) */
  debounceMs?: number;
  /** Cho phep skip fetch (khi chua du dieu kien, vd: chua chon filter bat buoc) */
  enabled?: boolean;
}

interface UseAdminFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/** Type guard — kiem tra response co shape { success, data } tu ResponseInterceptor BE */
function isWrappedResponse(value: unknown): value is { success: boolean; data: unknown } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    'data' in value &&
    typeof (value as { success: unknown }).success === 'boolean'
  );
}

/**
 * Hook chung cho admin pages — fetch data voi loading/error state
 * Su dung apiFetch co san (auto JWT, error handling)
 *
 * Ho tro debounce: khi url thay doi lien tuc (vd: typing search), chi fetch sau debounceMs ms.
 * Auto unwrap: neu response la { success, data } (tu ResponseInterceptor BE) thi tra ve data,
 *              else tra ve toan bo response (backward compat cho endpoint khac shape).
 */
export function useAdminFetch<T = unknown>({
  url,
  immediate = true,
  debounceMs = 0,
  enabled = true,
}: UseAdminFetchOptions): UseAdminFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate && enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(url);
      // Auto unwrap: response tu ResponseInterceptor co shape { success, data, message, pagination? }
      // Tra ve res.data de pages khong can dung `data?.data` (tranh double-nest).
      // Neu shape khac (legacy endpoint) — giu nguyen response.
      if (isWrappedResponse(res)) {
        setData(res.data as T);
      } else {
        setData(res as T);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [url, enabled]);

  useEffect(() => {
    if (!immediate || !enabled) return;

    // Khong debounce — fetch ngay
    if (debounceMs <= 0) {
      fetchData();
      return;
    }

    // Co debounce — delay fetch, cleanup neu url thay doi truoc khi timeout fire
    const timer = setTimeout(() => {
      fetchData();
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [fetchData, immediate, enabled, debounceMs]);

  return { data, loading, error, refetch: fetchData };
}
