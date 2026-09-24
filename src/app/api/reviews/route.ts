import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

function json(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(data, { status });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const product_id = searchParams.get("product_id");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const skip = (page - 1) * limit;

    if (!product_id) {
      return json({ success: false, error: "product_id is required" }, 400);
    }

    const where = {
      productId: product_id,
      status: "APPROVED" as const,
    };

    const [reviews, total, stats] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.review.count({ where }),
      prisma.review.aggregate({
        where,
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    const ratingDistribution = await prisma.review.groupBy({
      by: ["rating"],
      where,
      _count: { rating: true },
    });

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const entry of ratingDistribution) {
      distribution[entry.rating] = entry._count.rating;
    }

    return json({
      success: true,
      data: reviews,
      stats: {
        average_rating: stats._avg.rating ? Math.round(stats._avg.rating * 10) / 10 : 0,
        total_reviews: stats._count.rating,
        distribution,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Reviews GET error:", error);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return json({ success: false, error: "Unauthorized" }, 401);
    }

    const body = await req.json();
    const { product_id, rating, comment } = body;

    if (!product_id) {
      return json({ success: false, error: "product_id is required" }, 400);
    }

    if (!rating || rating < 1 || rating > 5) {
      return json({ success: false, error: "Rating must be between 1 and 5" }, 400);
    }

    const product = await prisma.product.findUnique({ where: { id: product_id } });
    if (!product) {
      return json({ success: false, error: "Product not found" }, 404);
    }

    const existingReview = await prisma.review.findFirst({
      where: { userId: session.id, productId: product_id },
    });
    if (existingReview) {
      return json({ success: false, error: "You have already reviewed this product" }, 400);
    }

    const hasPurchased = await prisma.orderItem.findFirst({
      where: {
        productId: product_id,
        order: {
          userId: session.id,
          status: { in: ["PAID", "PROCESSING", "COMPLETED"] },
        },
      },
    });

    const review = await prisma.review.create({
      data: {
        userId: session.id,
        productId: product_id,
        rating: Math.round(rating),
        comment: comment || null,
        status: hasPurchased ? "APPROVED" : "PENDING",
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    return json({ success: true, data: review }, 201);
  } catch (error) {
    console.error("Review POST error:", error);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}
