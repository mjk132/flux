"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { useAuthStore, getAuthHeaders } from "@/store/auth";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ShoppingBag,
  Upload,
  QrCode,
  Copy,
  Check,
  ShieldCheck,
} from "lucide-react";

// نسخة محلية من الثوابت في src/lib/upload.ts — لا يمكن استيرادها هنا لأن ذلك
// الملف يستورد كود خادم (@vercel/blob / fs) ويجب ألا يدخل في حزمة العميل.
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

/** يعيد رسالة خطأ عربية عند رفض الملف، أو null عند القبول */
function validateProofFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "صيغة الصورة غير مدعومة، المسموح بها JPG أو PNG أو WEBP أو GIF";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "حجم الصورة يتجاوز 5 ميغا بايت، يرجى اختيار صورة أصغر";
  }
  return null;
}

/** أخطاء الكوبون التي يعيدها /api/orders — يُمسح الكوبون حتى لا يعلق المستخدم */
function isCouponError(message: string): boolean {
  return /invalid coupon|coupon has expired|coupon usage limit|coupon is not|minimum order amount|كوبون|كود الخصم/i.test(
    message
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart, couponCode, couponDiscount, clearCoupon } =
    useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  const [paypalEmail, setPaypalEmail] = useState("");
  const [paypalQr, setPaypalQr] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [proofError, setProofError] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error) {
      errorRef.current?.focus();
    }
  }, [error]);

  useEffect(() => {
    fetch("/api/settings/public")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setPaypalEmail(j.settings.paypal_email || "");
          setPaypalQr(j.settings.paypal_qr_image || "");
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      setName((v) => v || user.name || "");
      setEmail((v) => v || user.email || "");
    }
  }, [user]);

  useEffect(() => {
    if (!proof) {
      setProofPreview(null);
      return;
    }
    const url = URL.createObjectURL(proof);
    setProofPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [proof]);

  function handleProofChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setProof(null);
      setProofError("");
      return;
    }
    const invalidMessage = validateProofFile(file);
    if (invalidMessage) {
      setProof(null);
      setProofError(invalidMessage);
      e.target.value = "";
      return;
    }
    setProofError("");
    setProof(file);
  }

  function copyEmail() {
    if (!paypalEmail) return;
    navigator.clipboard.writeText(paypalEmail).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSubmit() {
    setError("");
    if (items.length === 0) {
      setError("السلة فارغة");
      return;
    }
    if (!name.trim() || !email.trim()) {
      setError("الاسم والبريد الإلكتروني مطلوبان");
      return;
    }
    if (!proof) {
      setError("يرجى إرفاق صورة إثبات الدفع");
      return;
    }
    const proofIssue = validateProofFile(proof);
    if (proofIssue) {
      setProofError(proofIssue);
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();
      form.set(
        "items",
        JSON.stringify(
          items.map((i) => ({ product_id: i.productId, quantity: i.quantity }))
        )
      );
      form.set("customerName", name.trim());
      form.set("customerEmail", email.trim());
      form.set("customerPhone", phone.trim());
      form.set("notes", notes.trim());
      form.set("paymentMethod", "paypal");
      if (couponCode) {
        form.set("couponCode", couponCode);
      }
      form.set("proof", proof);

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { ...getAuthHeaders() },
        body: form,
      });
      const json = await res.json();
      if (!json.success) {
        const message = json.error || "فشل إنشاء الطلب";
        if (couponCode && isCouponError(message)) {
          clearCoupon();
        }
        setError(message);
        return;
      }
      clearCart();
      router.push(`/checkout/success?order=${json.data.orderNumber}`);
    } catch {
      setError("حدث خطأ أثناء إرسال الطلب");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-border bg-surface">
            <ShoppingBag className="h-10 w-10 text-purple-accent" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            السلة فارغة
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-text">
            أضف منتجات إلى السلة أولاً ثم أكمل عملية الشراء.
          </p>
          <Link
            href="/store"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-purple-accent px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-violet"
          >
            <ShoppingBag className="h-4 w-4" />
            تصفح المنتجات
          </Link>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-border bg-surface">
            <ShieldCheck className="h-10 w-10 text-purple-accent" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            سجل الدخول أولاً
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-gray-text">
            لإتمام الشراء واستلام رتب ديسكورد، يجب تسجيل الدخول بحساب ديسكورد.
          </p>
          <Link
            href="/auth/login"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#5865F2] px-6 py-3 text-sm font-bold text-[#ffffff] transition-colors hover:bg-[#4752c4]"
          >
            الدخول عبر ديسكورد
          </Link>
        </div>
      </div>
    );
  }

  const total = Math.max(0, getTotal() - couponDiscount);

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-extrabold text-white">
        إتمام الشراء
      </h1>
      <p className="mt-1 text-sm text-gray-text">
        ادفع عبر PayPal ثم أرفق صورة الإثبات — نراجع طلبك ونمنحك الرتب في ديسكورد.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* ── Form ── */}
        <div className="space-y-6">
          {error && (
            <div
              ref={errorRef}
              role="alert"
              aria-live="assertive"
              tabIndex={-1}
              className="rounded-2xl border border-danger/30 bg-danger/10 p-4 text-[13px] font-semibold text-danger outline-none"
            >
              {error}
            </div>
          )}

          {/* Step 1: PayPal */}
          <section className="rounded-2xl border border-border bg-surface p-6">
            <p className="mb-1 text-[11px] font-bold text-purple-accent">
              الخطوة 1
            </p>
            <h2 className="text-lg font-extrabold text-white">
              حوّل المبلغ عبر PayPal
            </h2>
            <p className="mt-1 text-[13px] text-gray-text">
              الإجمالي المطلوب:{" "}
              <span className="font-extrabold text-white">{formatPrice(total)}</span>
            </p>

            <div className="mt-4 flex flex-col gap-4 sm:flex-row">
              {paypalQr ? (
                <div className="relative h-44 w-44 shrink-0 overflow-hidden rounded-2xl border border-border bg-surface">
                  <Image
                    src={paypalQr}
                    alt="PayPal QR"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-44 w-44 shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-deep-purple/40 text-gray-muted">
                  <QrCode className="h-8 w-8" />
                  <span className="px-3 text-center text-[11px]">
                    امسح رمز PayPal هنا
                  </span>
                </div>
              )}
              <div className="flex-1">
                <p className="text-[13px] text-gray-text">
                  أو حوّل مباشرة إلى بريد PayPal:
                </p>
                <button
                  type="button"
                  onClick={copyEmail}
                  className="mt-2 flex w-full items-center justify-between gap-2 rounded-2xl border border-border bg-deep-purple/40 px-4 py-3 text-sm font-bold text-white transition-colors hover:border-purple-accent/40"
                  dir="ltr"
                >
                  <span className="truncate">
                    {paypalEmail || "يحدد قريباً"}
                  </span>
                  {copied ? (
                    <Check className="h-4 w-4 shrink-0 text-success" />
                  ) : (
                    <Copy className="h-4 w-4 shrink-0 text-gray-muted" />
                  )}
                </button>
                <p className="mt-2 text-[12px] leading-relaxed text-gray-muted">
                  بعد التحويل خذ لقطة شاشة للإيصال وأرفقها بالأسفل.
                </p>
              </div>
            </div>
          </section>

          {/* Step 2: Proof + details */}
          <section className="rounded-2xl border border-border bg-surface p-6">
            <p className="mb-1 text-[11px] font-bold text-purple-accent">
              الخطوة 2
            </p>
            <h2 className="text-lg font-extrabold text-white">
              بياناتك وإثبات الدفع
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Input
                label="الاسم"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اسمك"
              />
              <Input
                label="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                dir="ltr"
                className="text-left"
              />
            </div>
            <div className="mt-4">
              <Input
                label="رقم الجوال (اختياري)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="05xxxxxxxx"
                dir="ltr"
                className="text-left"
              />
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-text">
                صورة إثبات الدفع *
              </label>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-deep-purple/40 px-4 py-6 transition-colors hover:border-purple-accent/50">
                {proofPreview ? (
                  <img
                    src={proofPreview}
                    alt="إثبات الدفع"
                    className="max-h-56 rounded-lg object-contain"
                  />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-muted" />
                    <span className="text-[13px] text-gray-text">
                      اضغط لاختيار صورة الإيصال (JPG/PNG/WEBP/GIF حتى 5MB)
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(",")}
                  className="hidden"
                  onChange={handleProofChange}
                />
              </label>
              {proofError && (
                <p
                  role="alert"
                  className="mt-1.5 text-[12px] font-semibold text-danger"
                >
                  {proofError}
                </p>
              )}
              {proof && (
                <p className="mt-1.5 text-[12px] text-gray-muted">{proof.name}</p>
              )}
            </div>

            <div className="mt-4">
              <Textarea
                label="ملاحظات (اختياري)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="مثلا: يوزر الديسكورد الخاص بك"
              />
            </div>
          </section>

          <Button
            size="lg"
            className="w-full"
            onClick={handleSubmit}
            loading={submitting}
          >
            تأكيد الطلب وإرسال الإثبات
          </Button>
        </div>

        {/* ── Summary ── */}
        <aside className="h-fit rounded-2xl border border-border bg-surface p-6 lg:sticky lg:top-24">
          <h2 className="text-[15px] font-extrabold text-white">ملخص الطلب</h2>
          <div className="mt-4 space-y-3">
            {items.map((i) => (
              <div key={i.productId} className="flex items-center gap-3">
                {i.image ? (
                  <Image
                    src={i.image}
                    alt=""
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-deep-purple text-gray-muted">
                    F
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold text-white">
                    {i.name}
                  </p>
                  <p className="text-[11px] text-gray-muted">
                    الكمية: {i.quantity}
                  </p>
                </div>
                <p className="text-[13px] font-bold text-white">
                  {formatPrice(i.price * i.quantity)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-3 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-text">المجموع الفرعي</span>
              <span className="text-sm font-bold text-white">
                {formatPrice(getTotal())}
              </span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-text">
                  خصم الكوبون
                  {couponCode ? ` (${couponCode})` : ""}
                </span>
                <span className="text-sm font-bold text-success">
                  −{formatPrice(couponDiscount)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-text">الإجمالي</span>
              <span className="text-xl font-extrabold text-white">
                {formatPrice(total)}
              </span>
            </div>
          </div>
          <p className="mt-3 flex items-start gap-1.5 text-[11.5px] leading-relaxed text-gray-muted">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            بعد مراجعة الإثبات تُمنح رتب ديسكورد الخاصة بمنتجاتك تلقائياً.
          </p>
        </aside>
      </div>
    </div>
  );
}
