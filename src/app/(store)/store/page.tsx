import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { queryCatalog } from "@/lib/catalog";
import { StorePage, type StoreInitial, type Product } from "./store-content";

/* /store used to be a "use client" page: crawlers received a spinner and
   the first paint was empty HTML. It is now a server component that
   renders the first result set into real HTML (title, cards, prices),
   while store-content.tsx keeps all filter/sort/search interactivity. */
export const metadata: Metadata = {
  title: "المتجر — منتجات رقمية جاهزة | FLUX",
  description:
    "بوتات ديسكورد، سكربتات FiveM، مواقع وخدمات رقمية جاهزة — تصفّح وفلترة حسب السعر والنوع، والدفع عبر PayPal.",
};

type SpValue = string | string[] | undefined;

function first(value: SpValue): string {
  return typeof value === "string" ? value : "";
}

type CatalogProduct = Awaited<ReturnType<typeof queryCatalog>>["products"][number];

/** Shape the client store expects (and the JSON API has always returned). */
function mapProduct(p: CatalogProduct): Product {
  return {
    id: p.id,
    name: p.name,
    nameAr: p.nameAr,
    slug: p.slug,
    price: p.price,
    comparePrice: p.comparePrice,
    discount: p.discount ?? 0,
    stock: p.stock,
    shortDescription: p.shortDescription,
    productType: p.productType,
    isFeatured: p.isFeatured,
    isBestSeller: p.isBestSeller,
    images: p.images,
    category: {
      name: p.category.name,
      nameAr: p.category.nameAr,
      slug: p.category.slug,
    },
    averageRating: p.averageRating,
  };
}

export default async function StoreRoute({
  searchParams,
}: {
  searchParams: Promise<Record<string, SpValue>>;
}) {
  const sp = await searchParams;

  const [catalog, categories] = await Promise.all([
    queryCatalog({
      page: first(sp.page) || null,
      limit: "12",
      category: first(sp.category) || null,
      minPrice: first(sp.minPrice) || null,
      maxPrice: first(sp.maxPrice) || null,
      productType: first(sp.productType) || null,
      search: first(sp.search) || null,
      sort: first(sp.sort) || null,
    }),
    prisma.category.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        nameAr: true,
        slug: true,
        _count: {
          select: { products: { where: { status: "PUBLISHED" } } },
        },
      },
    }),
  ]);

  const params: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    const val = first(v);
    if (val) params[k] = val;
  }

  const initial: StoreInitial = {
    products: catalog.products.map(mapProduct),
    categories,
    pagination: catalog.pagination,
    params,
  };

  return <StorePage initial={initial} />;
}
