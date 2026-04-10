import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  slug: string;
  color: string;
  color_hex: string;
  size: string;
  price: number;
  compare_at_price: number;
  image: string;
  qty: number;
  sku: string;
  max_qty: number;
}

interface CartState {
  items: CartItem[];
  /** Them san pham vao gio — neu trung variant thi cong don so luong */
  addItem: (item: CartItem) => void;
  /** Cap nhat so luong — neu qty <= 0 thi xoa */
  updateQty: (variantId: string, qty: number) => void;
  /** Xoa san pham khoi gio */
  removeItem: (variantId: string) => void;
  /** Xoa toan bo gio hang */
  clearCart: () => void;
  /** Tong tien chua giam */
  getSubtotal: () => number;
  /** Tong so luong items */
  getCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId);
          if (existing) {
            const newQty = Math.min(existing.qty + item.qty, item.max_qty);
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId ? { ...i, qty: newQty } : i,
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      updateQty: (variantId, qty) =>
        set((state) => ({
          items: qty <= 0
            ? state.items.filter((i) => i.variantId !== variantId)
            : state.items.map((i) =>
                i.variantId === variantId ? { ...i, qty: Math.min(qty, i.max_qty) } : i,
              ),
        })),

      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        })),

      clearCart: () => set({ items: [] }),

      getSubtotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.qty, 0),

      getCount: () =>
        get().items.reduce((sum, item) => sum + item.qty, 0),
    }),
    { name: 'fashionecom-cart' },
  ),
);
