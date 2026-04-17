import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: number;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

/** Doc token tu cookie — dung khi Zustand rehydrate (token khong persist vao localStorage) */
function getTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)fashionecom-auth-token=([^;]*)/);
  return match?.[1] || null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,

      setAuth: (user, accessToken) => {
        // Set cookie de middleware doc duoc (server-side) — Secure + SameSite=Strict
        document.cookie = `fashionecom-auth-token=${accessToken};path=/;max-age=${60 * 60 * 24 * 7};SameSite=Strict;Secure`;
        set({ user, accessToken });
      },

      logout: () => {
        document.cookie = 'fashionecom-auth-token=;path=/;max-age=0';
        // Xoa tat ca storage de tranh leak token
        localStorage.removeItem('fashionecom-auth');
        sessionStorage.clear();
        set({ user: null, accessToken: null });
      },

      // Check ca memory token lan cookie — cookie ton tai sau page refresh
      isAuthenticated: () => !!get().accessToken || !!getTokenFromCookie(),
    }),
    {
      name: 'fashionecom-auth',
      // Chi persist user info, KHONG persist accessToken (giu trong memory only)
      partialize: (state) => ({ user: state.user }),
      // Khi rehydrate: restore accessToken tu cookie neu co user ma mat token
      onRehydrateStorage: () => (state) => {
        if (state?.user && !state.accessToken) {
          const cookieToken = getTokenFromCookie();
          if (cookieToken) {
            useAuthStore.setState({ accessToken: cookieToken });
          }
        }
      },
    },
  ),
);
