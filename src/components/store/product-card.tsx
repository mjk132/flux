"use client";

import Link from "next/link";
import {
  Heart,
  ShoppingCart,
  Star,
  Zap,
  Eye,
  Flame,
} from "lucide-react";
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

export function ProductCard({ product, className }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const toggle = useWishlistStore((s) => s.toggle);
  const isInWishlist = useWishlistStore((s) => s.isInWishlist(product.id));
  const { success } = useToast();

  const primaryImage = product.images?.[0];
  // The card previously showed `price` untouched while still printing the
  // discount badge, so a 50%-off product looked like it cost full price.
  // Everything now comes from the same helper checkout uses.
  const { final: salePrice, was: wasPrice, percent: discountPercent } =
    getSalePrice(product);

  const isNew =
    product.createdAt &&
    new Date().getTime() - new Date(product.createdAt).getTime() <
      7 * 24 * 60 * 60 * 1000;

  const outOfStock = product.stock <= 0;

  const reviews = product.reviews || [];
  const avgRating =
    product.averageRating ??
    (reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0);
  const ratingCount = reviews.length;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: salePrice,
      image: primaryImage?.url || "/logo.png",
    });
    success("تمت الإضافة إلى السلة");
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
    success(isInWishlist ? "أُزيلت من المفضلة" : "أُضيفت إلى المفضلة");
  };

  return (
    <Link
      href={`/store/${product.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-surface",
        "transition-all duration-300 hover:-translate-y-1 hover:border-purple-accent/35 hover:shadow-[0_12px_40px_-12px_rgba(124,58,237,0.25)]",
        className
      )}
    >
      {/* Media */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <ProductVisual
          categorySlug={product.category?.slug}
          productName={product.nameAr || product.name}
          imageUrl={primaryImage?.url}
          alt={primaryImage?.alt || product.name}
          className="transition-transform duration-700 group-hover:scale-[1.06]"
        />

        {/* Badges */}
        <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
          {discountPercent > 0 && (
            <span className="rounded-md bg-danger px-2 py-0.5 text-[11px] font-bold text-white shadow-lg shadow-danger/20">
              -{discountPercent}%
            </span>
          )}
          {product.isBestSeller && (
            <span className="flex items-center gap-1 rounded-md bg-gradient-to-l from-amber-500 to-orange-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg shadow-amber-500/20">
              <Flame className="h-3 w-3" />
              الأكثر مبيعاً
            </span>
          )}
          {isNew && !product.isBestSeller && (
            <span className="rounded-md bg-info px-2 py-0.5 text-[10px] font-bold text-white">
              جديد
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleToggleWishlist}
          className={cn(
            "absolute left-3 top-3 rounded-full p-2 transition-all duration-200",
            isInWishlist
              ? "bg-danger/20 text-danger"
              : "bg-void/50 text-gray-text backdrop-blur-sm hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
          )}
          aria-label="إضافة للمفضلة"
        >
          <Heart className={cn("h-4 w-4", isInWishlist && "fill-current")} />
        </button>

        {/* Bottom fade for readability */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-surface to-transparent" />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        {/* Meta row */}
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-muted">
            {product.category?.nameAr || product.category?.name || "Flux"}
          </span>
          <span
            className={cn(
              "flex items-center gap-1 text-[11px] font-medium",
              outOfStock ? "text-danger" : "text-success"
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                outOfStock ? "bg-danger" : "bg-success"
              )}
            />
            {outOfStock ? "نفذ المخزون" : "متوفر الآن"}
          </span>
        </div>

        {/* Name */}
        <h3 className="line-clamp-1 text-[15px] font-bold text-white">
          {product.nameAr || product.name}
        </h3>

        {/* Rating */}
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

        {/* Sales count (real) */}
        {!!product.salesCount && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[11px] font-medium text-gray-text">
              {product.salesCount} عملية بيع
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
        <div className="mt-3 flex flex-1 items-end justify-between">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-[18px] font-extrabold tracking-tight text-white">
              {formatPrice(salePrice)}
            </span>
            {wasPrice !== null && (
              <span className="text-[12px] text-gray-muted line-through">
                {formatPrice(wasPrice)}
              </span>
            )}
          </div>
          {product.productType === "DIGITAL" && !outOfStock && (
            <span className="flex items-center gap-1 text-[10.5px] font-medium text-purple-accent">
              <Zap className="h-3 w-3" />
              تسليم فوري
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-3.5 grid grid-cols-[1fr_auto] gap-2">
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className={cn(
              "flex h-9 items-center justify-center gap-1.5 rounded-lg text-[12.5px] font-semibold transition-all duration-200 active:scale-95",
              outOfStock
                ? "cursor-not-allowed border border-border text-gray-muted"
                : "bg-purple-accent text-white hover:bg-violet hover:shadow-[0_0_18px_rgba(124,58,237,0.35)]"
            )}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            أضف للسلة
          </button>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 text-gray-text transition-colors group-hover:border-purple-accent/40 group-hover:text-white">
            <Eye className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
