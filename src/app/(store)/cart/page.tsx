"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore, MAX_QUANTITY_DEFAULT } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
    couponCode: appliedCouponCode,
    couponDiscount,
    applyCoupon,
    clearCoupon,
  } = useCartStore();
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = getTotal();
  const total = Math.max(0, subtotal - couponDiscount);

  const handleApplyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (data.success) {
        applyCoupon(code, data.data.discount_amount);
      } else {
        setCouponError(data.error || "كود الخصم غير صالح");
        clearCoupon();
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
            <ArrowLeft className="mr-2 h-4 w-4" />
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
          {items.map((item) => {
            const maxQuantity = item.stock ?? MAX_QUANTITY_DEFAULT;
            const atMin = item.quantity <= 1;
            const atMax = item.quantity >= maxQuantity;
            return (
            <div
              key={item.productId}
              className="flex gap-4 rounded-2xl border border-border bg-surface p-4"
            >
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-deep-purple">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={80}
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
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                      disabled={atMin}
                      aria-label={`إنقاص الكمية لـ ${item.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-gray-text transition-colors hover:bg-surface hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-text"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[2rem] text-center text-sm font-medium text-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                      disabled={atMax}
                      aria-label={`زيادة الكمية لـ ${item.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-gray-text transition-colors hover:bg-surface hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-text"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      aria-label={`حذف ${item.name} من السلة`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-text transition-colors hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            );
          })}

          <button
            onClick={clearCart}
            className="text-sm text-gray-text hover:text-danger transition-colors"
          >
            مسح السلة
          </button>
        </div>

        {/* Order Summary */}
        <div className="rounded-2xl border border-border bg-surface p-6">
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
                <span className="text-success">
                  خصم الكوبون
                  {appliedCouponCode ? ` (${appliedCouponCode})` : ""}
                </span>
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
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
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
              <p role="alert" className="mt-1 text-xs text-danger">
                {couponError}
              </p>
            )}
            {appliedCouponCode && (
              <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm">
                <span className="truncate text-success">
                  تم تطبيق الكوبون: {appliedCouponCode}
                </span>
                <button
                  type="button"
                  onClick={clearCoupon}
                  aria-label="إزالة كوبون الخصم"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-text transition-colors hover:text-danger"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
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
