import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  /** المخزون المتوفر للمنتج (عند معرفته) — يُستخدم كحد أقصى للكمية */
  stock?: number;
}

/** الحد الأقصى الافتراضي للكمية عندما لا يُعرف مخزون المنتج */
export const MAX_QUANTITY_DEFAULT = 99;

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  couponDiscount: number;
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  clearCoupon: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

/** يبقى ضمن 1..max — الكمية لا تكون صفراً أو سالبة أبداً (الحذف عبر زر الحذف فقط) */
function clampQuantity(quantity: number, max: number): number {
  const safeMax = Number.isFinite(max) && max >= 1 ? Math.floor(max) : MAX_QUANTITY_DEFAULT;
  const value = Math.floor(quantity);
  if (!Number.isFinite(value)) return 1;
  return Math.min(Math.max(value, 1), safeMax);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      couponDiscount: 0,

      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? {
                      ...i,
                      quantity: clampQuantity(
                        i.quantity + 1,
                        i.stock ?? MAX_QUANTITY_DEFAULT
                      ),
                    }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId
              ? {
                  ...i,
                  quantity: clampQuantity(
                    quantity,
                    i.stock ?? MAX_QUANTITY_DEFAULT
                  ),
                }
              : i
          ),
        })),

      clearCart: () => set({ items: [], couponCode: null, couponDiscount: 0 }),

      applyCoupon: (code, discount) =>
        set({
          couponCode: code.trim(),
          couponDiscount: Number.isFinite(discount)
            ? Math.max(0, discount)
            : 0,
        }),

      clearCoupon: () => set({ couponCode: null, couponDiscount: 0 }),

      getTotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "flux-cart",
      // الإضافة الجديدة لها قيم افتراضية آمنة؛ الدمج الافتراضي في zustand persist
      // يكفي لاستعادة السلات المحفوظة سابقاً بدون هجرة (migration).
    }
  )
);
