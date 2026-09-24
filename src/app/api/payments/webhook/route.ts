import { NextRequest, NextResponse } from "next/server";
import { handlePaymentWebhook } from "@/lib/payment";

/**
 * نقطة الويب هوك لبوابة الدفع.
 * سجل هذا الرابط في لوحة تحكم البوابة: /api/payments/webhook
 * بعد ربط البوابة في src/lib/payment.ts سيتم تأكيد الطلبات
 * المدفوعة هنا تلقائياً.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-webhook-signature") ||
      request.headers.get("x-signature") ||
      request.headers.get("authorization");

    const provider = (request.nextUrl.searchParams.get("provider") ||
      "moyasar") as Parameters<typeof handlePaymentWebhook>[0];

    const result = await handlePaymentWebhook(provider, rawBody, signature);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Webhook error:", error);
    const message = error instanceof Error ? error.message : "Webhook not integrated yet";
    return NextResponse.json(
      { success: false, error: message },
      { status: 501 }
    );
  }
}
