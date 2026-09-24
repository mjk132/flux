"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotal } =
    useCartStore();
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = getTotal();
  const total = subtotal - couponDiscount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), subtotal }),
      });
      const data = await res.json();
      if (data.success) {
        setCouponDiscount(data.data.discount_amount);
      } else {
        setCouponError(data.error || "كود الخصم غير صالح");
        setCouponDiscount(0);
      }
    } catch {
      setCouponError("حدث خطأ، حاول مرة أخرى");
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-gray-text" />
        <h1 className="mb-2 text-2xl font-bold text-white">
          سلة التسوق فارغة
        </h1>
        <p className="mb-6 text-gray-text">
          لم تقم بإضافة أي منتجات إلى السلة بعد
        </p>
        <Link href="/store">
          <Button>
            تصفح المتجر
            <ArrowRight className="mr-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-white">سلة التسوق</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 rounded-xl border border-border bg-surface p-4"
            >
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-deep-purple">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-text">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="text-sm font-medium text-white">{item.name}</h3>
                  <p className="text-sm font-bold text-purple-accent">
                    {formatPrice(item.price)}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-gray-text transition-colors hover:bg-surface hover:text-white"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="min-w-[2rem] text-center text-sm font-medium text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-gray-text transition-colors hover:bg-surface hover:text-white"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-gray-text transition-colors hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-sm text-gray-text hover:text-danger transition-colors"
          >
            مسح السلة
          </button>
        </div>

        {/* Order Summary */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">
            ملخص الطلب
          </h2>

          <div className="space-y-3 border-b border-border pb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-text">المجموع الفرعي</span>
              <span className="text-white">{formatPrice(subtotal)}</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-success">خصم</span>
                <span className="text-success">
                  -{formatPrice(couponDiscount)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold">
              <span className="text-white">الإجمالي</span>
              <span className="text-purple-accent">{formatPrice(total)}</span>
            </div>
          </div>

          {/* Coupon */}
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-text">
              كود الخصم
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="أدخل الكود"
                className="h-10 flex-1 rounded-lg border border-border bg-surface px-3 text-sm text-white placeholder:text-gray-text/60 focus:border-purple-accent focus:outline-none"
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={handleApplyCoupon}
                loading={couponLoading}
              >
                تطبيق
              </Button>
            </div>
            {couponError && (
              <p className="mt-1 text-xs text-danger">{couponError}</p>
            )}
          </div>

          <Link href="/checkout">
            <Button className="w-full" size="lg">
              إتمام الشراء
            </Button>
          </Link>
          <p className="mt-2 text-center text-[12px] text-gray-muted">
            الدفع عبر PayPal — أرفق صورة الإثبات بعد التحويل
          </p>

          <Link
            href="/store"
            className="mt-3 block text-center text-sm text-purple-accent hover:underline"
          >
            متابعة التسوق
          </Link>
        </div>
      </div>
    </div>
  );
}
