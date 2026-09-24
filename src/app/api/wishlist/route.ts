import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

function json(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(data, { status });
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return json({ success: false, error: "Unauthorized" }, 401);
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.wishlist.findMany({
        where: { userId: session.id },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              discount: true,
              comparePrice: true,
              productType: true,
              status: true,
              images: { select: { url: true, alt: true }, take: 1, orderBy: { sortOrder: "asc" } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.wishlist.count({ where: { userId: session.id } }),
    ]);

    return json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Wishlist GET error:", error);
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
    const { product_id } = body;

    if (!product_id) {
      return json({ success: false, error: "product_id is required" }, 400);
    }

    const product = await prisma.product.findUnique({
      where: { id: product_id },
      select: { id: true, status: true },
    });

    if (!product) {
      return json({ success: false, error: "Product not found" }, 404);
    }

    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: session.id, productId: product_id } },
    });

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      return json({ success: true, data: { action: "removed", product_id } });
    }

    const item = await prisma.wishlist.create({
      data: {
        userId: session.id,
        productId: product_id,
      },
    });

    return json({ success: true, data: { action: "added", ...item } }, 201);
  } catch (error) {
    console.error("Wishlist POST error:", error);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}
