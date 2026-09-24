import Link from "next/link";
import { Zap, ShieldCheck, Headphones, Wallet, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Zap,
    title: "تسليم فوري",
    desc: "المنتجات الرقمية تصل خلال ثوانٍ من تأكيد الطلب — بدون انتظار.",
    tint: "from-violet/20 to-transparent",
    iconBg: "bg-violet/15 text-violet ring-violet/25",
    num: "01",
  },
  {
    icon: ShieldCheck,
    title: "منتجات موثوقة",
    desc: "كل منتج مفحوص ومدعوم بضمان حقيقي. نحمي كل عملية شراء.",
    tint: "from-sky-500/15 to-transparent",
    iconBg: "bg-sky-400/15 text-sky-300 ring-sky-400/25",
    num: "02",
  },
  {
    icon: Wallet,
    title: "أسعار منافسة",
    desc: "أفضل سعر في السوق مع عروض وخصومات دائمة على المنتجات.",
    tint: "from-fuchsia-500/15 to-transparent",
    iconBg: "bg-fuchsia-400/15 text-fuchsia-300 ring-fuchsia-400/25",
    num: "03",
  },
  {
    icon: Headphones,
    title: "دعم متواصل",
    desc: "فريق دعم جاهز على مدار الساعة — عبر الديسكورد والبريد.",
    tint: "from-amber-400/10 to-transparent",
    iconBg: "bg-amber-400/15 text-amber-300 ring-amber-400/25",
    num: "04",
  },
];

export function WhyFluxSection() {
  return (
    <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.35fr] lg:gap-14">
        {/* Statement */}
        <div className="relative">
          <div className="sticky top-28">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-purple-accent">
              لماذا نحن؟
            </p>
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
                متجرٌ صُنع ليكون{" "}
                <span className="text-gradient">جديراً بثقتك</span>
              </h2>
              <p className="mt-4 max-w-md text-[14px] leading-relaxed text-gray-text">
                Flux Store ليس مجرد متجر — تجربة تسوق رقمية متكاملة. نختار كل
                منتج بعناية، ونؤمّن كل عملية شراء، ونبقى بجانبك بعد البيع.
              </p>
            <Link
              href="/faq"
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-[13px] font-semibold text-gray-text transition-all hover:border-purple-accent/50 hover:text-white"
            >
              تعرّف علينا أكثر
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Features grid */}
        <div className="grid gap-3 sm:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.num}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-surface p-6 transition-all duration-300 hover:border-purple-accent/40 hover:bg-surface-raised"
            >
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                  f.tint
                )}
              />
              <span className="absolute left-5 top-5 text-3xl font-extrabold text-white/5">
                {f.num}
              </span>
              <div
                className={cn(
                  "relative mb-4 flex h-11 w-11 items-center justify-center rounded-xl ring-1",
                  f.iconBg
                )}
              >
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="relative text-[15px] font-bold text-white">
                {f.title}
              </h3>
              <p className="relative mt-1.5 text-[12.5px] leading-relaxed text-gray-text">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
