"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle, ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || "N/A";

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
        <CheckCircle className="h-10 w-10 text-success" />
      </div>

      <h1 className="mb-3 text-2xl font-bold text-white">
        تم استلام طلبك!
      </h1>

      <p className="mb-2 text-gray-text">
        شكراً لك! سنراجع صورة إثبات الدفع قريباً، وبعد التأكيد تُمنح رتب
        ديسكورد الخاصة بمنتجاتك تلقائياً.
      </p>

      <div className="my-6 inline-block rounded-lg border border-border bg-surface px-6 py-3">
        <p className="text-xs text-gray-text">رقم الطلب</p>
        <p className="text-lg font-bold text-purple-accent">{orderNumber}</p>
      </div>

      <p className="mb-8 text-sm text-gray-text">
        سيتم إرسال تفاصيل الطلب إلى بريدك الإلكتروني. يمكنك متابعة حالة الطلب
        من صفحة حسابك.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/account/orders">
          <Button variant="secondary" className="w-full sm:w-auto">
            <ShoppingBag className="ml-2 h-4 w-4" />
            طلباتي
          </Button>
        </Link>
        <Link href="/store">
          <Button className="w-full sm:w-auto">
            متابعة التسوق
            <ArrowRight className="mr-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-accent border-t-transparent" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
