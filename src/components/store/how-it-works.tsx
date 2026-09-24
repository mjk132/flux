import Link from "next/link";
import { Search, CreditCard, PackageCheck, ArrowLeft } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "الخطوة 01",
    title: "اختر المنتج",
    desc: "تصفّح الأقسام واختر ما يناسبك — بوت، سكربت FiveM، موقع أو تصميم.",
  },
  {
    icon: CreditCard,
    step: "الخطوة 02",
    title: "أكمل الدفع",
    desc: "ادفع بأمان عبر الوسيلة التي تناسبك. الطلب يُؤكَّد فوراً.",
  },
  {
    icon: PackageCheck,
    step: "الخطوة 03",
    title: "استلم منتجك",
    desc: "يصلك المنتج الرقمي فوراً — كود أو تفعيل، مع ضمان كامل.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="relative border-y border-border/40 bg-dark-purple/60">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10 text-center">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-purple-accent">
            بسيط وسريع
          </p>
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            كيف يعمل Flux Store؟
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.step} className="relative">
              {/* Connector line (desktop) */}
              {i < steps.length - 1 && (
                <div className="absolute left-0 right-0 top-[52px] hidden h-px bg-gradient-to-r from-purple-accent/40 via-purple-accent/25 to-transparent md:block" />
              )}
              <div className="relative flex flex-col items-center rounded-2xl border border-border/60 bg-surface px-6 py-8 text-center transition-all duration-300 hover:border-purple-accent/40 hover:bg-surface-raised">
                <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-accent to-violet shadow-[0_0_30px_rgba(124,58,237,0.3)]">
                  <s.icon className="h-7 w-7 text-white" />
                  <span className="absolute -bottom-1.5 -left-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-purple-accent/40 bg-near-black text-[11px] font-extrabold text-purple-accent">
                    {i + 1}
                  </span>
                </div>
                <p className="mb-1 text-[10.5px] font-bold uppercase tracking-widest text-gray-muted">
                  {s.step}
                </p>
                <h3 className="text-[15px] font-bold text-white">{s.title}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-gray-text">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/store"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-purple-accent px-7 text-sm font-bold text-white transition-all hover:bg-violet hover:shadow-[0_0_25px_rgba(124,58,237,0.4)]"
          >
            ابدأ التسوق الآن
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
