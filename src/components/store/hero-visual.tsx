"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Gamepad2, Globe } from "lucide-react";
import { formatPrice } from "@/lib/utils";

/**
 * The hero's visual composition: real lead-product plate flanked by two
 * offering chips, plus the depth treatment — pointer-driven 3D tilt on the
 * plate, counter-parallax on the glow and chips, and a slow scroll parallax
 * so the composition lags the copy as the hero leaves the viewport.
 *
 * Motion contract:
 *  - desktop pointers only (`hover: hover and pointer: fine`) — touch
 *    devices get the static composition;
 *  - skipped entirely under `prefers-reduced-motion`;
 *  - transform-only updates, coalesced through one rAF, transition smoothed
 *    by CSS so the plate springs back on pointer leave;
 *  - SSR renders the final layout (no inline transform), so a JS failure
 *    leaves a fully readable hero.
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

export function HeroVisual({ product }: { product?: HeroProduct | null }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const root = rootRef.current;
    const plate = plateRef.current;
    const glow = glowRef.current;
    const chips = chipRefs.current;
    if (!root || !plate) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduce.matches) return;

    // Normalized pointer offset (-0.5 … 0.5) and scroll progress (0 … 1).
    let nx = 0;
    let ny = 0;
    let progress = 0;
    let raf = 0;

    const apply = () => {
      raf = 0;
      const tiltX = (-ny * 4).toFixed(2);
      const tiltY = (nx * 5).toFixed(2);
      // Scroll lags: plate drifts up slightly slower than the page.
      const plateY = (progress * 36).toFixed(1);
      plate.style.transform = `perspective(1100px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translate3d(0, ${plateY}px, 0)`;

      if (glow) {
        glow.style.transform = `translate3d(${(-nx * 22).toFixed(1)}px, ${(
          -ny * 16 +
          progress * 48
        ).toFixed(1)}px, 0)`;
      }
      chips.forEach((chip) => {
        if (chip) {
          chip.style.transform = `translate3d(${(-nx * 10).toFixed(1)}px, ${(
            -ny * 8 +
            progress * 20
          ).toFixed(1)}px, 0)`;
        }
      });
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const rect = root.getBoundingClientRect();
      nx = (e.clientX - rect.left) / rect.width - 0.5;
      ny = (e.clientY - rect.top) / rect.height - 0.5;
      schedule();
    };

    const onPointerLeave = () => {
      nx = 0;
      ny = 0;
      schedule();
    };

    const onScroll = () => {
      const rect = root.getBoundingClientRect();
      // Progress only while the hero is crossing the viewport; clamp so the
      // layers stop moving once the section is fully behind you.
      const p = Math.min(Math.max(-rect.top / Math.max(rect.height, 1), 0), 1);
      if (p !== progress) {
        progress = p;
        schedule();
      }
    };

    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      // Hand the layout back exactly as the server rendered it.
      plate.style.transform = "";
      if (glow) glow.style.transform = "";
      chips.forEach((chip) => {
        if (chip) chip.style.transform = "";
      });
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="animate-flux-pop relative mx-auto w-full max-w-md lg:max-w-none"
      style={{ animationDelay: "240ms" }}
    >
      {/* Soft glow behind — counter-parallaxes against the plate */}
      <div
        ref={glowRef}
        className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-accent/10 blur-[110px]"
        style={{ transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)" }}
      />

      {/* Offering chips — describe what FLUX actually sells (static copy;
          they only ride the pointer/scroll parallax) */}
      {offeringChips.map((chip, i) => (
        <div
          key={chip.title}
          ref={(el) => {
            chipRefs.current[i] = el;
          }}
          className={`absolute ${chip.position} ${chip.hidden} z-10`}
          style={{
            transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {/* Entrance rides the inner card, not the wrapper: the wrapper's
              transform belongs to the parallax (an animation's fill would
              otherwise pin it and kill the pointer/scroll drift). */}
          <div
            className="animate-flux-up flex items-center gap-2.5 rounded-2xl border border-border bg-surface/90 px-4 py-3 shadow-xl shadow-blue-500/10 backdrop-blur-md"
            style={{ animationDelay: "440ms" }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-accent/10 ring-1 ring-purple-accent/20">
              <chip.icon className="h-4 w-4 text-purple-accent" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[12px] font-bold text-white">{chip.title}</p>
              <p className="text-[11px] text-gray-muted">{chip.subtitle}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Main plate — the real lead product inside the dark panel
          treatment; a typographic FLUX plate when there is none */}
      <div className="relative z-[5] mx-auto w-[88%] sm:w-[80%]">
        <div
          ref={plateRef}
          style={{
            /* Tight enough that the plate tracks the pointer without
               feeling syrupy; long enough to spring back on leave. */
            transition: "transform 0.25s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
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
      </div>

      {/* Bottom gradient fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-void to-transparent" />
    </div>
  );
}
