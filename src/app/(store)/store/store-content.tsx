"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  X,
  Package,
  ChevronRight,
  ChevronLeft,
  Check,
  SearchX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ProductGrid } from "@/components/store/product-grid";
import { cn } from "@/lib/utils";
import type { ProductCardData } from "@/components/store/product-card";

export interface Product {
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

export interface Category {
  id: string;
  name: string;
  nameAr: string | null;
  slug: string;
  _count: { products: number };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Server-rendered first paint, passed down from the (server) page. */
export interface StoreInitial {
  products: Product[];
  categories: Category[];
  pagination: Pagination;
  /** All non-empty query params of the current URL, parsed server-side.
      The client reads filters from here instead of useSearchParams(),
      which suspends during SSR and reduced /store to a spinner. */
  params: Record<string, string>;
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

/**
 * The interactive half of /store. The SERVER page (page.tsx) renders the
 * first result set into HTML via `initial` — crawlers see real products
 * and the first paint is content, not a spinner — while every subsequent
 * filter/sort/page change still goes through the client fetch as before.
 */
export function StorePage({ initial }: { initial?: StoreInitial }) {
  return <StoreContent initial={initial} />;
}

/** Grouped filter block with a consistent header + divider rhythm. */
function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-border/60 pt-4 first:border-0 first:pt-0 first:mt-0 mt-4">
      <h3 className="mb-2.5 text-[12px] font-bold text-gray-muted">
        {title}
      </h3>
      {children}
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-surface">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-2.5 w-14" />
          <Skeleton className="h-2.5 w-16" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function StoreContent({ initial }: { initial?: StoreInitial }) {
  const router = useRouter();

  /* Query params arrive as server props (see StoreInitial) — never from
     useSearchParams(), which suspends during SSR. */
  const routeParams = initial?.params ?? {};

  /* State starts from the server-rendered result set so hydration matches
     the HTML exactly; empty state (and a fetch) only when there is none. */
  const [products, setProducts] = useState<Product[]>(initial?.products ?? []);
  const [categories, setCategories] = useState<Category[]>(
    initial?.categories ?? []
  );
  const [pagination, setPagination] = useState<Pagination | null>(
    initial?.pagination ?? null
  );
  const [loading, setLoading] = useState(!initial);
  const [showFilters, setShowFilters] = useState(false);

  const currentSearch = routeParams.search || "";
  const currentCategory = routeParams.category || "";
  const currentSort = routeParams.sort || "newest";
  const currentMinPrice = routeParams.minPrice || "";
  const currentMaxPrice = routeParams.maxPrice || "";
  const currentProductType = routeParams.productType || "";
  const currentPage = parseInt(routeParams.page || "1", 10);

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice);

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
  }, [
    currentSearch,
    currentCategory,
    currentSort,
    currentMinPrice,
    currentMaxPrice,
    currentProductType,
    currentPage,
  ]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    }
  }, []);

  /* First paint arrives via server props, and the server page re-renders
     for every filter/sort/page navigation — so adopting `initial` here
     replaces the old client refetch entirely. The fetch paths stay as the
     fallback for the no-props (client-only) case. */
  useEffect(() => {
    if (initial) {
      setProducts(initial.products);
      setPagination(initial.pagination);
      setLoading(false);
      return;
    }
    fetchProducts();
  }, [fetchProducts, initial]);

  useEffect(() => {
    if (initial) {
      setCategories(initial.categories);
      return;
    }
    fetchCategories();
  }, [fetchCategories, initial]);

  const buildStoreUrl = (overrides: Record<string, string>) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(routeParams)) {
      if (v) params.set(k, v);
    }
    for (const [k, v] of Object.entries(overrides)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    return `/store?${params.toString()}`;
  };

  const updateParams = (key: string, value: string) => {
    /* Any filter change resets to page 1 — but a pagination click IS a
       page change and must keep the value it just sets (the old code
       unconditionally deleted `page`, so page 2 always bounced back
       to page 1). */
    router.push(
      buildStoreUrl(
        key === "page" ? { page: value } : { [key]: value, page: "" }
      )
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams("search", searchInput.trim());
  };

  const clearFilters = () => {
    router.push("/store");
    setSearchInput("");
    setMinPriceInput("");
    setMaxPriceInput("");
  };

  /** Clears both price bounds in a single navigation (two sequential
   *  updateParams calls would race and restore the first value). */
  const clearPriceRange = () => {
    router.push(buildStoreUrl({ minPrice: "", maxPrice: "", page: "" }));
  };

  // Keep the inputs in sync when the URL changes from outside
  // (clear-all, removing a chip, back/forward navigation).
  useEffect(() => {
    setMinPriceInput(currentMinPrice);
  }, [currentMinPrice]);
  useEffect(() => {
    setMaxPriceInput(currentMaxPrice);
  }, [currentMaxPrice]);

  // Debounce price typing so every keystroke doesn't fire a navigation.
  useEffect(() => {
    const value = minPriceInput.trim();
    if (value === currentMinPrice) return;
    const t = setTimeout(() => updateParams("minPrice", value), 550);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minPriceInput, currentMinPrice]);

  useEffect(() => {
    const value = maxPriceInput.trim();
    if (value === currentMaxPrice) return;
    const t = setTimeout(() => updateParams("maxPrice", value), 550);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxPriceInput, currentMaxPrice]);

  const activeCategory = categories.find((c) => c.slug === currentCategory);
  const activeType = PRODUCT_TYPES.find((t) => t.value === currentProductType);
  const hasFilters = !!(
    currentCategory ||
    currentMinPrice ||
    currentMaxPrice ||
    currentProductType ||
    currentSearch
  );

  const pageTitle = activeCategory
    ? activeCategory.nameAr || activeCategory.name
    : currentSearch
      ? `نتائج البحث عن «${currentSearch}»`
      : "كل المنتجات";

  const pageSubtitle = activeCategory
    ? "تصفح منتجات هذا القسم، مع فلترة حسب السعر والنوع."
    : "بوتات، سكربتات، مواقع وخدمات رقمية — الدفع عبر PayPal والتسليم عبر حسابك.";

  const chips: { label: string; onClear: () => void }[] = [];
  if (currentSearch)
    chips.push({
      label: `بحث: ${currentSearch}`,
      onClear: () => updateParams("search", ""),
    });
  if (activeCategory)
    chips.push({
      label: activeCategory.nameAr || activeCategory.name,
      onClear: () => updateParams("category", ""),
    });
  if (activeType)
    chips.push({ label: activeType.label, onClear: () => updateParams("productType", "") });
  if (currentMinPrice || currentMaxPrice)
    chips.push({
      label: `السعر: ${currentMinPrice || "0"} – ${currentMaxPrice || "∞"}`,
      onClear: clearPriceRange,
    });

  const filterPanel = (
    <div className="rounded-2xl border border-border bg-surface/70 p-4 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[12px] font-bold text-purple-accent">
          الفلاتر
        </span>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-[11px] font-medium text-gray-muted transition-colors hover:text-danger"
          >
            مسح الكل
          </button>
        )}
      </div>

      {/* Categories */}
      <FilterSection title="الأقسام">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => updateParams("category", "")}
            className={cn(
              "flex w-full items-center justify-between rounded-lg px-3 py-2 text-right text-[13px] transition-all duration-200",
              !currentCategory
                ? "bg-purple-accent/10 text-white shadow-[inset_0_0_0_1px_rgba(47,123,255,0.35)]"
                : "text-gray-text hover:bg-deep-purple hover:text-white"
            )}
          >
            <span className="flex items-center gap-2">
              {!currentCategory && (
                <Check className="h-3.5 w-3.5 text-purple-accent" />
              )}
              جميع المنتجات
            </span>
          </button>
          {categories.map((cat) => {
            const active = currentCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => updateParams("category", cat.slug)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-right text-[13px] transition-all duration-200",
                  active
                    ? "bg-purple-accent/10 text-white shadow-[inset_0_0_0_1px_rgba(47,123,255,0.35)]"
                    : "text-gray-text hover:bg-deep-purple hover:text-white"
                )}
              >
                <span className="flex items-center gap-2 truncate">
                  {active && <Check className="h-3.5 w-3.5 shrink-0 text-purple-accent" />}
                  <span className="truncate">{cat.nameAr || cat.name}</span>
                </span>
                <span
                  className={cn(
                    "shrink-0 text-[11px]",
                    active ? "text-purple-accent" : "text-gray-muted"
                  )}
                >
                  {cat._count.products}
                </span>
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Price range */}
      <FilterSection title="نطاق السعر">
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder="من"
            value={minPriceInput}
            onChange={(e) => setMinPriceInput(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-void px-3 text-sm text-white placeholder:text-gray-text/60 focus:border-purple-accent focus:outline-none focus:ring-1 focus:ring-purple-accent/30"
          />
          <span className="h-px w-3 shrink-0 bg-border" />
          <input
            type="number"
            inputMode="numeric"
            placeholder="إلى"
            value={maxPriceInput}
            onChange={(e) => setMaxPriceInput(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-void px-3 text-sm text-white placeholder:text-gray-text/60 focus:border-purple-accent focus:outline-none focus:ring-1 focus:ring-purple-accent/30"
          />
        </div>
      </FilterSection>

      {/* Product type */}
      <FilterSection title="نوع المنتج">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateParams("productType", "")}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-all duration-200",
              !currentProductType
                ? "border-purple-accent/50 bg-purple-accent/10 text-white"
                : "border-border text-gray-text hover:border-purple-accent/40 hover:text-white"
            )}
          >
            الكل
          </button>
          {PRODUCT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => updateParams("productType", type.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-all duration-200",
                currentProductType === type.value
                  ? "border-purple-accent/50 bg-purple-accent/10 text-white"
                  : "border-border text-gray-text hover:border-purple-accent/40 hover:text-white"
              )}
            >
              {type.label}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
      {/* ── Page header ── */}
      <header className="border-b border-border/50 pb-7 pt-10">
        <p className="mb-2.5 flex items-center gap-2 text-[12px] font-bold text-purple-accent">
          <span className="h-px w-6 bg-purple-accent/60" />
          تصفّح حسب احتياجك
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
              {pageTitle}
            </h1>
            <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-gray-text">
              {pageSubtitle}
            </p>
          </div>
          {!loading && pagination && (
            <p className="text-[13px] text-gray-muted">
              <span className="font-bold text-white">{pagination.total}</span>{" "}
              منتج متاح
            </p>
          )}
        </div>

        {/* Active filter chips */}
        {chips.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={chip.onClear}
                className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] font-medium text-gray-text transition-all duration-200 hover:border-danger/40 hover:text-danger"
              >
                {chip.label}
                <X className="h-3 w-3 opacity-60 transition-opacity group-hover:opacity-100" />
              </button>
            ))}
            <button
              type="button"
              onClick={clearFilters}
              className="text-[12px] font-medium text-purple-accent transition-colors hover:text-violet"
            >
              مسح الكل
            </button>
          </div>
        )}
      </header>

      {/* ── Toolbar ── */}
      <div className="sticky top-[68px] z-30 -mx-4 mb-6 border-b border-border/50 bg-void/90 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <form onSubmit={handleSearch} className="flex gap-2 sm:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-text" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="ابحث عن بوت، سكربت، تصميم..."
                className="h-10 w-full rounded-lg border border-border bg-surface pr-10 pl-4 text-sm text-white placeholder:text-gray-text/60 focus:border-purple-accent focus:outline-none focus:ring-1 focus:ring-purple-accent/30"
              />
            </div>
            <Button type="submit" size="sm" className="h-10 px-4">
              بحث
            </Button>
          </form>

          <div className="flex items-center gap-2.5">
            {!loading && pagination && (
              <span className="hidden text-[12.5px] text-gray-muted lg:inline">
                عرض {products.length} من {pagination.total}
              </span>
            )}

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-[13px] font-medium transition-all duration-200 md:hidden",
                showFilters
                  ? "border-purple-accent/50 bg-purple-accent/10 text-white"
                  : "border-border text-gray-text hover:text-white"
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              الفلاتر
              {hasFilters && (
                <span className="h-1.5 w-1.5 rounded-full bg-purple-accent" />
              )}
            </button>

            <div className="w-[190px]">
              <Select value={currentSort} onValueChange={(v) => updateParams("sort", v)}>
                <SelectTrigger className="h-10" aria-label="ترتيب النتائج">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 pb-16 md:flex-row">
        {/* ── Sidebar filters ── */}
        <aside
          className={cn(
            "w-full shrink-0 md:block md:w-64",
            showFilters ? "block" : "hidden"
          )}
        >
          <div className="md:sticky md:top-[152px]">{filterPanel}</div>
        </aside>

        {/* ── Products ── */}
        <div className="min-w-0 flex-1">
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface">
                <SearchX className="h-7 w-7 text-gray-muted" />
              </div>
              <h3 className="text-lg font-bold text-white">لا توجد نتائج</h3>
              <p className="mb-5 mt-1.5 max-w-sm text-[13.5px] text-gray-text">
                {currentSearch
                  ? "لم نعثر على منتجات مطابقة لبحثك. جرّب كلمة أخرى أو وسّع نطاق السعر."
                  : "لا توجد منتجات مطابقة للفلاتر المختارة حالياً."}
              </p>
              {hasFilters && (
                <Button variant="secondary" onClick={clearFilters}>
                  <Package className="me-2 h-4 w-4" />
                  عرض كل المنتجات
                </Button>
              )}
            </div>
          ) : (
            <>
              <ProductGrid products={products as unknown as ProductCardData[]} />

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <nav
                  aria-label="التنقل بين صفحات المنتجات"
                  className="mt-10 flex items-center justify-center gap-1.5"
                >
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => updateParams("page", String(currentPage - 1))}
                    aria-label="الصفحة السابقة"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-gray-text transition-all duration-200 hover:border-purple-accent/40 hover:text-white disabled:pointer-events-none disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>

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
                          className="flex h-9 w-7 items-center justify-center text-gray-muted"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          type="button"
                          onClick={() => updateParams("page", p.toString())}
                          aria-current={currentPage === p ? "page" : undefined}
                          className={cn(
                            "flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition-all duration-200",
                            currentPage === p
                              ? "bg-purple-accent text-white shadow-[0_6px_18px_-8px_rgba(47,123,255,0.8)]"
                              : "text-gray-text hover:bg-surface hover:text-white"
                          )}
                        >
                          {p}
                        </button>
                      )
                    )}

                  <button
                    type="button"
                    disabled={currentPage >= pagination.totalPages}
                    onClick={() => updateParams("page", String(currentPage + 1))}
                    aria-label="الصفحة التالية"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-gray-text transition-all duration-200 hover:border-purple-accent/40 hover:text-white disabled:pointer-events-none disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
