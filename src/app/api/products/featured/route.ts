import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      where: {
        isFeatured: true,
        status: "PUBLISHED",
      },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        category: { select: { id: true, name: true, slug: true } },
        reviews: {
          where: { status: "APPROVED" },
          select: { rating: true },
        },
      },
    });

    const productsWithRating = products.map((product) => {
      const ratings = product.reviews.map((r) => r.rating);
      const averageRating =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
          : 0;

      const { reviews: _, ...rest } = product;
      return { ...rest, averageRating: Math.round(averageRating * 10) / 10 };
    });

    return Response.json(productsWithRating);
  } catch (error) {
    console.error("GET /api/products/featured error:", error);
    return Response.json(
      { error: "Failed to fetch featured products" },
      { status: 500 }
    );
  }
}
