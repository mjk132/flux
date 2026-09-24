import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistState {
  items: string[];
  toggle: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      toggle: (productId) =>
        set((state) => {
          const exists = state.items.includes(productId);
          return {
            items: exists
              ? state.items.filter((id) => id !== productId)
              : [...state.items, productId],
          };
        }),

      isInWishlist: (productId) => get().items.includes(productId),

      clear: () => set({ items: [] }),
    }),
    {
      name: "flux-wishlist",
    }
  )
);
