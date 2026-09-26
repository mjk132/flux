import {
  CreditCard,
  PackageCheck,
  Wrench,
  MessagesSquare,
} from "lucide-react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { HeroSection } from "@/components/store/hero-section";
import { CategoryCard } from "@/components/store/category-card";
import { ProductGrid } from "@/components/store/product-grid";
import { WhyFluxSection } from "@/components/store/why-flux-section";
import { ReviewsSection } from "@/components/store/reviews-section";
import { FaqSection } from "@/components/store/faq-section";
import { DiscordCtaSection } from "@/components/store/discord-cta";
import { ServicesSection } from "@/components/store/services-section";
import { SectionHeading } from "@/components/store/section-heading";
import type { ProductCardData } from "@/components/store/product-card";

/* Prerendered at build + ISR instead of `force-dynamic`.
   Rendering this page on every request cost ~3.2s (always cache MISS) and
   meant the router could never prefetch it, so going *back* to the homepage
   re-rendered it server-side. With `revalidate` it ships from the CDN in
   ~60ms and Next prefetches it in full (5 min client cache). Content still
   refreshes in the background every minute. */
export const revalidate = 60;

export const metadata: Metadata = {
  title: "FLUX — منتجات رقمية وتطوير مخصص",
  description:
    "بوتات ديسكورد وسكربتات FiveM جاهزة، وتطوير مواقع ولوحات تحكم وبرمجة مخصصة — الدفع عبر PayPal والتسليم عبر حسابك.",
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

/* Capability strip: statements that are true from day one, regardless of
   how many orders or reviews the store has. Replaces the old stats row
   that printed "0 تقييم موثق" / "0.0 متوسط التقييم" to every visitor. */
const capabilities = [
  {
    icon: CreditCard,
    title: "الدفع عبر PayPal",
    desc: "تحويل مباشر مع رفع صورة الإيصال في صفحة الطلب.",
  },
  {
    icon: PackageCheck,
    title: "التسليم عبر حسابك",
    desc: "المنتجات الرقمية تظهر في حسابك بعد اعتماد الدفع.",
  },
  {
    icon: Wrench,
    title: "تطوير مخصص",
    desc: "ديسكورد، FiveM، مواقع، لوحات تحكم وبرمجة مخصصة.",
  },
  {
    icon: MessagesSquare,
    title: "دعم عبر الديسكورد",
    desc: "للاستفسار والطلب والمساعدة بعد الشراء.",
  },
];

export default async function HomePage() {
  const [categories, products, reviews, faqs, settings, ratingAgg] =
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
      prisma.product.findMany({
        where: { status: "PUBLISHED" },
        take: 8,
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
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
      prisma.review.aggregate({
        where: { status: "APPROVED" },
        _avg: { rating: true },
      }),
    ]);

  const averageRating = ratingAgg._avg.rating ?? 0;
  const discordUrl =
    settings.find((s) => s.key === "discord_link")?.value || "";

  /* Category tiles only for categories that actually hold products, and
     the section only earns its place once there are two or more — a
     single "0 منتج" tile is a dead end, not navigation. */
  const categoriesWithProducts = categories.filter(
    (c) => c._count.products > 0
  );
  const showCategories = categoriesWithProducts.length >= 2;

  return (
    <div className="bg-void">
      {/* ═══════════ HERO ═══════════ */}
      <HeroSection />

      {/* ═══════════ CAPABILITIES (always true) ═══════════ */}
      <section className="border-b border-border/40 bg-surface/40">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-px px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {capabilities.map((s) => (
            <div
              key={s.title}
              className="flex items-start gap-3 border-b border-border/40 px-2 py-6 lg:border-b-0 lg:px-6 lg:[&:not(:last-child)]:border-l"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-accent/10 ring-1 ring-purple-accent/20">
                <s.icon className="h-5 w-5 text-purple-accent" />
              </div>
              <div>
                <p className="text-[14px] font-bold text-white">{s.title}</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-gray-muted">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ CATEGORIES (only non-empty ones) ═══════════ */}
      {showCategories && (
        <section className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-16">
          <SectionHeading
            eyebrow="تصفح حسب القسم"
            title="الأقسام"
            description="اختر القسم الذي يناسب احتياجك — كل المنتجات منظّمة بداخله."
            href="/store"
            actionLabel="كل الأقسام"
          />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {categoriesWithProducts.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                className="h-full"
              />
            ))}
          </div>
        </section>
      )}

      {/* ═══════════ PRODUCTS ═══════════ */}
      {products.length > 0 && (
        <section className="border-y border-border/40 bg-surface/30">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-16">
            <SectionHeading
              eyebrow="المتجر"
              title="منتجات متاحة الآن"
              description="منتجات رقمية جاهزة للشراء — السعر والخصم معلنان قبل الطلب."
              href="/store"
              actionLabel="كل المنتجات"
            />
            <ProductGrid products={products.map(toCard)} />
          </div>
        </section>
      )}

      {/* ═══════════ SERVICES ═══════════ */}
      <ServicesSection />

      {/* ═══════════ WHY FLUX ═══════════ */}
      <WhyFluxSection />

      {/* ═══════════ REVIEWS (renders only with real approved reviews) */}
      <ReviewsSection reviews={reviews} averageRating={averageRating} />

      {/* ═══════════ FAQ ═══════════ */}
      <FaqSection faqs={faqs} />

      {/* ═══════════ FINAL CTA ═══════════ */}
      <DiscordCtaSection discordUrl={discordUrl} />
    </div>
  );
}
