"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/store/product-grid";
import type { ProductCardData } from "@/components/store/product-card";

interface Product {
  id: string;
  name: string;
  nameAr: string | null;
  slug: string;
  price: number;
  comparePrice?: number | null;
  discount: number;
  stock: number;
  shortDescription?: string | null;
  productType: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  images: { url: string; alt: string | null }[];
  category: { name: string; nameAr?: string | null; slug: string };
  averageRating: number;
}

interface Category {
  id: string;
  name: string;
  nameAr: string | null;
  slug: string;
  _count: { products: number };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const SORT_OPTIONS = [
  { value: "newest", label: "الأحدث" },
  { value: "price-asc", label: "السعر: من الأقل للأعلى" },
  { value: "price-desc", label: "السعر: من الأعلى للأقل" },
  { value: "best-selling", label: "الأكثر مبيعاً" },
];

const PRODUCT_TYPES = [
  { value: "DIGITAL", label: "رقمي" },
  { value: "SERVICE", label: "خدمة" },
  { value: "SUBSCRIPTION", label: "اشتراك" },
];

export default function StorePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-accent border-t-transparent" /></div>}>
      <StoreContent />
    </Suspense>
  );
}

function StoreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentSort = searchParams.get("sort") || "newest";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentProductType = searchParams.get("productType") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const [searchInput, setSearchInput] = useState(currentSearch);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentSearch) params.set("search", currentSearch);
      if (currentCategory) params.set("category", currentCategory);
      if (currentSort) params.set("sort", currentSort);
      if (currentMinPrice) params.set("minPrice", currentMinPrice);
      if (currentMaxPrice) params.set("maxPrice", currentMaxPrice);
      if (currentProductType) params.set("productType", currentProductType);
      params.set("page", currentPage.toString());
      params.set("limit", "12");

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);
      setPagination(data.pagination || null);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [currentSearch, currentCategory, currentSort, currentMinPrice, currentMaxPrice, currentProductType, currentPage]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/store?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams("search", searchInput.trim());
  };

  const clearFilters = () => {
    router.push("/store");
    setSearchInput("");
  };

  const hasFilters =
    currentCategory || currentMinPrice || currentMaxPrice || currentProductType;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Search & Sort Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="flex gap-2 sm:max-w-md">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-text" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="ابحث في المتجر..."
              className="h-10 w-full rounded-lg border border-border bg-surface pr-10 pl-4 text-sm text-white placeholder:text-gray-text/60 focus:border-purple-accent focus:outline-none"
            />
          </div>
          <Button type="submit" size="sm">
            بحث
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-gray-text transition-colors hover:bg-surface hover:text-white md:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            الفلاتر
          </button>

          <select
            value={currentSort}
            onChange={(e) => updateParams("sort", e.target.value)}
            className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-white focus:border-purple-accent focus:outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <aside
          className={`w-64 shrink-0 ${
            showFilters ? "block" : "hidden"
          } md:block`}
        >
          <div className="sticky top-20 space-y-6">
            {/* Categories */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-white">الأقسام</h3>
              <div className="space-y-1">
                <button
                  onClick={() => updateParams("category", "")}
                  className={`block w-full rounded-lg px-3 py-2 text-right text-sm transition-colors ${
                    !currentCategory
                      ? "bg-purple-accent text-white"
                      : "text-gray-text hover:bg-surface hover:text-white"
                  }`}
                >
                  جميع المنتجات
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateParams("category", cat.slug)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-right text-sm transition-colors ${
                      currentCategory === cat.slug
                        ? "bg-purple-accent text-white"
                        : "text-gray-text hover:bg-surface hover:text-white"
                    }`}
                  >
                    <span>{cat.nameAr || cat.name}</span>
                    <span className="text-xs opacity-60">
                      {cat._count.products}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-white">
                نطاق السعر
              </h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="الحد الأدنى"
                  value={currentMinPrice}
                  onChange={(e) => updateParams("minPrice", e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm text-white placeholder:text-gray-text/60 focus:border-purple-accent focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="الحد الأقصى"
                  value={currentMaxPrice}
                  onChange={(e) => updateParams("maxPrice", e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm text-white placeholder:text-gray-text/60 focus:border-purple-accent focus:outline-none"
                />
              </div>
            </div>

            {/* Product Type */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-white">
                نوع المنتج
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => updateParams("productType", "")}
                  className={`block w-full rounded-lg px-3 py-2 text-right text-sm transition-colors ${
                    !currentProductType
                      ? "bg-purple-accent text-white"
                      : "text-gray-text hover:bg-surface hover:text-white"
                  }`}
                >
                  جميع الأنواع
                </button>
                {PRODUCT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => updateParams("productType", type.value)}
                    className={`block w-full rounded-lg px-3 py-2 text-right text-sm transition-colors ${
                      currentProductType === type.value
                        ? "bg-purple-accent text-white"
                        : "text-gray-text hover:bg-surface hover:text-white"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-gray-text transition-colors hover:bg-surface hover:text-white"
              >
                <X className="h-4 w-4" />
                مسح الفلاتر
              </button>
            )}
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="mb-3 aspect-square rounded-xl bg-deep-purple" />
                  <div className="mb-2 h-4 w-3/4 rounded bg-deep-purple" />
                  <div className="h-3 w-1/2 rounded bg-deep-purple" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Package className="mb-4 h-12 w-12 text-gray-text" />
              <h3 className="mb-2 text-lg font-medium text-white">
                لا توجد منتجات
              </h3>
              <p className="mb-4 text-sm text-gray-text">
                {currentSearch
                  ? "لم يتم العثور على نتائج مطابقة لبحثك"
                  : "لم يتم العثور على منتجات في هذا القسم"}
              </p>
              {hasFilters && (
                <Button variant="secondary" onClick={clearFilters}>
                  مسح الفلاتر
                </Button>
              )}
            </div>
          ) : (
            <>
              <ProductGrid products={products} />

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      const total = pagination.totalPages;
                      const cur = pagination.page;
                      return p === 1 || p === total || Math.abs(p - cur) <= 1;
                    })
                    .reduce<(number | "...")[]>((acc, p, i, arr) => {
                      if (i > 0 && p - (arr[i - 1] as number) > 1) {
                        acc.push("...");
                      }
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === "..." ? (
                        <span
                          key={`dots-${i}`}
                          className="flex h-9 w-9 items-center justify-center text-gray-text"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => updateParams("page", p.toString())}
                          className={`flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors ${
                            currentPage === p
                              ? "bg-purple-accent text-white"
                              : "text-gray-text hover:bg-surface hover:text-white"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
