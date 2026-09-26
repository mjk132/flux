import Link from "next/link";
import {
  Wallet,
  ShieldCheck,
  Wrench,
  MessagesSquare,
} from "lucide-react";

/**
 * "Why FLUX" — four truthful capabilities, presented as a divided list
 * (not another grid of identical cards, which every other section uses).
 * Each line states something the store can actually demonstrate today:
 * account-based delivery, published pricing, custom development, and
 * Discord support. No numbers, no guarantees we don't offer.
 */
const capabilities = [
  {
    icon: Wallet,
    title: "ادفع وتعرف السعر قبل الشراء",
    desc: "الأسعار والخصومات معلنة على كل منتج، والدفع عبر PayPal مع رفع صورة الإيصال في صفحة الطلب.",
  },
  {
    icon: ShieldCheck,
    title: "التسليم عبر حسابك",
    desc: "المنتجات الرقمية تظهر في حسابك بعد اعتماد الدفع — لا رسائل خاصة ولا انتظار شحن.",
  },
  {
    icon: Wrench,
    title: "تطوير مخصص عند الحاجة",
    desc: "ديسكورد، FiveM، مواقع، لوحات تحكم وبرمجة مخصصة — اطلب الخدمة وسيتم الاتفاق على التفاصيل قبل البدء.",
  },
  {
    icon: MessagesSquare,
    title: "دعم عبر الديسكورد",
    desc: "للاستفسار قبل الشراء أو للمساعدة بعده، سيرفر الديسكورد هو قناة التواصل المباشر معنا.",
  },
];

export function WhyFluxSection() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.35fr] lg:gap-14">
        {/* Statement */}
        <div className="relative">
          <div className="sticky top-28">
            <p className="mb-2 text-[12px] font-bold text-purple-accent">
              لماذا FLUX؟
            </p>
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl lg:text-4xl">
              متجر منتجات، وورشة تطوير — في مكان واحد
            </h2>
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-gray-text">
              تختار منتجاً جاهزاً وتشتريه في دقائق، أو تطلب تنفيذاً مخصصاً
              يبدأ من فكرتك. نفس الفريق، نفس القناة، ونفس الشفافية في السعر.
            </p>
            <Link
              href="/services"
              className="mt-6 inline-flex items-center rounded-xl border border-border px-5 py-2.5 text-[13px] font-semibold text-gray-text transition-all hover:border-purple-accent/50 hover:text-white"
            >
              تعرّف على الخدمات
            </Link>
          </div>
        </div>

        {/* Capabilities — divided rows, deliberately NOT another card grid */}
        <div className="divide-y divide-border/60 border-y border-border/60">
          {capabilities.map((f) => (
            <div key={f.title} className="flex gap-4 py-6 sm:gap-5 sm:py-7">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-accent/10 text-purple-accent ring-1 ring-purple-accent/20">
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-white">{f.title}</h3>
                <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-gray-text">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
