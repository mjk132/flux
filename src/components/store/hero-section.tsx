import Link from "next/link";
import Image from "next/image";
import { HeroVisual, type HeroProduct } from "./hero-visual";

/**
 * The hero is the page's one orchestrated motion moment: copy blocks and
 * the visual composition enter once, staggered (CSS `animate-flux-up` +
 * inline delays), then the composition gains depth — a pointer-driven 3D
 * tilt with counter-parallax on the glow and chips, plus a slow scroll
 * lag (see HeroVisual; desktop pointers only, fully skipped under
 * prefers-reduced-motion). Nothing here loops or floats forever — the
 * section is fully readable with motion disabled.
 *
 * Copy rules: only claims the store can back up today (products exist,
 * PayPal checkout, delivery via account). No ratings, no "#1", no
 * fabricated trust badges — those live as a capability strip below.
 *
 * The visual centerpiece is the store's real lead product render inside
 * the dark panel treatment (never the light "welcome" card — it fought
 * both the palette and the message). With no product image available it
 * falls back to a typographic FLUX plate in the same dark panel.
 */
export type { HeroProduct };

export function HeroSection({ product }: { product?: HeroProduct | null }) {
  return (
    <section className="relative overflow-hidden">
      {/* Layered background — follows the active palette (dark by default) */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-purple via-void to-void" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_80%_0%,rgba(47,123,255,0.14),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_5%_100%,rgba(90,162,255,0.12),transparent_60%)]" />

      <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
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
                FLUX
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
                className="group inline-flex h-12 items-center gap-2 rounded-lg bg-accent-solid px-7 text-[14px] font-bold text-[#ffffff] transition-[background-color,scale] duration-300 hover:bg-[#1554c9] active:scale-[0.98]"
              >
                تصفح المتجر
              </Link>
              <Link
                href="/services"
                className="inline-flex h-12 items-center gap-2 rounded-lg border border-border bg-surface/60 px-6 text-[14px] font-semibold text-gray-text transition-[border-color,color] duration-300 hover:border-purple-accent/50 hover:text-white"
              >
                اطلب خدمة
              </Link>
            </div>
          </div>

          {/* ── Visual composition (client: tilt + parallax) ── */}
          <HeroVisual product={product} />
        </div>
      </div>

      {/* Bottom edge */}
      <div className="relative h-px bg-gradient-to-r from-transparent via-purple-accent/50 to-transparent" />
    </section>
  );
}
