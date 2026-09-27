import Link from "next/link";
import Image from "next/image";
import { Gamepad2, Globe } from "lucide-react";
import { formatPrice } from "@/lib/utils";

/**
 * The hero is the page's one orchestrated motion moment: copy blocks and
 * the visual composition enter once, staggered (CSS `animate-flux-up` +
 * inline delays). Nothing here loops or floats forever — the section is
 * fully readable with motion disabled.
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
export interface HeroProduct {
  slug: string;
  name: string;
  image: string;
  category: string | null;
  finalPrice: number;
  wasPrice: number | null;
}

const offeringChips = [
  {
    icon: Gamepad2,
    title: "Discord & FiveM",
    subtitle: "بوتات وسكربتات جاهزة",
    position: "right-0 top-8",
    hidden: "hidden sm:block",
  },
  {
    icon: Globe,
    title: "Web & Dashboards",
    subtitle: "مواقع ولوحات تحكم",
    position: "bottom-12 -left-2",
    hidden: "hidden sm:block",
  },
];

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
                className="group inline-flex h-12 items-center gap-2 rounded-lg bg-accent-solid px-7 text-[14px] font-bold text-[#ffffff] transition-[background-color,box-shadow,transform] duration-300 hover:bg-[#1554c9] active:scale-[0.98]"
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

          {/* ── Visual composition ── */}
          <div
            className="animate-flux-pop relative mx-auto w-full max-w-md lg:max-w-none"
            style={{ animationDelay: "240ms" }}
          >
            {/* Soft glow behind */}
            <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-accent/10 blur-[110px]" />

            {/* Offering chips — describe what FLUX actually sells (static:
                no perpetual float; they ride the composition's entrance) */}
            {offeringChips.map((chip) => (
              <div
                key={chip.title}
                className={`absolute ${chip.position} ${chip.hidden} z-10 animate-flux-up`}
                style={{ animationDelay: "440ms" }}
              >
                <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-surface/90 px-4 py-3 shadow-xl shadow-blue-500/10 backdrop-blur-md">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-accent/10 ring-1 ring-purple-accent/20">
                    <chip.icon
                      className="h-4 w-4 text-purple-accent"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-white">
                      {chip.title}
                    </p>
                    <p className="text-[11px] text-gray-muted">
                      {chip.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Main plate — the real lead product inside the dark panel
                treatment; a typographic FLUX plate when there is none */}
            <div className="relative z-[5] mx-auto w-[88%] sm:w-[80%]">
              {product ? (
                <Link
                  href={`/store/${product.slug}`}
                  aria-label={`${product.name} — عرض المنتج`}
                  className="group block rounded-[28px] bg-surface p-2 shadow-[0_30px_80px_-24px_rgba(47,123,255,0.28)] ring-1 ring-border transition-shadow duration-300 hover:shadow-[0_36px_90px_-26px_rgba(47,123,255,0.4)]"
                >
                  <div className="relative aspect-square overflow-hidden rounded-[20px] flux-dark-panel bg-void">
                    {/* Panel light + hairline grid (same material as the
                        product cards' generated art, so the homepage and
                        the store speak one visual language) */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.07),transparent_55%)]" />
                    <div
                      className="absolute inset-0 opacity-25"
                      style={{
                        backgroundImage:
                          "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                        backgroundSize: "28px 28px",
                        maskImage:
                          "radial-gradient(circle at 50% 45%, black, transparent 78%)",
                        WebkitMaskImage:
                          "radial-gradient(circle at 50% 45%, black, transparent 78%)",
                      }}
                    />
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 88vw, (max-width: 1024px) 80vw, 560px"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                      priority
                    />

                    {/* Real name + real price, riding the composition */}
                    <div
                      className="animate-flux-up absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-near-black/85 px-3.5 py-2.5 backdrop-blur-md"
                      style={{ animationDelay: "600ms" }}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-bold text-white">
                          {product.name}
                        </p>
                        {product.category && (
                          <p className="truncate text-[11px] text-gray-muted">
                            {product.category}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 text-left">
                        <p className="text-[15px] font-extrabold text-white tabular-nums">
                          {formatPrice(product.finalPrice)}
                        </p>
                        {product.wasPrice !== null && (
                          <p className="text-[11px] text-gray-muted line-through tabular-nums">
                            {formatPrice(product.wasPrice)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                /* Identity fallback: dark panel, wordmark, no invented
                   imagery and no light pastel card in a dark hero */
                <div className="rounded-[28px] bg-surface p-2 shadow-[0_30px_80px_-24px_rgba(47,123,255,0.28)] ring-1 ring-border">
                  <div className="relative flex aspect-square flex-col items-center justify-center gap-3 overflow-hidden rounded-[20px] flux-dark-panel bg-void">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(47,123,255,0.12),transparent_60%)]" />
                    <div
                      className="absolute inset-0 opacity-25"
                      style={{
                        backgroundImage:
                          "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                        backgroundSize: "28px 28px",
                        maskImage:
                          "radial-gradient(circle at 50% 45%, black, transparent 78%)",
                        WebkitMaskImage:
                          "radial-gradient(circle at 50% 45%, black, transparent 78%)",
                      }}
                    />
                    <p className="relative text-4xl font-extrabold tracking-tight text-white">
                      FLUX
                    </p>
                    <p className="relative text-[12px] text-gray-muted">
                      منتجات رقمية وتطوير مخصص
                    </p>
                  </div>
                </div>
              )}
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
