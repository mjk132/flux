"use client";

import Link from "next/link";
import { Heart, ShoppingCart, Star, Flame } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { useToast } from "@/components/ui/toast";
import { cn, formatPrice } from "@/lib/utils";
import { getSalePrice } from "@/lib/pricing";
import { ProductVisual } from "./product-visual";

export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  nameAr?: string | null;
  price: number;
  comparePrice?: number | null;
  discount?: number;
  stock: number;
  shortDescription?: string | null;
  productType?: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  createdAt?: string | Date;
  category?: { name?: string; nameAr?: string | null; slug?: string } | null;
  images?: { url: string; alt?: string | null }[];
  reviews?: { rating: number }[];
  averageRating?: number;
  salesCount?: number;
}

interface ProductCardProps {
  product: ProductCardData;
  className?: string;
}

/**
 * Card structure: a plain <article> whose title link owns a stretched
 * ::after overlay that makes the whole card clickable. Interactive
 * controls (wishlist, add-to-cart) are siblings ABOVE that overlay —
 * buttons never nest inside the link (invalid HTML + double activation).
 * Signal budget is deliberate: category, name, rating (only if real),
 * one description line, price, one action. Availability only shows when
 * it's a problem (out of stock).
 */
export function ProductCard({ product, className }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const toggle = useWishlistStore((s) => s.toggle);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));
  const { success } = useToast();

  const primaryImage = product.images?.[0];
  // Everything pricing-related comes from the same helper checkout uses.
  const { final: salePrice, was: wasPrice, percent: discountPercent } =
    getSalePrice(product);

  const isNew =
    product.createdAt &&
    new Date().getTime() - new Date(product.createdAt).getTime() <
      7 * 24 * 60 * 60 * 1000;

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
    success("أُضيفت إلى السلة", `${name} — ${formatPrice(salePrice)}`, {
      label: "عرض السلة",
      href: "/cart",
    });
  };

  const handleToggleWishlist = () => {
    toggle(product.id);
    success(isInWishlist ? "أُزيلت من المفضلة" : "أُضيفت إلى المفضلة");
  };

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-surface",
        "transition-all duration-300 hover:-translate-y-1 hover:border-purple-accent/35 hover:shadow-[0_12px_32px_-16px_rgba(47,123,255,0.45)]",
        "focus-within:border-purple-accent/60",
        className
      )}
    >
      {/* Media */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <ProductVisual
          categorySlug={product.category?.slug}
          productName={name}
          imageUrl={primaryImage?.url}
          alt={primaryImage?.alt || name}
          className="transition-transform duration-700 group-hover:scale-[1.06]"
        />

        {/* Badges */}
        <div className="absolute right-3 top-3 z-20 flex flex-col items-end gap-1.5">
          {discountPercent > 0 && (
            <span className="rounded-md bg-danger px-2 py-0.5 text-[11px] font-bold text-white">
              -{discountPercent}%
            </span>
          )}
          {product.isBestSeller && (
            <span className="flex items-center gap-1 rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
              <Flame className="h-3 w-3" />
              الأكثر مبيعاً
            </span>
          )}
          {isNew && !product.isBestSeller && (
            <span className="rounded-md bg-info px-2 py-0.5 text-[10px] font-bold text-white">
              جديد
            </span>
          )}
          {outOfStock && (
            <span className="rounded-md bg-void/85 px-2 py-0.5 text-[10px] font-bold text-white ring-1 ring-white/20">
              نفد المخزون
            </span>
          )}
        </div>

        {/* Wishlist — above the stretched link overlay */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className={cn(
            "absolute left-3 top-3 z-20 rounded-full p-2 transition-all duration-200",
            isInWishlist
              ? "bg-danger/20 text-danger"
              : "bg-void/50 text-gray-text backdrop-blur-sm hover:text-white sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
          )}
          aria-pressed={isInWishlist}
          aria-label={
            isInWishlist
              ? `إزالة ${name} من المفضلة`
              : `إضافة ${name} إلى المفضلة`
          }
        >
          <Heart className={cn("h-4 w-4", isInWishlist && "fill-current")} />
        </button>

        {/* Bottom fade for readability */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-surface to-transparent" />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <span className="text-[11px] font-semibold text-gray-muted">
          {product.category?.nameAr || product.category?.name || "FLUX"}
        </span>

        {/* Name — owns the stretched overlay, so clicking anywhere on the
            card opens the product page */}
        <h3 className="mt-1 line-clamp-1 text-[15px] font-bold text-white">
          <Link
            href={`/store/${product.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-[-4px] focus-visible:after:outline-purple-accent"
          >
            {name}
          </Link>
        </h3>

        {/* Rating — only when real reviews exist */}
        {avgRating > 0 && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3 w-3",
                    i <= Math.round(avgRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-faint"
                  )}
                />
              ))}
            </div>
            <span className="text-[11px] text-gray-muted">
              {avgRating.toFixed(1)}
              {ratingCount > 0 && ` (${ratingCount})`}
            </span>
          </div>
        )}

        {/* Description */}
        {product.shortDescription && (
          <p className="mt-1.5 line-clamp-1 text-[12px] text-gray-text">
            {product.shortDescription}
          </p>
        )}

        {/* Price */}
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-3">
          <span className="text-[18px] font-extrabold text-white">
            {formatPrice(salePrice)}
          </span>
          {wasPrice !== null && (
            <span className="text-[12px] text-gray-muted line-through">
              {formatPrice(wasPrice)}
            </span>
          )}
        </div>

        {/* Action — above the stretched link overlay */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={outOfStock}
          className={cn(
            "relative z-20 mt-3 flex h-10 items-center justify-center gap-1.5 rounded-lg text-[13px] font-semibold transition-all duration-200 active:scale-[0.98]",
            outOfStock
              ? "cursor-not-allowed border border-border text-gray-muted"
              : "bg-purple-accent text-white hover:bg-violet hover:shadow-[0_0_16px_rgba(47,123,255,0.35)]"
          )}
        >
          <ShoppingCart className="h-4 w-4" />
          {outOfStock ? "نفد المخزون" : "أضف للسلة"}
        </button>
      </div>
    </article>
  );
}
