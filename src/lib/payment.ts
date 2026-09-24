import { prisma } from "./prisma";

/**
 * ─────────────────────────────────────────────────────────────
 *  نقطة ربط بوابة الدفع (Payment Gateway)
 * ─────────────────────────────────────────────────────────────
 *  هذا الملف هو "المكان" المخصص لربط بوابة الدفع.
 *  صاحب المتجر يضع مفاتيح البوابة من لوحة التحكم:
 *  الإعدادات ← الدفع ← بوابة الدفع
 *
 *  لإتمام الربط بأي بوابة (Moyasar / Tap / PayTabs / Stripe /
 *  HyperPay ...) كل ما تحتاجه هو تنفيذ الدالة createCheckoutSession
 *  و handleWebhook حسب توثيق البوابة، ثم ربط أزرار الدفع بالـ API
 *  من صفحة الدفع. المفاتيح تُقرأ تلقائياً من قاعدة البيانات.
 * ─────────────────────────────────────────────────────────────
 */

import type { PaymentProvider } from "./payment-providers";

export type { PaymentProvider } from "./payment-providers";

export interface PaymentConfig {
  /** البوابة المختارة حالياً */
  provider: PaymentProvider;
  /** المفتاح العام / الخاص بالدفع من البوابة */
  publishableKey: string;
  secretKey: string;
  /** مفتاح التحقق من توقيع الويب هوك (اختياري حسب البوابة) */
  webhookSecret: string;
  /** وضع الاختبار */
  testMode: boolean;
  /** هل الدفع الإلكتروني مفعّل؟ (الدفع عند الاستلام متاح دائماً) */
  enabled: boolean;
}

export interface CheckoutSessionInput {
  orderId: string;
  orderNumber: string;
  amount: number;
  currency?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResult {
  /** "cod" للدفع عند الاستلام، أو رابط الدفع للبوابة الإلكترونية */
  method: PaymentProvider;
  /** رابط تحويل العميل للبوابة (فارغ مع الدفع عند الاستلام) */
  url: string | null;
  /** معرّف المعاملة من البوابة */
  transactionId: string | null;
}

async function getSetting(key: string): Promise<string | null> {
  const setting = await prisma.setting.findUnique({ where: { key } });
  return setting?.value ?? null;
}

export async function getPaymentConfig(): Promise<PaymentConfig> {
  const [provider, publishableKey, secretKey, webhookSecret, testMode, enabled] =
    await Promise.all([
      getSetting("payment_gateway"),
      getSetting("payment_publishable_key"),
      getSetting("payment_secret_key"),
      getSetting("payment_webhook_secret"),
      getSetting("payment_test_mode"),
      getSetting("payment_enabled"),
    ]);

  return {
    provider: (provider as PaymentProvider) || "cod",
    publishableKey: publishableKey || "",
    secretKey: secretKey || "",
    webhookSecret: webhookSecret || "",
    testMode: testMode === "1",
    enabled: enabled === "1",
  };
}

/** هل يوجد بوابة دفع إلكترونية مفعّلة ومكتملة المفاتيح؟ */
export async function isOnlinePaymentReady(): Promise<boolean> {
  const config = await getPaymentConfig();
  return (
    config.enabled &&
    config.provider !== "cod" &&
    Boolean(config.publishableKey && config.secretKey)
  );
}

/**
 * إنشاء جلسة دفع.
 *
 * ▸ الدفع عند الاستلام (cod): يرجع مباشرة دون اتصال بأي بوابة.
 *
 * ▸ البوابات الإلكترونية: هذا هو مكان استدعاء API البوابة.
 *   مثال لطريقة الربط مع بوابة moyasar:
 *
 *   const res = await fetch("https://api.moyasar.com/v1/invoices", {
 *     method: "POST",
 *     headers: {
 *       Authorization: `Basic ${Buffer.from(config.secretKey).toString("base64")}`,
 *       "Content-Type": "application/json",
 *     },
 *     body: JSON.stringify({
 *       amount: Math.round(input.amount * 100), // ريال → هللة
 *       currency: input.currency || "SAR",
 *       description: `طلب ${input.orderNumber}`,
 *       callback_url: input.successUrl,
 *       metadata: { order_id: input.orderId },
 *     }),
 *   });
 *
 *   ثم أعد { url: invoice.url, transactionId: invoice.id }.
 */
export async function createCheckoutSession(
  _input: CheckoutSessionInput
): Promise<CheckoutSessionResult> {
  const config = await getPaymentConfig();

  if (config.provider === "cod") {
    return {
      method: "cod",
      url: null,
      transactionId: null,
    };
  }

  // =====================================================
  // TODO: ربط بوابة الدفع هنا — استخدم config.secretKey و
  // config.publishableKey و config.testMode في استدعاء API البوابة.
  // =====================================================
  throw new Error(
    `Payment gateway "${config.provider}" is not integrated yet. ` +
      "Implement createCheckoutSession in src/lib/payment.ts."
  );
}

/**
 * معالجة الويب هوك القادم من البوابة بعد الدفع.
 * تحتاج إلى التحقق من التوقيع عبر config.webhookSecret ثم
 * تحديث الطلب إلى PAID وتحرير المنتج الرقمي للمشتري.
 */
export async function handlePaymentWebhook(
  provider: PaymentProvider,
  _rawBody: string,
  _signature: string | null
): Promise<{ orderId: string; paid: boolean }> {
  const config = await getPaymentConfig();

  // =====================================================
  // TODO: تحقق من التوقيع (signature) مع config.webhookSecret
  // ثم ابحث عن الطلب بالمعرّف القادم من البوابة وحدّث حالته.
  // =====================================================

  throw new Error(
    `Webhook handling for "${provider}" is not integrated yet. ` +
      "Implement handlePaymentWebhook in src/lib/payment.ts."
  );
}
