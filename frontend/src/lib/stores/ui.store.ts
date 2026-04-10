import { create } from 'zustand';

interface UIState {
  // Mobile drawer menu
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  // Mini cart drawer (desktop)
  isMiniCartOpen: boolean;
  toggleMiniCart: () => void;
  // Filter bottom sheet (mobile)
  isFilterOpen: boolean;
  toggleFilter: () => void;
  // Search overlay
  isSearchOpen: boolean;
  toggleSearch: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),

  isMiniCartOpen: false,
  toggleMiniCart: () => set((s) => ({ isMiniCartOpen: !s.isMiniCartOpen })),

  isFilterOpen: false,
  toggleFilter: () => set((s) => ({ isFilterOpen: !s.isFilterOpen })),

  isSearchOpen: false,
  toggleSearch: () => set((s) => ({ isSearchOpen: !s.isSearchOpen })),
}));
