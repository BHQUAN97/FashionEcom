'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/lib/api/client';

interface UseAdminFetchOptions {
  /** URL path — e.g. '/admin/orders' */
  url: string;
  /** Auto-fetch on mount */
  immediate?: boolean;
}

interface UseAdminFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook chung cho admin pages — fetch data voi loading/error state
 * Su dung apiFetch co san (auto JWT, error handling)
 */
export function useAdminFetch<T = unknown>({ url, immediate = true }: UseAdminFetchOptions): UseAdminFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<T>(url);
      setData(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Loi tai du lieu');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (immediate) fetchData();
  }, [fetchData, immediate]);

  return { data, loading, error, refetch: fetchData };
}
