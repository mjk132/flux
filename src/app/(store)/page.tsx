import Link from "next/link";
import {
  Package,
  LayoutGrid,
  MessageSquareQuote,
  Star,
  ArrowLeft,
} from "lucide-react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { HeroSection } from "@/components/store/hero-section";
import { CategoryCard } from "@/components/store/category-card";
import { ProductGrid } from "@/components/store/product-grid";
import { SpecialOffers } from "@/components/store/special-offers";
import { WhyFluxSection } from "@/components/store/why-flux-section";
import { HowItWorksSection } from "@/components/store/how-it-works";
import { ReviewsSection } from "@/components/store/reviews-section";
import { FaqSection } from "@/components/store/faq-section";
import { DiscordCtaSection } from "@/components/store/discord-cta";
import { Reveal } from "@/components/store/reveal";
import type { ProductCardData } from "@/components/store/product-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Flux Store - حلول رقمية بهوية مختلفة",
  description:
    "بوتات ديسكورد، سكربتات FiveM، مواقع وتصاميم — جودة عالية، تسليم سريع ودعم متواصل.",
};

function toCard(
  p: {
    id: string;
    slug: string;
    name: string;
    nameAr: string | null;
    price: number;
    comparePrice: number | null;
    discount: number | null;
    stock: number;
    shortDescription: string | null;
    isFeatured: boolean;
    isBestSeller: boolean;
    createdAt: Date;
    images?: { url: string; alt: string | null }[];
    category?: { name: string; nameAr: string | null; slug: string } | null;
    reviews?: { rating: number }[];
    _count?: { orderItems: number };
  }
): ProductCardData {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    nameAr: p.nameAr,
    price: p.price,
    comparePrice: p.comparePrice,
    discount: p.discount ?? undefined,
    stock: p.stock,
    shortDescription: p.shortDescription,
    isFeatured: p.isFeatured,
    isBestSeller: p.isBestSeller,
    createdAt: p.createdAt,
    category: p.category,
    images: p.images,
    reviews: p.reviews,
    salesCount: p._count?.orderItems ?? 0,
  };
}

