import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Zap,
  ShieldCheck,
  Headphones,
  CreditCard,
  Gamepad2,
  Globe,
  Star,
} from "lucide-react";

const trust = [
  { icon: Zap, label: "تسليم فوري" },
  { icon: ShieldCheck, label: "ضمان شامل" },
  { icon: Headphones, label: "دعم 24/7" },
  { icon: CreditCard, label: "دفع آمن" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Layered background — follows the active palette (dark by default) */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-purple via-void to-void" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_80%_0%,rgba(47,123,255,0.14),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_5%_100%,rgba(90,162,255,0.12),transparent_60%)]" />
      <div className="absolute inset-0 bg-grid opacity-80" />

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2 lg:gap-8">
          {/* ── Copy ── */}
          <div className="max-w-xl">
            {/* Eyebrow */}
            <div
              className="animate-flux-up mb-6 inline-flex items-center gap-2.5 rounded-full border border-border bg-surface/80 px-3.5 py-1.5 shadow-sm backdrop-blur-sm"
              style={{ animationDelay: "40ms" }}
            >
              <div className="relative h-5 w-5 overflow-hidden rounded-full">
                <Image
                  src="/logo.png"
                  alt="Flux"
                  fill
                  sizes="20px"
                  className="object-cover"
                />
              </div>
              <span className="text-[12px] font-semibold text-gray-text">
                Flux Store — متجرك الرقمي الأول
              </span>
              <span className="h-1 w-1 rounded-full bg-purple-accent" />
            </div>

            {/* Headline */}
            <h1
              className="animate-flux-up text-balance text-4xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-[54px]"
              style={{ animationDelay: "120ms" }}
            >
              حلول رقمية،
              <span className="mt-1 block text-gradient">بهوية مختلفة</span>
            </h1>

            {/* Sub */}
            <p
              className="animate-flux-up mt-5 max-w-md text-[15px] leading-relaxed text-gray-text sm:text-base"
              style={{ animationDelay: "200ms" }}
            >
              بوتات ديسكورد، سكربتات FiveM، مواقع وتصاميم — كل احتياجاتك
              الرقمية في مكانٍ واحد، بجودة عالية ودعم متواصل.
            </p>

            {/* CTAs */}
            <div
              className="animate-flux-up mt-8 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "280ms" }}
            >
              <Link
                href="/store"
                className="group inline-flex h-12 items-center gap-2 rounded-xl bg-purple-accent px-7 text-[14px] font-bold text-[#ffffff] transition-all duration-300 hover:bg-[#1e6bff] hover:shadow-[0_0_30px_rgba(47,123,255,0.4)] active:scale-[0.98]"
              >
                تصفح المتجر
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </Link>
              <Link
                href="/faq"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-surface/60 px-6 text-[14px] font-semibold text-gray-text transition-all duration-300 hover:border-purple-accent/50 hover:text-white"
              >
                كيف يعمل؟
              </Link>
            </div>

            {/* Trust row */}
            <div
              className="animate-flux-up mt-10 flex flex-wrap gap-x-7 gap-y-3 border-t border-border pt-6"
              style={{ animationDelay: "360ms" }}
            >
              {trust.map((t) => (
                <span
                  key={t.label}
                  className="flex items-center gap-2 text-[12.5px] font-medium text-gray-text"
                >
                  <t.icon className="h-4 w-4 text-purple-accent" />
                  {t.label}
                </span>
              ))}
            </div>
          </div>

          {/* ── Visual composition ── */}
          <div
            className="animate-flux-pop relative mx-auto w-full max-w-md lg:max-w-none"
            style={{ animationDelay: "240ms" }}
          >
            {/* Soft glow behind */}
            <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-accent/15 blur-[110px]" />

            {/* Floating chip: fivem */}
            <div className="animate-float absolute right-0 top-8 z-10 hidden sm:block">
              <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-surface/90 px-4 py-3 shadow-xl shadow-blue-500/10 backdrop-blur-md">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet">
                  <Gamepad2 className="h-4 w-4 text-[#ffffff]" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-white">
                    FiveM Script
                  </p>
                  <p className="text-[10px] text-gray-muted">سكربت جاهز</p>
                </div>
              </div>
            </div>

            {/* Floating chip: web design */}
            <div className="animate-float-delayed absolute bottom-12 -left-2 z-10 hidden sm:block">
              <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-surface/90 px-4 py-3 shadow-xl shadow-blue-500/10 backdrop-blur-md">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-500">
                  <Globe className="h-4 w-4 text-[#ffffff]" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-white">
                    Web Design
                  </p>
                  <p className="text-[10px] text-gray-muted">مواقع احترافية</p>
                </div>
              </div>
            </div>

            {/* Floating pulse: available */}
            <div className="animate-float-slow absolute -right-1 top-1/3 z-10 hidden md:block">
              <div className="flex items-center gap-2 rounded-full border border-success/25 bg-surface/95 px-3 py-1.5 shadow-lg shadow-success/10 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                <span className="text-[11px] font-bold text-success">
                  متوفر الآن
                </span>
              </div>
            </div>

            {/* Rating chip */}
            <div className="animate-float-slow absolute bottom-0 right-8 z-10 hidden lg:block">
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface/95 px-3.5 py-2.5 shadow-xl shadow-blue-500/10 backdrop-blur-md">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <span className="text-[11px] font-bold text-white">
                  4.9/5
                </span>
              </div>
            </div>

            {/* Main image card */}
            <div className="relative z-[5] mx-auto w-[88%] sm:w-[80%]">
              <div className="rounded-[28px] bg-surface p-2 shadow-[0_30px_80px_-20px_rgba(47,123,255,0.45)] ring-1 ring-border">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-gradient-to-br from-blue-100 to-indigo-100">
                  <Image
                    src="/flux-welcome.png"
                    alt="Flux Store"
                    fill
                    sizes="(max-width: 768px) 90vw, 480px"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Bottom gradient fade */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-void to-transparent" />
          </div>
        </div>
      </div>

      {/* Bottom edge */}
      <div className="relative h-px bg-gradient-to-r from-transparent via-purple-accent/50 to-transparent" />
    </section>
  );
}