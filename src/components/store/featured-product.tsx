"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ShoppingCart, Star } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useToast } from "@/components/ui/toast";
import { cn, formatPrice } from "@/lib/utils";
import { getSalePrice } from "@/lib/pricing";
import { ProductVisual } from "./product-visual";
import type { ProductCardData } from "./product-card";

/**
 * Single-product inventory earns a full-width featured band instead of a
 * lone card stranded in a four-column grid. Media leads (right side in
 * RTL), the body carries the same signal budget as the card — category,
 * name, real rating only, description, price through the shared pricing
 * helper — and the same stretched-link structure: the whole band opens
 * the product, the add-to-cart button sits above the overlay.
 */
export function FeaturedProduct({ product }: { product: ProductCardData }) {
  const addItem = useCartStore((s) => s.addItem);
  const { success } = useToast();
  const [added, setAdded] = useState(false);

  const primaryImage = product.images?.[0];
  const { final: salePrice, was: wasPrice, percent: discountPercent } =
    getSalePrice(product);

  const outOfStock = product.stock <= 0;
  const name = product.nameAr || product.name;

  const reviews = product.reviews || [];
  const avgRating =
    product.averageRating ??
    (reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0);
  const ratingCount = reviews.length;

  const handleAddToCart = () => {
    if (outOfStock) return;
    addItem({
      productId: product.id,
      name,
      price: salePrice,
      image: primaryImage?.url || "/logo.png",
      stock: product.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    success("أُضيفت إلى السلة", `${name} — ${formatPrice(salePrice)}`, {
      label: "عرض السلة",
      href: "/cart",
    });
  };

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border/60 bg-surface transition-[border-color,box-shadow] duration-300 hover:border-purple-accent/35 hover:shadow-[0_16px_44px_-22px_rgba(47,123,255,0.45)] focus-within:border-purple-accent/60">
      <div className="grid sm:grid-cols-[1.1fr_1fr]">
        {/* Media — real render (or generated category art when there is none) */}
        <div className="relative aspect-[4/3] overflow-hidden border-b border-border/40 sm:aspect-auto sm:min-h-[380px] sm:border-b-0 sm:border-l">
          <ProductVisual
            categorySlug={product.category?.slug}
            productName={name}
            imageUrl={primaryImage?.url}
            alt={primaryImage?.alt || name}
            className="transition-transform duration-700 group-hover:scale-[1.04]"
          />

          <div className="absolute right-3 top-3 z-20 flex flex-col items-end gap-1.5">
            {discountPercent > 0 && (
              <span className="rounded-md bg-danger px-2 py-0.5 text-[11px] font-bold text-white">
                -{discountPercent}%
              </span>
            )}
            {outOfStock && (
              <span className="rounded-md bg-void/85 px-2 py-0.5 text-[11px] font-bold text-white ring-1 ring-white/20">
                نفد المخزون
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col p-5 sm:p-7 lg:p-8">
          <span className="text-[12px] font-semibold text-gray-muted">
            {product.category?.nameAr || product.category?.name || "FLUX"}
          </span>

          <h3 className="mt-2 text-xl font-extrabold text-white sm:text-2xl">
            <Link
              href={`/store/${product.slug}`}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-[-4px] focus-visible:after:outline-purple-accent"
            >
              {name}
            </Link>
          </h3>

          {avgRating > 0 && (
            <div className="mt-2 flex items-center gap-1.5">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3.5 w-3.5",
                      i <= Math.round(avgRating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-faint"
                    )}
                  />
                ))}
              </div>
              <span className="text-[12px] tabular-nums text-gray-muted">
                {avgRating.toFixed(1)}
                {ratingCount > 0 && ` (${ratingCount})`}
              </span>
            </div>
          )}

          {product.shortDescription && (
            <p className="mt-3 max-w-prose text-[14px] leading-relaxed text-gray-text">
              {product.shortDescription}
            </p>
          )}

          <div className="mt-auto pt-6">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-[30px] font-extrabold tabular-nums leading-none text-white">
                {formatPrice(salePrice)}
              </span>
              {wasPrice !== null && (
                <span className="text-[14px] tabular-nums text-gray-muted line-through">
                  {formatPrice(wasPrice)}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={outOfStock}
              className={cn(
                "relative z-20 mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-lg px-7 text-[14px] font-bold transition-[background-color,box-shadow,transform] duration-200 active:scale-[0.98]",
                outOfStock
                  ? "cursor-not-allowed border border-border text-gray-muted"
                  : added
                    ? "bg-accent-solid text-white"
                    : "bg-accent-solid text-white hover:bg-[#1554c9] hover:shadow-[0_10px_28px_-12px_rgba(47,123,255,0.55)]"
              )}
            >
              {added ? (
                <Check className="h-4 w-4" />
              ) : (
                <ShoppingCart className="h-4 w-4" />
              )}
              {outOfStock ? "نفد المخزون" : added ? "تمت الإضافة" : "أضف للسلة"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
