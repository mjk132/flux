"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Trash2, Package } from "lucide-react";
import { useWishlistStore } from "@/store/wishlist";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { getSalePrice } from "@/lib/pricing";
import { useToast } from "@/components/ui/toast";

interface Product {
  id: string;
  name: string;
  nameAr: string | null;
  slug: string;
  price: number;
  comparePrice?: number | null;
  discount: number;
  images: { url: string }[];
  category: { name: string };
}

export default function WishlistPage() {
  const { items, toggle } = useWishlistStore();
  const addItem = useCartStore((s) => s.addItem);
  const { success } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      if (items.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const results = await Promise.all(
          items.map(async (id) => {
            try {
              const res = await fetch(`/api/products/${id}`);
              const data = await res.json();
              return data;
            } catch {
              return null;
            }
          })
        );
        setProducts(results.filter(Boolean));
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [items]);

  const handleAddToCart = (product: Product) => {
    const name = product.nameAr || product.name;
    const price = getSalePrice(product).final;
    addItem({
      productId: product.id,
      name,
      price,
      image: product.images[0]?.url || "",
    });
    success("أُضيفت إلى السلة", `${name} — ${formatPrice(price)}`, {
      label: "عرض السلة",
      href: "/cart",
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-white">قائمة الأمنيات</h1>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="mb-3 aspect-square rounded-xl bg-deep-purple" />
              <div className="mb-2 h-4 w-3/4 rounded bg-deep-purple" />
              <div className="h-3 w-1/2 rounded bg-deep-purple" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface py-16 text-center">
          <Heart className="mx-auto mb-4 h-12 w-12 text-gray-text" />
          <p className="mb-2 text-lg font-medium text-white">
            قائمة الأمنيات فارغة
          </p>
          <p className="mb-4 text-sm text-gray-text">
            أضف منتجات إلى قائمة الأمنيات للمتابعة لاحقاً
          </p>
          <Link
            href="/store"
            className="text-sm text-purple-accent hover:underline"
          >
            تصفح المتجر
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {products.map((product) => {
            const sale = getSalePrice(product);

            return (
              <div
                key={product.id}
                className="group overflow-hidden rounded-xl border border-border bg-surface"
              >
                <Link href={`/store/${product.slug}`} className="block">
                  <div className="relative aspect-square bg-deep-purple overflow-hidden">
                    {product.images[0] ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-text">
                        <Package className="h-12 w-12" />
                      </div>
                    )}
                    {sale.percent > 0 && (
                      <span className="absolute right-2 top-2 rounded-full bg-danger px-2 py-0.5 text-xs font-bold text-white">
                        -{sale.percent}%
                      </span>
                    )}
                  </div>
                </Link>

                <div className="p-3">
                  <p className="mb-1 text-xs text-purple-accent">
                    {product.category?.name}
                  </p>
                  <Link href={`/store/${product.slug}`}>
                    <h3 className="mb-2 text-sm font-medium text-white line-clamp-1 hover:text-purple-accent transition-colors">
                      {product.nameAr || product.name}
                    </h3>
                  </Link>

                  <div className="mb-3 flex items-center gap-2">
                    <span className="text-sm font-bold text-purple-accent">
                      {formatPrice(sale.final)}
                    </span>
                    {sale.was !== null && (
                      <span className="text-xs text-gray-text line-through">
                        {formatPrice(sale.was)}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 rounded-lg bg-purple-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-violet"
                    >
                      أضف إلى السلة
                    </button>
                    <button
                      onClick={() => toggle(product.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-gray-text transition-colors hover:border-danger hover:text-danger"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
