"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, ArrowLeft, ShoppingCart, BadgePercent } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { getSalePrice } from "@/lib/pricing";
import { ProductVisual } from "./product-visual";
import { useCartStore } from "@/store/cart";
import { useToast } from "@/components/ui/toast";
import type { ProductCardData } from "./product-card";

interface SpecialOffersProps {
  offers: ProductCardData[];
}

function useCountdown() {
  const [left, setLeft] = useState({ h: "00", m: "00", s: "00" });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = Math.max(0, midnight.getTime() - now.getTime());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setLeft({
        h: String(h).padStart(2, "0"),
        m: String(m).padStart(2, "0"),
        s: String(s).padStart(2, "0"),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return left;
}

export function SpecialOffers({ offers }: SpecialOffersProps) {
  const addItem = useCartStore((s) => s.addItem);
  const { success: showSuccess } = useToast();
  const { h, m, s } = useCountdown();

  if (offers.length === 0) return null;

  // Biggest real saving first, measured the same way the price is charged.
  const sorted = [...offers].sort(
    (a, b) => getSalePrice(b).percent - getSalePrice(a).percent
  );

  const featured = sorted[0];
  const rest = sorted.slice(1, 4);

  const featuredSale = getSalePrice(featured);

  const handleAdd = (p: ProductCardData) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (p.stock <= 0) return;
    addItem({
      productId: p.id,
      name: p.name,
      price: getSalePrice(p).final,
      image: p.images?.[0]?.url || "/logo.png",
    });
    showSuccess("تمت إضافة المنتج إلى السلة");
  };

  return (
    <section id="offers" className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-purple-accent">
            <BadgePercent className="h-3.5 w-3.5" />
            عروض محدودة
          </p>
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            عروض اليوم
          </h2>
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[12px] text-gray-muted">
            <Clock className="h-4 w-4 text-purple-accent" />
            ينتهي عند منتصف الليل
          </span>
          <div className="flex gap-1.5" dir="ltr">
            {[
              { v: h, l: "ساعة" },
              { v: m, l: "دقيقة" },
              { v: s, l: "ثانية" },
            ].map((t) => (
              <div
                key={t.l}
                className="flex h-11 w-11 flex-col items-center justify-center rounded-lg border border-purple-accent/25 bg-purple-accent/10"
              >
                <span className="text-[15px] font-extrabold tabular-nums text-white">
                  {t.v}
                </span>
                <span className="text-[8.5px] text-gray-muted">{t.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Featured offer */}
        <Link
          href={`/store/${featured.slug}`}
          className="group relative overflow-hidden rounded-2xl border border-purple-accent/30 bg-gradient-to-br from-purple-accent/25 via-deep-purple to-surface lg:col-span-2"
        >
          <div className="absolute inset-0 bg-grid opacity-60" />
          <div className="relative p-6 sm:p-8">
            <span className="inline-flex items-center gap-1 rounded-full bg-danger px-3 py-1 text-[11px] font-bold text-white shadow-lg shadow-danger/30">
              خصم يصل إلى {featuredSale.percent}%
            </span>
            <h3 className="mt-4 text-xl font-extrabold leading-snug text-white sm:text-2xl">
              {featured.nameAr || featured.name}
            </h3>
            <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-gray-text">
              {featured.shortDescription || "عرض لفترة محدودة — اطلبه الآن قبل انتهاء الوقت."}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xl font-extrabold text-white">
                {formatPrice(featuredSale.final)}
              </span>
              {featuredSale.was !== null && (
                <span className="text-sm text-gray-muted line-through">
                  {formatPrice(featuredSale.was)}
                </span>
              )}
            </div>
            <button
              onClick={handleAdd(featured)}
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-purple-accent px-5 text-[13px] font-bold text-[#ffffff] transition-all hover:bg-[#1e6bff] hover:shadow-[0_0_20px_rgba(47,123,255,0.35)]"
            >
              <ShoppingCart className="h-4 w-4" />
              اطلبه الآن
            </button>
          </div>
          {/* Visual */}
          <div className="absolute -left-10 -bottom-10 h-48 w-48 rotate-12 opacity-25 transition-transform duration-500 group-hover:rotate-0 sm:opacity-40">
            <ProductVisual
              categorySlug={featured.category?.slug}
              productName={featured.name}
            />
          </div>
        </Link>

        {/* Other offers list */}
        <div className="space-y-3 lg:col-span-3">
          {rest.map((offer) => {
            const sale = getSalePrice(offer);
            return (
              <Link
                key={offer.id}
                href={`/store/${offer.slug}`}
                className="group flex items-center gap-4 rounded-2xl border border-border/60 bg-surface p-3 transition-all hover:border-purple-accent/40 hover:bg-surface-raised"
              >
                <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl">
                  <ProductVisual
                    categorySlug={offer.category?.slug}
                    productName={offer.name}
                    imageUrl={offer.images?.[0]?.url}
                    className="object-cover"
                  />
                  {sale.percent > 0 && (
                    <span className="absolute right-1 top-1 rounded bg-danger px-1.5 py-0.5 text-[9px] font-bold text-white">
                      -{sale.percent}%
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-[13.5px] font-bold text-white">
                    {offer.nameAr || offer.name}
                  </h4>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[15px] font-extrabold text-purple-accent">
                      {formatPrice(sale.final)}
                    </span>
                    {sale.was !== null && (
                      <span className="text-[11px] text-gray-muted line-through">
                        {formatPrice(sale.was)}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleAdd(offer)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/70 text-gray-text transition-all hover:border-purple-accent hover:bg-purple-accent hover:text-white"
                  aria-label="أضف للسلة"
                >
                  <ShoppingCart className="h-4 w-4" />
                </button>
                <ArrowLeft className="h-4 w-4 shrink-0 text-gray-muted transition-transform group-hover:-translate-x-1 group-hover:text-white" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
