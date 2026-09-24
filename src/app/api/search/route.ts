import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function json(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(data, { status });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const minPrice = parseFloat(searchParams.get("min_price") || "0");
    const maxPrice = parseFloat(searchParams.get("max_price") || "0");
    const sort = searchParams.get("sort") || "newest";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      status: "PUBLISHED",
    };

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { tags: { has: q } },
        { nameAr: { contains: q, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    if (minPrice > 0 || maxPrice > 0) {
      const priceFilter: Record<string, number> = {};
      if (minPrice > 0) priceFilter.gte = minPrice;
      if (maxPrice > 0) priceFilter.lte = maxPrice;
      where.price = priceFilter;
    }

    let orderBy: Record<string, string>;
    switch (sort) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "name":
        orderBy = { name: "asc" };
        break;
      case "popular":
        orderBy = { isBestSeller: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { select: { url: true, alt: true }, take: 1, orderBy: { sortOrder: "asc" } },
          _count: { select: { reviews: true, orderItems: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return json({
      success: true,
      data: products,
      query: q,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Search GET error:", error);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}
