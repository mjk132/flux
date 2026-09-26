import { prisma } from "@/lib/prisma";
import { getSalePrice } from "@/lib/pricing";

export interface CatalogParams {
  page?: string | number | null;
  limit?: string | number | null;
  category?: string | null;
  minPrice?: string | null;
  maxPrice?: string | null;
  productType?: string | null;
  status?: string | null;
  search?: string | null;
  sort?: string | null;
}

/**
 * Single source of truth for storefront product queries, shared by
 * GET /api/products (the client-side filter flow) and the server-rendered
 * /store page (first paint + SEO). Keeping the effective-price
 * filtering/sorting (lib/pricing) in ONE place guarantees the two paths
 * can never disagree about what a filter or sort means.
 */
export async function queryCatalog(params: CatalogParams) {
  const page = Math.max(1, parseInt(String(params.page ?? "1"), 10) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(String(params.limit ?? "20"), 10) || 20)
  );
  const skip = (page - 1) * limit;

  const { category, minPrice, maxPrice, productType, status, search } = params;
  const sort = params.sort || "newest";

  const where: Record<string, unknown> = {};

  if (category) {
    where.category = { slug: category };
  }

  const priceMin = minPrice ? parseFloat(minPrice) : null;
  const priceMax = maxPrice ? parseFloat(maxPrice) : null;

  /* `price` is the catalogue price, but the card displays — and checkout
     charges — that price minus the product's own discount (lib/pricing).
     Filtering or sorting on the catalogue column would therefore disagree
     with what is on screen: a $20 product at 50% off reads as $10 in the
     grid yet would be skipped by a "max $15" filter, and would sort after
     a plain $15 product. So any price criteria are applied to the
     effective price below.

     The catalogue minimum stays in the SQL query as a safe pre-filter:
     the effective price can never exceed the catalogue price, so no
     matching row can be lost by it. */
  const needsEffectivePrice =
    priceMin !== null ||
    priceMax !== null ||
    sort === "price-asc" ||
    sort === "price-desc";

  if (priceMin !== null) {
    where.price = { gte: priceMin };
  }

  if (productType) {
    where.productType = productType;
  }

  if (status) {
    where.status = status;
  } else {
    where.status = "PUBLISHED";
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { nameAr: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { tags: { contains: search, mode: "insensitive" } },
    ];
  }

  let orderBy: Record<string, string>;
  switch (sort) {
    case "price-asc":
      orderBy = { price: "asc" };
      break;
    case "price-desc":
      orderBy = { price: "desc" };
      break;
    case "best-selling":
      orderBy = { createdAt: "desc" };
      break;
    case "newest":
    default:
      orderBy = { createdAt: "desc" };
      break;
  }

  let products;
  let total: number;

  if (needsEffectivePrice) {
    const candidates = await prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        category: {
          select: { id: true, name: true, nameAr: true, slug: true },
        },
        reviews: {
          where: { status: "APPROVED" },
          select: { rating: true },
        },
      },
    });

    const ranked = candidates
      .map((product) => ({ product, effective: getSalePrice(product).final }))
      .filter(
        ({ effective }) =>
          (priceMin === null || effective >= priceMin) &&
          (priceMax === null || effective <= priceMax)
      );

    ranked.sort((a, b) =>
      sort === "price-asc"
        ? a.effective - b.effective
        : b.effective - a.effective
    );

    total = ranked.length;
    products = ranked.slice(skip, skip + limit).map((r) => r.product);
  } else {
    [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
          category: {
            select: { id: true, name: true, nameAr: true, slug: true },
          },
          reviews: {
            where: { status: "APPROVED" },
            select: { rating: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);
  }

  const productsWithRating = products.map((product) => {
    const { reviews, ...rest } = product;
    const ratings = reviews.map((r) => r.rating);
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : 0;

    return { ...rest, averageRating: Math.round(averageRating * 10) / 10 };
  });

  return {
    products: productsWithRating,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
