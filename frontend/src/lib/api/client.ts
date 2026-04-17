const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4300/api';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Lay JWT token tu Zustand memory state (khong con persist trong localStorage) */
function getToken(): string | null {
  try {
    if (typeof window === 'undefined') return null;
    // Token chi ton tai trong Zustand memory state, import truc tiep store
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { useAuthStore } = require('@/lib/stores/auth.store');
    return useAuthStore.getState().accessToken;
  } catch { return null; }
}

/** Kiem tra path co phai internal admin path hop le (chong open redirect) */
function isInternalPath(path: string): boolean {
  // Phai bat dau voi / (relative), khong bat dau voi // (protocol-relative)
  // Phai la admin path, khong cho redirect ra ngoai admin
  // Block path co backslash (bypass trick: /\example.com)
  return (
    path.startsWith('/admin') &&
    !path.startsWith('//') &&
    !path.includes('\\')
  );
}

/** 401 → xoa auth + redirect ve login (chi chay 1 lan) */
let redirecting = false;
function handleUnauthorized() {
  if (redirecting || typeof window === 'undefined') return;
  // Chi redirect khi dang o trang admin
  if (!window.location.pathname.startsWith('/admin')) return;
  redirecting = true;
  localStorage.removeItem('fashionecom-auth');
  sessionStorage.clear();
  document.cookie = 'fashionecom-auth-token=;path=/;max-age=0';
  const currentPath = window.location.pathname;
  // Validate redirect path de chong open redirect
  const redirect = isInternalPath(currentPath) ? encodeURIComponent(currentPath) : encodeURIComponent('/admin');
  window.location.href = `/admin-login?redirect=${redirect}`;
}

/**
 * API client chuan — auto attach JWT, handle 401 redirect
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    handleUnauthorized();
    throw new Error('Phien dang nhap het han');
  }

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || `API Error: ${res.status}`);
  }

  return json;
}

/**
 * Wrapper cho fetch() co san JWT token — dung cho cac trang admin
 * goi raw fetch thay vi apiFetch (vi can xu ly response rieng)
 * Auto redirect ve login khi 401
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();

  const res = await fetch(url, {
    ...options,
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    handleUnauthorized();
  }

  return res;
}

// Shorthand methods
export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) =>
    apiFetch<T>(path, { method: 'DELETE' }),
};
