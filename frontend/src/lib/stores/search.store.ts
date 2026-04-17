import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SearchState {
  isOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  recentSearches: string[];
  addRecent: (term: string) => void;
  removeRecent: (term: string) => void;
  clearRecent: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      isOpen: false,
      openSearch: () => set({ isOpen: true }),
      closeSearch: () => set({ isOpen: false }),
      recentSearches: [],

      addRecent: (term) =>
        set((state) => {
          // Sanitize: trim, gioi han 100 ky tu, toi thieu 2 ky tu
          const sanitized = term.trim().slice(0, 100);
          if (sanitized.length < 2) return state;
          // Xoa trung, them dau, giu toi da 10
          const filtered = state.recentSearches.filter((s) => s !== sanitized);
          return { recentSearches: [sanitized, ...filtered].slice(0, 10) };
        }),

      removeRecent: (term) =>
        set((state) => ({
          recentSearches: state.recentSearches.filter((s) => s !== term),
        })),

      clearRecent: () => set({ recentSearches: [] }),
    }),
    {
      name: 'fashionecom-search',
      // Chi persist recentSearches, khong persist isOpen
      partialize: (state) => ({ recentSearches: state.recentSearches }),
    },
  ),
);
