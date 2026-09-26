import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * TEMPORARY ROUTE — delete immediately after it has been run once.
 *
 * One-off production data-truth migration, executed through a deployment
 * because DATABASE_URL is a sensitive Vercel env var and cannot be pulled
 * locally. It applies fixed, hardcoded values only — no request input is
 * read besides the guard key — so even a stray trigger can only write the
 * intended corrections:
 *
 *  1. FAQ answers that claimed Visa/MasterCard/Apple Pay/STC Pay, instant
 *     delivery and 24/7 email support — none of which are true (the store
 *     takes PayPal + proof upload, and delivers after payment review).
 *  2. `discord_link`, which the old seed doubled into a dead URL.
 *  3. The six fake 5-star reviews the old seed fabricated (defensive —
 *     production currently has none, verified live).
 */

const KEY = "flux-datafix-20260926-9f2c7a41";

const FAQ_ANSWERS: Record<string, string> = {
  "كيف أستلم المنتج بعد الشراء؟":
    "المنتجات الجاهزة (بوتات، سكربتات، حزم تصميم) تظهر في حسابك بعد اعتماد الدفع — ترفع صورة إيصال PayPal في صفحة الطلب وتتم مراجعته من فريقنا. أما الخدمات المخصصة فنتواصل معك عبر الديسكورد لبدء الاتفاق على التفاصيل.",
  "كيف أطلب خدمة مخصصة؟":
    "اختر الخدمة من صفحة الخدمات واملأ نموذج طلب الخدمة بتفاصيل ما تحتاجه — نراجع طلبك ونتواصل معك عبر الديسكورد لتأكيد السعر والمدة قبل بدء التنفيذ.",
  "ما هي طرق الدفع المتاحة؟":
    "الدفع عبر PayPal: تنقل المبلغ إلى حسابنا وترفع صورة الإيصال في صفحة الطلب، وبعد مراجعته يُؤكد الطلب ويبدأ التسليم عبر حسابك.",
  "ماذا لو واجهت مشكلة في المنتج؟":
    "تواصل معنا عبر سيرفر الديسكورد مع رقم الطلب ووصف المشكلة، وسنراجعها معك في أقرب وقت ممكن.",
};

const SEED_REVIEW_COMMENTS = [
  "بوت ممتاز وتعامل راقٍ. التسليم كان أسرع من المتوقع!",
  "سكربتات نظيفة وشغالة بدون مشاكل. أنصح فيه.",
  "موقع احترافي وتسليم سريع. شغل يستاهل السعر.",
  "تصاميم جميلة وسعر مناسب.",
  "حل مشكلتي في نفس اليوم. شكراً!",
  "سكربت مخصص حسب طلبي بالضبط. جودة عالية.",
];

export async function GET(request: NextRequest) {
  if (request.headers.get("x-datafix-key") !== KEY) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const result: Record<string, unknown> = {};

  for (const [question, answer] of Object.entries(FAQ_ANSWERS)) {
    const r = await prisma.fAQ.updateMany({
      where: { question },
      data: { answer },
    });
    result[question] = r.count;
  }

  const d = await prisma.setting.updateMany({
    where: { key: "discord_link" },
    data: { value: "https://discord.gg/xRQGGKfZzN" },
  });
  result.discord_link = d.count;

  const rv = await prisma.review.deleteMany({
    where: { comment: { in: SEED_REVIEW_COMMENTS } },
  });
  result.seed_reviews_deleted = rv.count;

  return NextResponse.json({ ok: true, result });
}