export default async function HomePage() {
  const [categories, stats, bestSellers, offers, featured, reviews, faqs, settings] =
    await Promise.all([
      prisma.category.findMany({
        where: { isVisible: true },
        orderBy: { sortOrder: "asc" },
        include: {
          _count: {
            select: { products: { where: { status: "PUBLISHED" } } },
          },
        },
      }),
      Promise.all([
        prisma.product.count({ where: { status: "PUBLISHED" } }),
        prisma.category.count({ where: { isVisible: true } }),
        prisma.review.count({ where: { status: "APPROVED" } }),
        prisma.review.aggregate({
          where: { status: "APPROVED" },
          _avg: { rating: true },
        }),
      ]),
      prisma.product.findMany({
        where: { status: "PUBLISHED", isBestSeller: true },
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" } },
          category: { select: { name: true, nameAr: true, slug: true } },
          reviews: { where: { status: "APPROVED" }, select: { rating: true } },
          _count: { select: { orderItems: true } },
        },
      }),
      prisma.product.findMany({
        where: { status: "PUBLISHED", comparePrice: { not: null } },
        take: 6,
        orderBy: { createdAt: "desc" },
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" } },
          category: { select: { name: true, nameAr: true, slug: true } },
          reviews: { where: { status: "APPROVED" }, select: { rating: true } },
          _count: { select: { orderItems: true } },
        },
      }),
      prisma.product.findMany({
        where: { status: "PUBLISHED", isFeatured: true },
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          images: { take: 1, orderBy: { sortOrder: "asc" } },
          category: { select: { name: true, nameAr: true, slug: true } },
          reviews: { where: { status: "APPROVED" }, select: { rating: true } },
          _count: { select: { orderItems: true } },
        },
      }),
      prisma.review.findMany({
        where: { status: "APPROVED" },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true } },
          product: { select: { name: true, nameAr: true } },
        },
      }),
      prisma.fAQ.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        take: 4,
      }),
      prisma.setting.findMany({ where: { key: "discord_link" } }),
    ]);

  const [productCount, categoryCount, reviewCount, ratingAgg] = stats;
  const averageRating = ratingAgg._avg.rating ?? 0;
  const discordUrl =
    settings.find((s) => s.key === "discord_link")?.value ||
    "https://discord.gg/fluxstore";

  const statItems = [
    { icon: Package, value: String(productCount), label: "منتج رقمي" },
    { icon: LayoutGrid, value: String(categoryCount), label: "قسم متخصص" },
    { icon: MessageSquareQuote, value: String(reviewCount), label: "تقييم موثق" },
    {
      icon: Star,
      value: averageRating.toFixed(1),
      label: "متوسط التقييم",
    },
  ];

  const categoriesGrid = categories.slice(0, 5);

  return (
    <div className="bg-void">
      {/* ═══════════ HERO ═══════════ */}
      <HeroSection />

      {/* ═══════════ REAL STATS ═══════════ */}
      <section className="border-b border-border/40 bg-surface/40">
        <Reveal variant="fade" duration={600}>
          <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-px px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {statItems.map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-3 border-b border-border/40 px-2 py-6 lg:border-b-0 lg:px-6 lg:[&:not(:last-child)]:border-l"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-accent/10 ring-1 ring-purple-accent/20">
                <s.icon className="h-5 w-5 text-purple-accent" />
              </div>
              <div>
                <p className="text-xl font-extrabold tracking-tight text-white">
                  {s.value}
                </p>
                <p className="text-[11.5px] text-gray-muted">{s.label}</p>
              </div>
            </div>
          ))}
          </div>
        </Reveal>
      </section>

      {/* ═══════════ FEATURED CATEGORIES ═══════════ */}
      {categoriesGrid.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-16">
          <Reveal>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-purple-accent">
                  تصفح حسب القسم
                </p>
                <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  كل أقسام ديسكورد في مكان واحد
                </h2>
              </div>
              <Link
                href="/store"
                className="group inline-flex items-center gap-1.5 text-[13px] font-semibold text-purple-accent transition-colors hover:text-violet"
              >
                كل الأقسام
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
              </Link>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {categoriesGrid.map((cat, i) => (
                <div
                  key={cat.id}
                  className={
                    i === 0
                      ? "col-span-2 row-span-2 lg:col-span-2 lg:row-span-2"
                      : "col-span-1"
                  }
                >
                  <CategoryCard
                    category={cat}
                    size={i === 0 ? "lg" : "sm"}
                    className="h-full"
                  />
                </div>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* ═══════════ BEST SELLERS ═══════════ */}
      {bestSellers.length > 0 && (
        <section className="border-y border-border/40 bg-surface/30">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-16">
            <Reveal>
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-purple-accent">
                    اختيارات مضمونة
                  </p>
                  <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                    الأكثر مبيعاً
                  </h2>
                </div>
                <Link
                  href="/store?bestseller=true"
                  className="group inline-flex items-center gap-1.5 text-[13px] font-semibold text-purple-accent transition-colors hover:text-violet"
                >
                  عرض الكل
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
                </Link>
              </div>
            </Reveal>
            <ProductGrid products={bestSellers.map(toCard)} />
          </div>
        </section>
      )}

      {/* ═══════════ SPECIAL OFFERS ═══════════ */}
      <SpecialOffers offers={offers.map(toCard)} />

      {/* ═══════════ FEATURED PRODUCTS ═══════════ */}
      {featured.length > 0 && (
        <section className="border-t border-border/40">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-16">
            <Reveal>
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-purple-accent">
                    مختارات المحررين
                  </p>
                  <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                    منتجات مميزة
                  </h2>
                </div>
                <Link
                  href="/store?featured=true"
                  className="group inline-flex items-center gap-1.5 text-[13px] font-semibold text-purple-accent transition-colors hover:text-violet"
                >
                  عرض الكل
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
                </Link>
              </div>
            </Reveal>
            <ProductGrid products={featured.map(toCard)} />
          </div>
        </section>
      )}

      {/* ═══════════ WHY FLUX ═══════════ */}
      <Reveal duration={800}>
        <WhyFluxSection />
      </Reveal>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <Reveal duration={800}>
        <HowItWorksSection />
      </Reveal>

      {/* ═══════════ REVIEWS ═══════════ */}
      <Reveal duration={800}>
        <ReviewsSection reviews={reviews} averageRating={averageRating} />
      </Reveal>

      {/* ═══════════ FAQ ═══════════ */}
      <Reveal duration={800}>
        <FaqSection faqs={faqs} />
      </Reveal>

      {/* ═══════════ DISCORD CTA ═══════════ */}
      <Reveal duration={800}>
        <DiscordCtaSection discordUrl={discordUrl} />
      </Reveal>
    </div>
  );
}
