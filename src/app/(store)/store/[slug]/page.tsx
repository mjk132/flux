import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { getSalePrice } from "@/lib/pricing";
import type { Metadata } from "next";
import { Star, ChevronLeft, Package } from "lucide-react";
import ProductDetailClient from "./product-detail-client";

// Static + ISR. Product pages are prerendered for every published slug at
// build (see generateStaticParams), so the router prefetches them in full and
// navigating is instant. A slug created after the build is rendered on first
// visit and cached from then on.
export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

/** Every published product gets its own static page at build time. */
export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
    orderBy: { createdAt: "desc" },
  });
  return products.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      name: true,
      nameAr: true,
      metaTitle: true,
      metaDescription: true,
      description: true,
      shortDescription: true,
    },
  });

  if (!product) return { title: "المنتج غير موجود" };

  return {
    title: product.metaTitle || `${product.nameAr || product.name} | Flux Store`,
    description:
      product.metaDescription ||
      product.shortDescription ||
      product.description.substring(0, 160) ||
      `${product.nameAr || product.name} — منتج رقمي من FLUX، الدفع عبر PayPal والتسليم عبر حسابك.`,
    openGraph: {
      title: product.nameAr || product.name,
      description: product.metaDescription || product.shortDescription || "",
      type: "website",
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      category: { select: { id: true, name: true, nameAr: true, slug: true } },
      reviews: {
        where: { status: "APPROVED" },
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
      inventory: {
        where: { status: "AVAILABLE" },
        select: { code: true },
      },
    },
  });

  if (!product) notFound();

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) /
        product.reviews.length
      : 0;

  // Charged price, struck-through "was" price and badge percentage all come
  // from the one helper the product card and the checkout also use.
  const sale = getSalePrice(product);
  const finalPrice = sale.final;

  const relatedProducts = await prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    take: 4,
    include: {
      images: { take: 1, orderBy: { sortOrder: "asc" } },
      reviews: { where: { status: "APPROVED" }, select: { rating: true } },
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-text">
        <Link href="/" className="hover:text-white transition-colors">
          الرئيسية
        </Link>
        <ChevronLeft className="h-3 w-3" />
        <Link href="/store" className="hover:text-white transition-colors">
          المتجر
        </Link>
        <ChevronLeft className="h-3 w-3" />
        <Link
          href={`/store?category=${product.category.slug}`}
          className="hover:text-white transition-colors"
        >
          {product.category.nameAr || product.category.name}
        </Link>
        <ChevronLeft className="h-3 w-3" />
        <span className="text-white">
          {product.nameAr || product.name}
        </span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Product Images */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-deep-purple">
            {product.images.length > 0 ? (
              <Image
                src={product.images[0].url}
                alt={product.images[0].alt || product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-text">
                <Package className="h-24 w-24" />
              </div>
            )}
            {sale.percent > 0 && (
              <span className="absolute right-4 top-4 rounded-full bg-danger px-3 py-1 text-sm font-bold text-white">
                -{sale.percent}%
              </span>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {product.images.slice(0, 4).map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-square overflow-hidden rounded-lg border border-border bg-deep-purple"
                >
                  <Image
                    src={img.url}
                    alt={img.alt || product.name}
                    fill
                    sizes="(max-width: 1024px) 25vw, 12vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <span className="mb-2 inline-block text-sm text-purple-accent">
            {product.category.nameAr || product.category.name}
          </span>
          <h1 className="mb-3 text-2xl font-bold text-white md:text-3xl">
            {product.nameAr || product.name}
          </h1>

          {avgRating > 0 && (
            <div className="mb-4 flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i <= Math.round(avgRating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-600"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-text">
                {avgRating.toFixed(1)} ({product.reviews.length} تقييم)
              </span>
            </div>
          )}

          <div className="mb-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-purple-accent">
              {formatPrice(finalPrice)}
            </span>
            {sale.was !== null && (
              <span className="text-lg text-gray-text line-through">
                {formatPrice(sale.was)}
              </span>
            )}
          </div>

          {(product.shortDescription || product.description) && (
            <p className="mb-6 text-sm text-gray-text leading-relaxed">
              {product.shortDescription || product.description.substring(0, 200)}
            </p>
          )}

          <div className="mb-6">
            <span className="text-sm text-gray-text">
              المتوفر:{" "}
              <span
                className={`font-medium ${
                  product.stock > 0 ? "text-success" : "text-danger"
                }`}
              >
                {product.stock > 0 ? `${product.stock} متوفر` : "غير متوفر"}
              </span>
            </span>
          </div>

          <ProductDetailClient
            product={{
              id: product.id,
              name: product.name,
              nameAr: product.nameAr,
              price: product.price,
              discount: product.discount,
              stock: product.stock,
              image: product.images[0]?.url || "",
              slug: product.slug,
              productType: product.productType,
            }}
          />

          {/* Detail sections — every box is conditional on real content.
              A product with no description/features/requirements/delivery
              info/warranty renders none of them: no empty placeholder boxes,
              no invented copy. */}
          {(() => {
            const description = product.descriptionAr || product.description;
            let features: string[] = [];
            try {
              features =
                typeof product.features === "string"
                  ? JSON.parse(product.features)
                  : product.features || [];
            } catch {
              features = [];
            }
            let requirements: string[] = [];
            try {
              requirements =
                typeof product.requirements === "string"
                  ? JSON.parse(product.requirements)
                  : product.requirements || [];
            } catch {
              requirements = [];
            }
            const hasAny = !!(
              description ||
              features.length ||
              requirements.length ||
              product.deliveryInfo ||
              product.warranty
            );
            if (!hasAny) return null;

            return (
              <div className="mt-8 border-t border-border pt-6">
                <div className="space-y-4">
                  {description && (
                    <div className="rounded-lg border border-border bg-surface p-4">
                      <h3 className="mb-2 text-sm font-semibold text-white">
                        الوصف
                      </h3>
                      <div className="text-sm leading-relaxed whitespace-pre-line text-gray-text">
                        {description}
                      </div>
                    </div>
                  )}

                  {features.length > 0 && (
                    <div className="rounded-lg border border-border bg-surface p-4">
                      <h3 className="mb-2 text-sm font-semibold text-white">
                        المميزات
                      </h3>
                      <ul className="space-y-1">
                        {features.map((f: string, i: number) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-gray-text"
                          >
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-accent" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {requirements.length > 0 && (
                    <div className="rounded-lg border border-border bg-surface p-4">
                      <h3 className="mb-2 text-sm font-semibold text-white">
                        المتطلبات
                      </h3>
                      <ul className="space-y-1">
                        {requirements.map((r: string, i: number) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-gray-text"
                          >
                            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-accent" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {product.deliveryInfo && (
                    <div className="rounded-lg border border-border bg-surface p-4">
                      <h3 className="mb-2 text-sm font-semibold text-white">
                        معلومات التسليم
                      </h3>
                      <p className="text-sm text-gray-text">
                        {product.deliveryInfo}
                      </p>
                    </div>
                  )}

                  {product.warranty && (
                    <div className="rounded-lg border border-border bg-surface p-4">
                      <h3 className="mb-2 text-sm font-semibold text-white">
                        الضمان
                      </h3>
                      <p className="text-sm text-gray-text">{product.warranty}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Reviews Section */}
      {product.reviews.length > 0 && (
        <section className="mt-12 border-t border-border pt-8">
          <h2 className="mb-6 text-xl font-bold text-white">
            التقييمات ({product.reviews.length})
          </h2>
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-2xl border border-border bg-surface p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-accent text-xs font-bold text-white">
                    {review.user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {review.user.name}
                    </p>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i <= review.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-text">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-12 border-t border-border pt-8">
          <h2 className="mb-6 text-xl font-bold text-white">منتجات ذات صلة</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {relatedProducts.map((p) => {
              const pAvg =
                p.reviews.length > 0
                  ? p.reviews.reduce((s, r) => s + r.rating, 0) /
                    p.reviews.length
                  : 0;
              const pSale = getSalePrice(p);

              return (
                <Link
                  key={p.id}
                  href={`/store/${p.slug}`}
                  className="group block"
                >
                  <div className="overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:border-purple-accent/30">
                    <div className="relative aspect-square bg-deep-purple overflow-hidden">
                      {p.images[0] ? (
                        <Image
                          src={p.images[0].url}
                          alt={p.name}
                          fill
                          sizes="(max-width: 640px) 50vw, 25vw"
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-text">
                          <Package className="h-8 w-8" />
                        </div>
                      )}
                      {pSale.percent > 0 && (
                        <span className="absolute right-2 top-2 rounded-full bg-danger px-2 py-0.5 text-xs font-bold text-white">
                          -{pSale.percent}%
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="mb-1 text-sm font-medium text-white line-clamp-1 group-hover:text-purple-accent transition-colors">
                        {p.nameAr || p.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-purple-accent">
                          {formatPrice(pSale.final)}
                        </span>
                        {pSale.was !== null && (
                          <span className="text-xs text-gray-text line-through">
                            {formatPrice(pSale.was)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
