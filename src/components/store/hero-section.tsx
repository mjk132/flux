import Link from "next/link";
import Image from "next/image";
import { Gamepad2, Globe } from "lucide-react";

/**
 * The hero is the page's one orchestrated motion moment: copy blocks and
 * the visual composition enter once, staggered (CSS `animate-flux-up` +
 * inline delays). Nothing here loops or floats forever — the section is
 * fully readable with motion disabled.
 *
 * Copy rules: only claims the store can back up today (products exist,
 * PayPal checkout, delivery via account). No ratings, no "#1", no
 * fabricated trust badges — those live as a capability strip below.
 */
const offeringChips = [
  {
    icon: Gamepad2,
    title: "Discord & FiveM",
    subtitle: "بوتات وسكربتات جاهزة",
    position: "right-0 top-8",
    hidden: "hidden sm:block",
    iconBg: "bg-gradient-to-br from-fuchsia-500 to-violet",
  },
  {
    icon: Globe,
    title: "Web & Dashboards",
    subtitle: "مواقع ولوحات تحكم",
    position: "bottom-12 -left-2",
    hidden: "hidden sm:block",
    iconBg: "bg-gradient-to-br from-pink-500 to-purple-500",
  },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Layered background — follows the active palette (dark by default) */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-purple via-void to-void" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_80%_0%,rgba(47,123,255,0.14),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_5%_100%,rgba(90,162,255,0.12),transparent_60%)]" />

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2 lg:gap-8">
          {/* ── Copy ── */}
          <div className="max-w-xl">
            {/* Brand line */}
            <div
              className="animate-flux-up mb-6 inline-flex items-center gap-2.5 rounded-full border border-border bg-surface/80 px-3.5 py-1.5 shadow-sm backdrop-blur-sm"
              style={{ animationDelay: "40ms" }}
            >
              <div className="relative h-5 w-5 overflow-hidden rounded-full">
                <Image
                  src="/logo.png"
                  alt=""
                  fill
                  sizes="20px"
                  className="object-cover"
                />
              </div>
              <span className="text-[12px] font-semibold text-gray-text">
                FLUX Development
              </span>
              <span className="h-1 w-1 rounded-full bg-purple-accent" />
            </div>

            {/* Headline */}
            <h1
              className="animate-flux-up text-balance text-4xl font-extrabold leading-[1.15] text-white sm:text-5xl lg:text-[54px]"
              style={{ animationDelay: "120ms" }}
            >
              منتجات رقمية جاهزة،
              <span className="mt-1 block">وتطوير يبدأ من فكرتك</span>
            </h1>

            {/* Sub — says what FLUX is, what it offers, and how buying works */}
            <p
              className="animate-flux-up mt-5 max-w-md text-[15px] leading-relaxed text-gray-text sm:text-base"
              style={{ animationDelay: "200ms" }}
            >
              بوتات ديسكورد وسكربتات FiveM تشتريها الآن، أو موقع ولوحة تحكم
              تُنفَّذ من الصفر لطلبك — مع الدفع عبر PayPal والتسليم عبر حسابك.
            </p>

            {/* CTAs: explore the store, or request a service */}
            <div
              className="animate-flux-up mt-8 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "280ms" }}
            >
              <Link
                href="/store"
                className="group inline-flex h-12 items-center gap-2 rounded-xl bg-purple-accent px-7 text-[14px] font-bold text-[#ffffff] transition-all duration-300 hover:bg-[#1e6bff] active:scale-[0.98]"
              >
                تصفح المتجر
              </Link>
              <Link
                href="/services"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-surface/60 px-6 text-[14px] font-semibold text-gray-text transition-all duration-300 hover:border-purple-accent/50 hover:text-white"
              >
                اطلب خدمة
              </Link>
            </div>
          </div>

          {/* ── Visual composition ── */}
          <div
            className="animate-flux-pop relative mx-auto w-full max-w-md lg:max-w-none"
            style={{ animationDelay: "240ms" }}
          >
            {/* Soft glow behind */}
            <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-accent/15 blur-[110px]" />

            {/* Offering chips — describe what FLUX actually sells (static:
                no perpetual float; they ride the composition's entrance) */}
            {offeringChips.map((chip) => (
              <div
                key={chip.title}
                className={`absolute ${chip.position} ${chip.hidden} z-10 animate-flux-up`}
                style={{ animationDelay: "440ms" }}
              >
                <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-surface/90 px-4 py-3 shadow-xl shadow-blue-500/10 backdrop-blur-md">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${chip.iconBg}`}
                  >
                    <chip.icon className="h-4 w-4 text-[#ffffff]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-white">
                      {chip.title}
                    </p>
                    <p className="text-[10px] text-gray-muted">
                      {chip.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Main image card */}
            <div className="relative z-[5] mx-auto w-[88%] sm:w-[80%]">
              <div className="rounded-[28px] bg-surface p-2 shadow-[0_30px_80px_-20px_rgba(47,123,255,0.45)] ring-1 ring-border">
                <div className="relative aspect-square overflow-hidden rounded-[20px] bg-gradient-to-br from-blue-100 to-indigo-100">
                  <Image
                    src="/flux-welcome-square.webp"
                    alt="FLUX"
                    fill
                    sizes="(max-width: 768px) 88vw, (max-width: 1024px) 80vw, 520px"
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
